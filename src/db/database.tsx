import { openDB } from "idb";

const stores = [
	"cities",
	"countries",
	"cultures",
	"notes",
	"npcs",
	"religions",
	"nameBases",
	"tags",
];

export const initDatabase = async () => {
	const db = await openDB("TerraLogger-Maps", 1, {
		upgrade(db) {
			// Create the main Map store
			const mapStore = db.createObjectStore("maps", { keyPath: "id" });
			mapStore.createIndex("mapIdIndex", "mapId");

			// Create individual stores for each
			const promises = stores.map((Store) => {
				const store = db.createObjectStore(Store, { keyPath: "_id" });
				return store.createIndex("mapIdIndex", "mapId");
			});

			// Return a promise that resolves when all index creations are complete
			return Promise.all(promises).then(() => {
				// Create settings store
				db.createObjectStore("appSettings", { keyPath: "id" });
			});
		},
	});

	return db;
};
