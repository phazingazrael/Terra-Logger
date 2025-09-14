// src/db/database.tsx
import { openDB, type IDBPDatabase } from "idb";
import Package from "../../package.json";

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

const defaultAppSettings = () => ({
	id: `TL_${Package.version}`,
	application: {
		name: Package.name,
		version: Package.version,
		afmgVer: "1.105.15",
		supportedLanguages: ["en"],
		defaultLanguage: "en",
		onboarding: true,
		description: Package.descriptionFull ?? "",
	},
	userSettings: {
		theme: "light",
		language: "en",
		showWelcomeMessage: true,
		fontSize: "medium",
		exportOption: "",
		screen: {
			innerWidth: window.innerWidth,
			innerHeight: window.innerHeight,
			outerWidth: window.outerWidth,
			outerHeight: window.outerHeight,
			devicePixelRatio: window.devicePixelRatio,
		},
		// important: default present so later writes only flip the flag
		forceMobile: false,
	},
});

export const initDatabase = async () => {
	if (!dbPromise) {
		dbPromise = (async () => {
			const db = await openDB("TerraLogger-Maps", 1, {
				// NOTE: do not open new transactions inside upgrade; use the provided one
				upgrade(db, oldVersion, newVersion, tx) {
					console.log(oldVersion, newVersion);
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
				},
			});

			// Ensure a default appSettings row exists (common Android issue: missing row -> updates noop)
			const settingsId = `TL_${Package.version}`;
			const tx = db.transaction("appSettings", "readwrite");
			const existing = await tx.store.get(settingsId);
			if (!existing) {
				await tx.store.put(defaultAppSettings());
			}
			await tx.done;

			// (Optional) Ask for persistent storage to reduce eviction on mobile
			// void navigator.storage?.persist?.();

			return db;
		})();
	}
	return dbPromise;
};
