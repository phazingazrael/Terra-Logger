import type { IDBPDatabase, IDBPTransaction } from "idb";
import type { TLDevelopmentalEra, TLMapEra } from "../../definitions/History";
import type { MapInf, TLNPC, TLCity, TLCountry } from "../../definitions/TerraLogger";
import { createDevelopmentalEraRecords, estimateDevelopmentalEraPlacements, developmentalDefinitions, mapWithDevelopmentPopulation, refreshDevelopmentSummaries, createMapEraRecords, mapWithoutEraRecords } from "../../components/HistoryGenerator/eras/mapEras";

export async function migrateEras(
  _db: IDBPDatabase<unknown>,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<void> {
  try {
    let cursor = await tx.objectStore("maps").openCursor();
    while (cursor) {
      const map = cursor.value as MapInf;
      const { eras, ids } = createMapEraRecords(map);
      for (const era of eras) await tx.objectStore("eras").add(era);
      const npcs = await tx.objectStore("npcs").index("mapIdIndex").getAll(map.mapId) as TLNPC[];
      for (const npc of npcs) {
        const history = npc.history.map((entry) => {
          const id = entry.era && ids.get(entry.era.id);
          return id && entry.era ? { ...entry, era: { ...entry.era, id } } : entry;
        });
        if (history.some((entry, index) => entry !== npc.history[index])) {
          await tx.objectStore("npcs").put({ ...npc, history });
        }
      }
      await cursor.update(mapWithoutEraRecords(map));
      cursor = await cursor.continue();
    }
  } catch (error) {
    tx.abort();
    throw error;
  }
}

export async function migrateDevelopmentalEras(
  _db: IDBPDatabase<unknown>,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<void> {
  try {
    let cursor = await tx.objectStore("maps").openCursor();
    while (cursor) {
      const map = mapWithDevelopmentPopulation(cursor.value as MapInf);
      const historical = await tx.objectStore("eras").index("mapIdIndex").getAll(map.mapId) as TLMapEra[];
      const definitions = developmentalDefinitions(map);
      const cities = await tx.objectStore("cities").index("mapIdIndex").getAll(map.mapId) as TLCity[];
      const countries = await tx.objectStore("countries").index("mapIdIndex").getAll(map.mapId) as TLCountry[];
      const records: TLDevelopmentalEra[] = definitions === undefined ? [] : estimateDevelopmentalEraPlacements(
        createDevelopmentalEraRecords(map.mapId, definitions, historical), historical, cities, countries, map.economy);
      for (const era of records) await tx.objectStore("developmentalEras").add(era);
      const summaries = refreshDevelopmentSummaries(cities, countries, map.economy, records);
      for (const city of summaries.cities) await tx.objectStore("cities").put(city);
      for (const country of summaries.countries) await tx.objectStore("countries").put(country);
      await cursor.update(map);
      cursor = await cursor.continue();
    }
  } catch (error) {
    tx.abort();
    throw error;
  }
}
