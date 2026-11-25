import { refreshDevelopmentSummaries, createMapEraRecords, getMapEras, mapWithEraRecords, mapWithoutEraRecords, refreshNPCEraReferences, validateMapEras } from "../components/HistoryGenerator/eras/mapEras";
import type { TLDevelopmentalEra, TLMapEra } from "../definitions/History";
import { applyGeographyChanges } from "../components/atlas/core/geography";
import type { AtlasMapSave } from "../definitions/Atlas";
import { aggregateEconomyTrade, normalizeTradeEntries } from "../components/Util/economy";
import { cityEconomyField, countryEconomyField, sharedEconomyField, validateEconomyValue } from "../components/atlas/core/economyFields";
import {
	initMapsDatabase,
	type MapDatabaseStore,
	type MapScopedStore,
	mapDatabaseStores,
	mapScopedStores,
} from "./connections/mapsDatabase";
import { clearMapCache } from "./mapCache";
import type { MapInf, TLCity, TLCountry, TLNPC } from "../definitions/TerraLogger";
import { refreshCountryEconomies } from "../components/Util/economy";

// biome-ignore lint/suspicious/noExplicitAny: Store determines the record shape.
export async function addDataToStore(storeName: MapDatabaseStore, data: any) {
	const db = await initMapsDatabase();
	await db.add(storeName, data);
}

export async function getFullStore<T = unknown>(
	storeName: MapDatabaseStore,
): Promise<T[]> {
	const db = await initMapsDatabase();
	return db.getAll(storeName) as Promise<T[]>;
}

export async function updateDataInStore(
	storeName: MapDatabaseStore,
	key: IDBValidKey,
	// biome-ignore lint/suspicious/noExplicitAny: Store determines the record shape.
	updatedData: any,
) {
	const db = await initMapsDatabase();
	const tx = db.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);

	if (store.keyPath) {
		await store.put(updatedData);
	} else {
		await store.put(updatedData, key);
	}

	await tx.done;
}

export async function deleteDataFromStore(
	storeName: MapDatabaseStore,
	key: IDBValidKey,
) {
	const db = await initMapsDatabase();
	await db.delete(storeName, key);
}

export async function queryDataFromStore<T = unknown>(
	storeName: MapScopedStore,
	indexName: "mapIdIndex",
	query: IDBValidKey | IDBKeyRange,
): Promise<T[]> {
	const db = await initMapsDatabase();
	return db.getAllFromIndex(storeName, indexName, query) as Promise<T[]>;
}

async function deleteIndexedMapRecords(
	// biome-ignore lint/suspicious/noExplicitAny: Transaction spans all map stores.
	tx: any,
	storeName: MapScopedStore,
	mapId: string,
): Promise<void> {
	const store = tx.objectStore(storeName);
	const keys = await store.index("mapIdIndex").getAllKeys(mapId);
	await Promise.all(keys.map((key: IDBValidKey) => store.delete(key)));
}

export async function deleteEntireMapData(mapId: string): Promise<void> {
	const db = await initMapsDatabase();
	const tx = db.transaction(mapDatabaseStores, "readwrite");

	await Promise.all(
		mapScopedStores.map((storeName) =>
			deleteIndexedMapRecords(tx, storeName, mapId),
		),
	);

	const mapsStore = tx.objectStore("maps");
	const mapKeys = await mapsStore.index("mapIdIndex").getAllKeys(mapId);
	await Promise.all(mapKeys.map((key) => mapsStore.delete(key)));

	// Support legacy map rows whose primary key is the map ID.
	await mapsStore.delete(mapId);

	await tx.done;
	clearMapCache(mapId);
}

