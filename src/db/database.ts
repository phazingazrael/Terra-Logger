// src/db/database.tsx
import { openDB, type IDBPDatabase } from "idb";
import {
  migrateAtlasContentToV3,
  migrateAtlasContentToV4,
} from "./migrations/atlasContent";

const TERRA_LOGGER_DB_VERSION = 4;

export const stores = [
  "cities",
  "countries",
  "cultures",
  "notes",
  "npcs",
  "religions",
  "nameBases",
  "tags",
] as const;

export type MapScopedStore = (typeof stores)[number];

// biome-ignore lint/suspicious/noExplicitAny: IDB generic for multiple stores
let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export const initDatabase = async () => {
  // if (!dbPromise) {
  dbPromise ??= (async () => {
    const db = await openDB("TerraLogger-Maps", TERRA_LOGGER_DB_VERSION, {
      // NOTE: do not open new transactions inside upgrade; use the provided one
      async upgrade(db, oldVersion, newVersion, tx) {
        console.log("Upgrading DB", oldVersion, "to", newVersion);

        // maps store
        if (!db.objectStoreNames.contains("maps")) {
          const mapStore = db.createObjectStore("maps", { keyPath: "id" });
          mapStore.createIndex("mapIdIndex", "mapId");
        } else {
          // ensure index exists if an earlier schema lacked it
          const maps = tx.objectStore("maps");
          const hasMapIdIdx = Array.from(maps.indexNames).includes(
            "mapIdIndex",
          );
          if (!hasMapIdIdx) maps.createIndex("mapIdIndex", "mapId");
        }

        // data stores + mapId index
        for (const storeName of stores) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, { keyPath: "_id" });
            store.createIndex("mapIdIndex", "mapId");
          } else {
            const store = tx.objectStore(storeName);
            const hasIdx = Array.from(store.indexNames).includes(
              "mapIdIndex",
            );
            if (!hasIdx) store.createIndex("mapIdIndex", "mapId");
          }
        }

        // appSettings store
        if (!db.objectStoreNames.contains("appSettings")) {
          db.createObjectStore("appSettings", { keyPath: "id" });
        }

        if (oldVersion < 3) {
          await migrateAtlasContentToV3(db, tx);
        }

        if (oldVersion < 4) {
          await migrateAtlasContentToV4(db, tx);
        }
      },
    });

    return db;
  })();
  // }
  return dbPromise;
};
