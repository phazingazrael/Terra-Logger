import type { TLHistoryEra, TLMapEra } from "../definitions/History";
import type { MapInf, TLNPC } from "../definitions/TerraLogger";
import { getMapEras, mapWithEraRecords, mapWithoutEraRecords, reflowMapEras, refreshNPCEraReferences, validateMapEras } from "../components/HistoryGenerator/eras/mapEras";
import { createPreviousEra, nextPreviousEraTimelineEnd, orderPreviousEras, type PreviousEraInput } from "../components/HistoryGenerator/eras/model";
import { initMapsDatabase } from "./connections/mapsDatabase";
import { setCachedMap, setCachedStore } from "./mapCache";

const listeners = new Set<() => void>();

export function subscribeToEraChanges(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

async function changeMapEras<T extends TLHistoryEra | TLMapEra>(
  mapId: string,
  change: (map: MapInf) => { map: MapInf; result: T },
): Promise<T> {
  const db = await initMapsDatabase();
  const tx = db.transaction(["maps", "npcs", "eras"], "readwrite");
  const done = tx.done;
  void done.catch(() => {});
  let saved: { map: MapInf; result: T };
  let refreshed: TLNPC[];
  let savedEras: TLMapEra[];
  try {
    const rows = await tx.objectStore("maps").index("mapIdIndex").getAll(mapId) as MapInf[];
    if (rows.length === 0) {
      const legacy = await tx.objectStore("maps").get(mapId) as MapInf | undefined;
      if (legacy?.mapId === mapId) rows.push(legacy);
    }
    if (rows.length !== 1) throw new Error("Cannot resolve a unique map for era changes.");
    const records = await tx.objectStore("eras").index("mapIdIndex").getAll(mapId) as TLMapEra[];
    saved = change(reflowMapEras(mapWithEraRecords(rows[0], records)));
    saved.map = reflowMapEras(saved.map);
    if (saved.map.id !== rows[0].id || saved.map.mapId !== mapId) {
      throw new Error("Era changes must retain the map's identity.");
    }
    const eras = getMapEras(saved.map);
    savedEras = eras;
    validateMapEras(eras, mapId);
    const resolved = eras.find((era) => era.id === saved.result.id);
    if (!resolved) throw new Error("The saved era could not be resolved.");
    saved.result = {
      ...saved.result, firstYear: resolved.firstYear, finalYear: resolved.finalYear, length: resolved.length,
      timelineStartYear: resolved.timelineStartYear, timelineEndYear: resolved.timelineEndYear,
    };
    const npcs = await tx.objectStore("npcs").index("mapIdIndex").getAll(mapId) as TLNPC[];
    refreshed = refreshNPCEraReferences(npcs, eras);
    for (const era of eras) {
      const existing = await tx.objectStore("eras").get(era._id) as TLMapEra | undefined;
      if (existing && existing.mapId !== mapId) throw new Error("This era ID belongs to another map.");
      await tx.objectStore("eras").put(era);
    }
    saved.map = mapWithoutEraRecords(saved.map);
    await tx.objectStore("maps").put(saved.map);
    for (let index = 0; index < refreshed.length; index++) {
      if (refreshed[index] !== npcs[index]) await tx.objectStore("npcs").put(refreshed[index]);
    }
    await done;
  } catch (error) {
    try { tx.abort(); } catch { /* A failed IndexedDB request may already have aborted it. */ }
    await done.catch(() => {});
    throw error;
  }
  // Publish both caches only after the transaction has committed.
  setCachedMap(mapId, saved.map);
  setCachedStore(mapId, "eras", savedEras);
  setCachedStore(mapId, "npcs", refreshed);
  for (const listener of listeners) listener();
  return saved.result;
}

export function appendPreviousMapEra(
  mapId: string,
  input: PreviousEraInput,
  birthTimelineYear?: number,
): Promise<TLHistoryEra> {
  return changeMapEras(mapId, (map) => {
    if (!input.name.trim() || !input.shortName.trim() ||
      !Number.isSafeInteger(input.firstYear) || !Number.isSafeInteger(input.finalYear) ||
      input.finalYear < input.firstYear) {
      throw new Error("Previous eras require a name, abbreviation, and an ordered whole-year range.");
    }
    const history = map.historyGenerator ?? { currentEraMinimumYear: 0, previousEras: [] };
    let end = nextPreviousEraTimelineEnd(history.currentEraMinimumYear, history.previousEras);
    if (birthTimelineYear !== undefined) {
      if (!Number.isSafeInteger(birthTimelineYear) || birthTimelineYear >= history.currentEraMinimumYear) {
        throw new Error("A previous-era birth must precede the current era.");
      }
      end = history.currentEraMinimumYear - 1;
      for (const era of history.previousEras) {
        if (birthTimelineYear >= era.timelineStartYear && birthTimelineYear <= era.timelineEndYear) {
          throw new Error("This birth year is already covered by an era. Retry history generation.");
        }
        if (era.timelineStartYear > birthTimelineYear) end = Math.min(end, era.timelineStartYear - 1);
      }
    }
    const era = createPreviousEra(input, end);
    return {
      map: { ...map, historyGenerator: {
        ...history, previousEras: orderPreviousEras([...history.previousEras, era]),
      } },
      result: era,
    };
  });
}

// An expected snapshot prevents a stale Atlas editor from overwriting a newer era.
export function saveMapEra(mapId: string, era: TLMapEra, expected?: TLMapEra | null): Promise<TLMapEra> {
  return changeMapEras(mapId, (map) => {
    const current = getMapEras(map).find((item) => item.id === era.id);
    if (era.mapId !== mapId || era._id !== era.id ||
      (expected && (expected.id !== era.id || JSON.stringify(current) !== JSON.stringify(expected))) ||
      (expected === null && current) ||
      (expected === undefined && (!current || current.updatedAt !== era.updatedAt))) {
      throw new Error("This era has changed or its identity does not match. Reload it before saving.");
    }
    if ((current && current.status !== era.status) || (!current && era.status !== "previous")) {
      throw new Error("Only previous eras can be added; an existing era's status cannot be changed.");
    }
    const now = new Date().toISOString();
    const savedEra: TLMapEra = {
      ...era, name: era.name.trim(), shortName: era.shortName.trim(),
      createdAt: current?.createdAt ?? now, updatedAt: now,
    };
    const history = map.historyGenerator ?? { currentEraMinimumYear: 0, previousEras: [] };
    let updated: MapInf;
    if (savedEra.status === "current") {
      if (savedEra.finalYear !== map.settings.options.year ||
        savedEra.timelineEndYear !== map.settings.options.year) {
        throw new Error("Editing an era cannot advance or rewind the map's current year.");
      }
      updated = {
        ...map,
        settings: { ...map.settings, options: {
          ...map.settings.options, era: savedEra.name, eraShort: savedEra.shortName,
        } },
        historyGenerator: {
          ...history, currentEraMinimumYear: savedEra.firstYear,
          currentEra: {
            id: savedEra.id, events: savedEra.events, description: savedEra.description, content: savedEra.content,
            createdAt: savedEra.createdAt, updatedAt: now,
          },
        },
      };
    } else {
      const record: TLHistoryEra = {
        id: savedEra.id, name: savedEra.name, shortName: savedEra.shortName,
        firstYear: 1, finalYear: savedEra.length, length: savedEra.length,
        timelineStartYear: current?.timelineStartYear ?? savedEra.timelineStartYear,
        timelineEndYear: current?.timelineEndYear ?? savedEra.timelineEndYear,
        events: savedEra.events, description: savedEra.description, content: savedEra.content,
        createdAt: savedEra.createdAt ?? now, updatedAt: now,
      };
      updated = { ...map, historyGenerator: {
        ...history,
        previousEras: orderPreviousEras([...history.previousEras.filter((item) => item.id !== record.id), record]),
      } };
    }
    // The transaction derives all boundaries from era order and durations before validation.
    return { map: updated, result: savedEra };
  });
}
