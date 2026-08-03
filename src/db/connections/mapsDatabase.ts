import { type IDBPDatabase, openDB } from "idb";
import { migrateNPCsToPersistentEntity } from "../migrations/persistentNPC";
import { migrateNPCIdentityAndPortrait } from "../migrations/npcIdentityAndPortrait";
import { migrateNPCAgeAndHistory } from "../migrations/npcAgeAndHistory";
import {
	migrateAtlasContentToV3,
	migrateAtlasContentToV4,
} from "../migrations/atlasContent";
import { TERRA_LOGGER_MAPS_DB_NAME } from "./databaseNames";

const TERRA_LOGGER_MAPS_DB_VERSION = 5;

export const mapScopedStores = [
	"cities",
	"countries",
	"cultures",
	"notes",
	"npcs",
	"religions",
	"nameBases",
	"tags",
] as const;

export type MapScopedStore = (typeof mapScopedStores)[number];

export const mapDatabaseStores = ["maps", ...mapScopedStores] as const;

export type MapDatabaseStore = (typeof mapDatabaseStores)[number];

// biome-ignore lint/suspicious/noExplicitAny: IDB generic for multiple stores
let mapsDatabasePromise: Promise<IDBPDatabase<any>> | null = null;

/**
 * Opens the existing map database without changing its schema or moving data.
 */
export function initMapsDatabase() {
	mapsDatabasePromise ??= (async () => {
		const db = await openDB(
			TERRA_LOGGER_MAPS_DB_NAME,
			TERRA_LOGGER_MAPS_DB_VERSION,
			{
				// Do not open new transactions inside upgrade. Use the provided one.
				async upgrade(db, oldVersion, newVersion, tx) {
					console.log("Upgrading DB", oldVersion, "to", newVersion);

					if (!db.objectStoreNames.contains("maps")) {
						const mapStore = db.createObjectStore("maps", { keyPath: "id" });
						mapStore.createIndex("mapIdIndex", "mapId");
					} else {
						const maps = tx.objectStore("maps");
						const hasMapIdIndex = Array.from(maps.indexNames).includes(
							"mapIdIndex",
						);
						if (!hasMapIdIndex) maps.createIndex("mapIdIndex", "mapId");
					}

					for (const storeName of mapScopedStores) {
						if (!db.objectStoreNames.contains(storeName)) {
							const store = db.createObjectStore(storeName, { keyPath: "_id" });
							store.createIndex("mapIdIndex", "mapId");
						} else {
							const store = tx.objectStore(storeName);
							const hasMapIdIndex = Array.from(store.indexNames).includes(
								"mapIdIndex",
							);
							if (!hasMapIdIndex) store.createIndex("mapIdIndex", "mapId");
						}
					}

					if (oldVersion < 3) {
						await migrateAtlasContentToV3(db, tx);
					}

					if (oldVersion < 4) {
						await migrateAtlasContentToV4(db, tx);
					}

					// Database v5 is the first public NPC persistence migration.
					// All NPC schema work completed during development is intentionally
					// consolidated here so public v4 databases upgrade directly to v5.
					if (oldVersion < 5) {
						await migrateNPCsToPersistentEntity(db, tx);
						await migrateNPCIdentityAndPortrait(db, tx);
						await migrateNPCAgeAndHistory(db, tx);
					}
				},
			},
		);

		return db;
	})();

	return mapsDatabasePromise;
}
