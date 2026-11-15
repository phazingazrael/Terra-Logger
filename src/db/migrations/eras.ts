import type { IDBPDatabase, IDBPTransaction } from "idb";
import type { MapInf, TLNPC } from "../../definitions/TerraLogger";
import { createMapEraRecords, mapWithoutEraRecords } from "../../components/HistoryGenerator/eras/mapEras";

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
