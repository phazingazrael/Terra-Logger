import { openDB } from 'idb';

export const initDatabase = async () => {
  const db = await openDB('TerraLogger-Maps', 1, {
    upgrade(db) {
      // Create the main Map store
      const mapStore = db.createObjectStore('maps', { keyPath: 'id' });
      mapStore.createIndex('mapIdIndex', 'mapId');

      // Create individual stores for each entity
      ['cities', 'countries', 'cultures', 'notes', 'npcs', 'religions', 'nameBases'].forEach(
        (entity) => {
          const store = db.createObjectStore(entity, { keyPath: '_id' });
          store.createIndex('mapIdIndex', 'mapId');
        },
      );

      // Create settings store
      db.createObjectStore('appSettings', { keyPath: 'id' });
      // apply defaults
    },
  });

  return db;
};