export async function saveImportedMapRecords(
  mapId: string,
  replace: boolean,
  records: readonly { storeName: MapDatabaseStore; value: unknown }[],
  onWritten: (index: number) => void,
): Promise<{ erasCreated: number; erasPreserved: number }> {
  for (const record of records) {
    const value = record.value;
    if (!value || typeof value !== "object" ||
      !("mapId" in value) || value.mapId !== mapId) {
      throw new Error("Imported records must belong to the selected map.");
    }
    if (record.storeName === "tags" || record.storeName === "eras" || record.storeName === "developmentalEras") {
      throw new Error("Map import does not directly replace authored tags or eras.");
    }
  }

  const db = await initMapsDatabase();
  const tx = db.transaction(mapDatabaseStores, "readwrite");

  // Observe transaction failure immediately, including synchronous clone errors.
  const done = tx.done;
  void done.catch(() => {});

  let erasCreated = 0;
  let erasPreserved = 0;
  let context = "Replacing existing map records";
  try {
    if (replace) {
      for (const storeName of mapScopedStores) {
        if (storeName === "tags" || storeName === "eras" || storeName === "developmentalEras") continue;
        await deleteIndexedMapRecords(tx, storeName, mapId);
      }

      const maps = tx.objectStore("maps");
      const keys = await maps.index("mapIdIndex").getAllKeys(mapId);
      for (const key of keys) await maps.delete(key);
      // Support legacy map rows whose primary key is the map ID.
      await maps.delete(mapId);
    }

    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      // add rejects ID collisions instead of overwriting another map's record.
      context = `Writing ${record.storeName} record ${index + 1} of ${records.length}`;
      await tx.objectStore(record.storeName).add(record.value);
      onWritten(index);
    }

    context = "Saving eras and refreshing NPC era references";
    const maps = await tx.objectStore("maps").index("mapIdIndex").getAll(mapId) as MapInf[];
    if (maps.length !== 1) throw new Error("Imported eras require a unique map record.");
    const existingEras = await tx.objectStore("eras").index("mapIdIndex").getAll(mapId) as TLMapEra[];
    const initialEras = existingEras.length ? existingEras : createMapEraRecords(maps[0]).eras;
    const projected = mapWithEraRecords(maps[0], initialEras);
    const eras = getMapEras(projected);
    validateMapEras(eras, mapId);
    erasCreated = existingEras.length ? 0 : eras.length;
    erasPreserved = existingEras.length;
    for (const era of eras) await tx.objectStore("eras").put(era);
    await tx.objectStore("maps").put(mapWithoutEraRecords(projected));
    const npcs = await tx.objectStore("npcs").index("mapIdIndex").getAll(mapId) as TLNPC[];
    for (const npc of refreshNPCEraReferences(npcs, eras)) await tx.objectStore("npcs").put(npc);
    context = "Committing map transaction";
    await done;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      // A failed IndexedDB request may already have aborted the transaction.
    }
    await done.catch(() => {});
    throw Object.assign(new Error(`${context} for map ${mapId}; main import transaction rolled back.`), { cause: error });
  }

  clearMapCache(mapId);
  return { erasCreated, erasPreserved };
}

