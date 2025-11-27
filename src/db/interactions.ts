import { initDatabase } from "./database";

/**
 * Add data to a store.
 *
 * @param {string} storeName - The name of the store to add data to.
 * @param {any} data - The data to add to the store.
 * @returns {Promise<void>} - A promise that resolves when the data has been added to the store.
 */
// biome-ignore lint/suspicious/noExplicitAny: This is fine
export async function addDataToStore(storeName: string, data: any) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);
	store.add(data);
	await tx.done;
}

/**
 * Retrieve data from a store.
 *
 * @param {string} storeName - The name of the store to retrieve data from.
 * @param {any} key - The key of the data to retrieve.
 * @returns {Promise<any>} - A promise that resolves with the data from the store, or null if the data does not exist.
 */

// biome-ignore lint/suspicious/noExplicitAny: This is fine
export async function getDataFromStore(storeName: string, key: any) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readonly");
	const store = tx.objectStore(storeName);
	const data = await store.get(key);
	return data;
}

/**
 * Retrieve data from a store using a specified index.
 *
 * @param {string} storeName - The name of the store to retrieve data from.
 * @param {any} key - The key of the data to retrieve.
 * @param {string} index - The name of the index to use for the retrieval.
 * @returns {Promise<any>} - A promise that resolves with the data from the store, or null if the data does not exist.
 */
export async function getDataFromStoreIndex(
	storeName: string,
	// biome-ignore lint/suspicious/noExplicitAny: This is fine
	key: any,
	index: string,
) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readonly");
	const store = tx.objectStore(storeName);
	const idx = store.index(index);
	const data = await idx.get(key);
	return data;
}

/**
 * Retrieve all data from a store.
 *
 * @param {string} storeName - The name of the store to retrieve data from.
 * @returns {Promise<any[]>} - A promise that resolves with an array of all data from the store.
 */
export async function getFullStore(storeName: string) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readonly");
	const store = tx.objectStore(storeName);
	const data = await store.getAll();
	return data;
}

/**
 * Update data in a store.
 *
 * @param {string} storeName - The name of the store to update data in.
 * @param {any} key - The key of the data to update.
 * @param {any} updatedData - The updated data to store.
 * @returns {Promise<void>} - A promise that resolves when the data has been updated in the store.
 */

export async function updateDataInStore(
	storeName: string,
	// biome-ignore lint/suspicious/noExplicitAny: This is fine
	key: any,
	// biome-ignore lint/suspicious/noExplicitAny: This is fine
	updatedData: any,
) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);

  if (store.keyPath){
    // Store is configured to use in-line keys, use put instead of add
    store.put(updatedData)
  } else {
    // Store is not configured to use in-line keys, use add with key
    store.add(updatedData, key);
  }

	await tx.done;
}

/**
 * Delete data from a store.
 *
 * @param {string} storeName - The name of the store to delete data from.
 * @param {any} key - The key of the data to delete.
 * @returns {Promise<void>} - A promise that resolves when the data has been deleted from the store.
 */
// biome-ignore lint/suspicious/noExplicitAny: This is fine
export async function deleteDataFromStore(storeName: string, key: any) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);
	store.delete(key);
	await tx.done;
}

/**
 * Query data from a store using an index.
 *
 * @param {string} storeName - The name of the store to query data from.
 * @param {string} indexName - The name of the index to use for the query.
 * @param {IDBValidKey | IDBKeyRange} query - The query to use for the index.
 * @returns {Promise<any[]>} - A promise that resolves with an array of data from the store that matches the query.
 */
export async function queryDataFromStore(
	storeName: string,
	indexName: string,
	query: IDBValidKey | IDBKeyRange,
) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readonly");
	const store = tx.objectStore(storeName);
	const index = store.index(indexName);
	const result = await index.getAll(query);
	return result;
}

/**
 * Delete data from a store based on the mapId property.
 *
 * @param {string} storeName - The name of the store to delete data from.
 * @param {string} indexName - The name of the index to use for the query.
 * @param {string} key - The key of the data to delete.
 * @returns {Promise<void>} - A promise that resolves when the data has been deleted from the store.
 */
export async function deleteDataFromStoreByMapId(
	storeName: string,
	indexName: string,
	key: string,
) {
	const db = await initDatabase();
	const tx = db.transaction(storeName, "readwrite");
	const store = tx.objectStore(storeName);
	const index = store.index(indexName);

	// Get all objects with the specified mapId
	const objectsToDelete = await index.getAll(IDBKeyRange.only(key));

	// Delete each object
	for (const object of objectsToDelete) {
		store.delete(object._id); // Assuming each object has an 'id' property
	}

	await tx.done;
}
