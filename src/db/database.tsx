// src/db/database.tsx
import { openDB, type IDBPDatabase } from "idb";

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

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let dbPromise: Promise<IDBPDatabase<any>> | null = null;

export const initDatabase = async () => {
	if (!dbPromise) {
		dbPromise = openDB("TerraLogger-Maps", 1, {
			upgrade(db) {
				// Create the main Map store
				if (!db.objectStoreNames.contains("maps")) {
					const mapStore = db.createObjectStore("maps", { keyPath: "id" });
					mapStore.createIndex("mapIdIndex", "mapId");
				}

				// Create individual stores for each and their mapId index
				for (const storeName of stores) {
					if (!db.objectStoreNames.contains(storeName)) {
						const store = db.createObjectStore(storeName, { keyPath: "_id" });
						store.createIndex("mapIdIndex", "mapId");
					} else {
						// Ensure the index exists if store was created previously without it
						const store = db.transaction(storeName, "versionchange").store;
						if (!Array.from(store.indexNames).includes("mapIdIndex")) {
							store.createIndex("mapIdIndex", "mapId");
						}
					}
				}

				// Create settings store
				if (!db.objectStoreNames.contains("appSettings")) {
					db.createObjectStore("appSettings", { keyPath: "id" });
				}
			},
		});
	}
	return dbPromise;
};
