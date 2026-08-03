import { type IDBPDatabase, openDB } from "idb";
import { TERRA_LOGGER_APP_DB_NAME } from "./databaseNames";

const TERRA_LOGGER_APP_DB_VERSION = 1;

export const appDatabaseStores = {
	appSettings: "appSettings",
	databaseMigrations: "databaseMigrations",
} as const;

export type AppDatabaseStore =
	(typeof appDatabaseStores)[keyof typeof appDatabaseStores];

// biome-ignore lint/suspicious/noExplicitAny: IDB generic for multiple stores.
let appDatabasePromise: Promise<IDBPDatabase<any>> | null = null;

export function initAppDatabase() {
	appDatabasePromise ??= openDB(
		TERRA_LOGGER_APP_DB_NAME,
		TERRA_LOGGER_APP_DB_VERSION,
		{
			upgrade(db) {
				if (!db.objectStoreNames.contains(appDatabaseStores.appSettings)) {
					db.createObjectStore(appDatabaseStores.appSettings, {
						keyPath: "id",
					});
				}

				if (
					!db.objectStoreNames.contains(appDatabaseStores.databaseMigrations)
				) {
					db.createObjectStore(appDatabaseStores.databaseMigrations, {
						keyPath: "id",
					});
				}
			},
		},
	);

	return appDatabasePromise;
}