export async function updateEntityAndEconomies(
  storeName: "cities" | "countries",
  key: string,
  updated: TLCity | TLCountry,
  changes?: AtlasMapSave,
): Promise<{ cities: TLCity[]; countries: TLCountry[]; map: MapInf }> {
  const mapId = updated.mapId;
  if (!mapId || updated._id !== key) {
    throw new Error("Economy updates require a matching entity ID and map ID.");
  }
  const db = await initMapsDatabase();
  const tx = db.transaction(["maps", "cities", "countries", "developmentalEras"], "readwrite");
  const done = tx.done;
  void done.catch(() => {});

  try {
    const store = tx.objectStore(storeName);
    const previous = await store.get(key);
    if (previous && previous.mapId !== mapId) {
      throw new Error("The saved entity belongs to another map.");
    }
    if (updated.economy) {
      validateEconomyValue(updated.economy, storeName === "cities" ? cityEconomyField : countryEconomyField, "Economy");
      normalizeTradeEntries(updated.economy.imports);
      normalizeTradeEntries(updated.economy.exports);
    }
    await store.put(updated);
    for (const city of changes?.cities ?? []) {
      const previousCity = await tx.objectStore("cities").get(city._id) as TLCity | undefined;
      if (!previousCity || previousCity.mapId !== mapId || city.mapId !== mapId) {
        throw new Error("Related City economy edits must belong to this map.");
      }
      if (city.economy) {
        validateEconomyValue(city.economy, cityEconomyField, `City ${city.name}`);
        normalizeTradeEntries(city.economy.imports);
        normalizeTradeEntries(city.economy.exports);
      }
      await tx.objectStore("cities").put(city);
    }

    const [cities, countries, rows] = await Promise.all([
      tx.objectStore("cities").index("mapIdIndex").getAll(mapId) as Promise<TLCity[]>,
      tx.objectStore("countries").index("mapIdIndex").getAll(mapId) as Promise<TLCountry[]>,
      tx.objectStore("maps").index("mapIdIndex").getAll(mapId) as Promise<MapInf[]>,
    ]);
    if (rows.length === 0) {
      const legacy = await tx.objectStore("maps").get(mapId) as MapInf | undefined;
      if (legacy) rows.push(legacy);
    }
    if (rows.length !== 1) {
      throw new Error("Cannot resolve a unique map record for economy summaries.");
    }

    const sourceMap = changes?.geography === undefined ? rows[0] : applyGeographyChanges(rows[0], changes.geography);
    const currentMap: MapInf = changes?.shared === undefined ? sourceMap : { ...sourceMap, economy: changes.shared };
    if (changes?.shared !== undefined) {
      validateEconomyValue(changes.shared, sharedEconomyField, "Shared economy");
      function checkIds(records: readonly { id: number }[], label: string) {
        if (new Set(records.map((item) => item.id)).size !== records.length) throw new Error(`Duplicate ${label} IDs.`);
      }
      const cells = changes.shared.cells;
      const previousCount = rows[0].economy?.cells.country.length;
      if ((previousCount !== undefined && cells.country.length !== previousCount) ||
        (cells.good !== undefined && cells.good.length !== cells.country.length) ||
        (cells.market !== undefined && cells.market.length !== cells.country.length) ||
        (cells.population !== undefined && cells.population.length !== cells.country.length) ||
        (cells.prosperity !== undefined && cells.prosperity.length !== cells.country.length) ||
        (cells.development !== undefined && cells.development.length !== cells.country.length)) {
        throw new Error("Cell assignment lists must retain the map's cell count.");
      }
      for (const good of changes.shared.goods ?? []) {
        if (good.deposits && good.deposits[0] > good.deposits[1]) throw new Error("Minimum deposits exceed maximum deposits.");
      }
      checkIds(changes.shared.goods ?? [], "good");
      checkIds(changes.shared.markets ?? [], "market");
      checkIds(changes.shared.deals ?? [], "deal");
      for (const deal of changes.shared.deals ?? []) {
        if (deal.kind === undefined) continue;
        const citySells = deal.kind === "sale" || deal.kind === "kept";
        if (deal.seller.type !== (citySells ? "city" : "market") ||
          deal.buyer.type !== (citySells ? "market" : "city")) {
          throw new Error(`Deal ${deal.id} parties do not match its kind.`);
        }
      }
      for (const market of changes.shared.markets ?? []) {
        checkIds(market.goods.map((good) => ({ id: good.goodId })), "market good");
      }
    }
    const retainedDealIds = new Set((currentMap.economy?.deals ?? []).map((deal) => deal.id));
    const deletedDealIds = new Set(changes?.shared === undefined ? [] :
      (rows[0].economy?.deals ?? []).filter((deal) => !retainedDealIds.has(deal.id)).map((deal) => deal.id));
    const trade = currentMap.economy ? aggregateEconomyTrade(cities, countries, currentMap.economy) : undefined;
    const refreshedCities = trade || deletedDealIds.size > 0 ? cities.map((city) => {
      const totals = trade?.cities.get(city.id);
      return { ...city, economy: {
        ...city.economy, description: city.economy?.description ?? "",
        production: city.economy?.production?.filter((entry) => entry.type !== "deal" || !deletedDealIds.has(entry.dealId)),
        imports: [...normalizeTradeEntries(city.economy?.imports).filter((item) => item.source !== "afmg"), ...(totals?.imports ?? [])],
        exports: [...normalizeTradeEntries(city.economy?.exports).filter((item) => item.source !== "afmg"), ...(totals?.exports ?? [])],
      } };
    }) : cities;
    const refreshed = refreshCountryEconomies(refreshedCities, countries, currentMap.economy);
    const map: MapInf = currentMap.economy ? {
      ...currentMap,
      economy: {
        ...currentMap.economy,
        unresolvedDealIds: refreshed.unresolvedDealIds,
        unresolvedDealIssues: refreshed.unresolvedDealIssues,
        tradeAttribution: refreshed.tradeAttribution,
      },
    } : currentMap;

    const developmentalEras = await tx.objectStore("developmentalEras").index("mapIdIndex").getAll(mapId) as TLDevelopmentalEra[];
    const development = refreshDevelopmentSummaries(refreshedCities, refreshed.countries, map.economy, developmentalEras);
    for (const city of development.cities) await tx.objectStore("cities").put(city);
    for (const country of development.countries) {
      await tx.objectStore("countries").put(country);
    }
    if (currentMap.economy || changes?.geography !== undefined) await tx.objectStore("maps").put(map);
    await done;
    return { cities: development.cities, countries: development.countries, map };
  } catch (error) {
    try {
      tx.abort();
    } catch {
      // A failed IndexedDB request may already have aborted the transaction.
    }
    await done.catch(() => {});
    throw error;
  }
}
