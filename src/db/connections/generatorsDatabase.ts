import { type IDBPDatabase, openDB } from "idb";
import {
	generatorCatalogStores,
	generatorCommonIndexes,
	generatorMetadataIndexes,
	type TerraLoggerGeneratorsSchema,
} from "../generators/schema";
import { TERRA_LOGGER_GENERATORS_DB_NAME } from "./databaseNames";

/**
 * Development uses a single schema version. Clearing IndexedDB regenerates
 * the complete default generator catalog without migration steps.
 */
export const TERRA_LOGGER_GENERATORS_DB_VERSION = 1;

let generatorsDatabasePromise: Promise<
	IDBPDatabase<TerraLoggerGeneratorsSchema>
> | null = null;

// biome-ignore lint/suspicious/noExplicitAny: Shared upgrade helper spans catalog stores.
function ensureCommonIndexes(store: any): void {
	if (!store.indexNames.contains(generatorCommonIndexes.source)) {
		store.createIndex(generatorCommonIndexes.source, "source");
	}
	if (!store.indexNames.contains(generatorCommonIndexes.version)) {
		store.createIndex(generatorCommonIndexes.version, "version");
	}
	if (!store.indexNames.contains(generatorCommonIndexes.updatedAt)) {
		store.createIndex(generatorCommonIndexes.updatedAt, "updatedAt");
	}
}

export function initGeneratorsDatabase() {
	generatorsDatabasePromise ??= openDB<TerraLoggerGeneratorsSchema>(
		TERRA_LOGGER_GENERATORS_DB_NAME,
		TERRA_LOGGER_GENERATORS_DB_VERSION,
		{
			upgrade(db, _oldVersion, _newVersion, tx) {
				const metadataStore = db.objectStoreNames.contains("catalogMetadata")
					? tx.objectStore("catalogMetadata")
					: db.createObjectStore("catalogMetadata", { keyPath: "id" });

				ensureCommonIndexes(metadataStore);

				if (
					!metadataStore.indexNames.contains(
						generatorMetadataIndexes.generatorType,
					)
				) {
					metadataStore.createIndex(
						generatorMetadataIndexes.generatorType,
						"generatorType",
					);
				}
				if (
					!metadataStore.indexNames.contains(generatorMetadataIndexes.sectionId)
				) {
					metadataStore.createIndex(
						generatorMetadataIndexes.sectionId,
						"sectionId",
					);
				}
				if (
					!metadataStore.indexNames.contains(
						generatorMetadataIndexes.generatorTypeSection,
					)
				) {
					metadataStore.createIndex(
						generatorMetadataIndexes.generatorTypeSection,
						["generatorType", "sectionId"],
					);
				}

				for (const storeName of generatorCatalogStores) {
					const store = db.objectStoreNames.contains(storeName)
						? tx.objectStore(storeName)
						: db.createObjectStore(storeName, { keyPath: "id" });
					ensureCommonIndexes(store);
				}
			},
		},
	);

	return generatorsDatabasePromise;
}
