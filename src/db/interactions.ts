import {
	initMapsDatabase,
	type MapDatabaseStore,
	type MapScopedStore,
	mapDatabaseStores,
	mapScopedStores,
} from "./connections/mapsDatabase";
import { clearMapCache } from "./mapCache";

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
