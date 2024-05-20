import { initDatabase } from './database';

/**
 * Add data to a store.
 *
 * @param {string} storeName - The name of the store to add data to.
 * @param {any} data - The data to add to the store.
 * @returns {Promise<void>} - A promise that resolves when the data has been added to the store.
 */
export async function addDataToStore(storeName: string, data: any) {
  const db = await initDatabase();
  const tx = db.transaction(storeName, 'readwrite');
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
export async function getDataFromStore(storeName: string, key: any) {
  const db = await initDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const data = await store.get(key);
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
  const tx = db.transaction(storeName, 'readonly');
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
export async function updateDataInStore(storeName: string, key: any, updatedData: any) {
  const db = await initDatabase();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  store.put(updatedData, key);
  await tx.done;
}

/**
 * Delete data from a store.
 *
 * @param {string} storeName - The name of the store to delete data from.
 * @param {any} key - The key of the data to delete.
 * @returns {Promise<void>} - A promise that resolves when the data has been deleted from the store.
 */
export async function deleteDataFromStore(storeName: string, key: any) {
  const db = await initDatabase();
  const tx = db.transaction(storeName, 'readwrite');
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
export async function queryDataFromStore(storeName: string, indexName: string, query: IDBValidKey | IDBKeyRange) {
  const db = await initDatabase();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index(indexName);
  const result = await index.getAll(query);
  return result;
}
