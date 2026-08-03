import type { AppInfo } from "../../definitions/AppInfo";
import { appDatabaseStores, initAppDatabase } from "../connections/appDatabase";
import { initMapsDatabase } from "../connections/mapsDatabase";

export const APP_SETTINGS_MIGRATION_ID =
	"app-settings-to-app-database-v1" as const;

type AppSettingsMigrationRecord = {
	id: typeof APP_SETTINGS_MIGRATION_ID;
	version: 1;
	status: "completed";
	sourceDatabase: "TerraLogger-Maps";
	targetDatabase: "TerraLogger-App";
	recordId: string;
	verified: true;
	completedAt: string;
};

function recordsMatch(expected: AppInfo, actual: unknown): boolean {
	return JSON.stringify(actual) === JSON.stringify(expected);
}

export async function readLegacyAppSettings(
	canonicalId: string,
): Promise<unknown | undefined> {
	const legacyDb = await initMapsDatabase();

	if (!legacyDb.objectStoreNames.contains("appSettings")) {
		return undefined;
	}

	const canonical = (await legacyDb.get("appSettings", canonicalId)) as unknown;
	if (canonical) return canonical;

	const all = (await legacyDb.getAll("appSettings")) as unknown[];
	return all.length ? all[all.length - 1] : undefined;
}

export async function hasCompletedAppSettingsMigration(): Promise<boolean> {
	const appDb = await initAppDatabase();
	const marker = (await appDb.get(
		appDatabaseStores.databaseMigrations,
		APP_SETTINGS_MIGRATION_ID,
	)) as Partial<AppSettingsMigrationRecord> | undefined;

	return marker?.status === "completed" && marker.verified === true;
}

/**
 * Copies settings into the application database and verifies the stored value.
 *
 * This function does not update or delete the legacy record.
 */
export async function migrateAppSettingsToAppDatabase(
	settings: AppInfo,
): Promise<void> {
	const appDb = await initAppDatabase();
	await appDb.put(appDatabaseStores.appSettings, settings);

	const persisted = (await appDb.get(
		appDatabaseStores.appSettings,
		settings.id,
	)) as unknown;

	if (!recordsMatch(settings, persisted)) {
		throw new Error(
			"The application settings migration could not be verified.",
		);
	}

	const marker: AppSettingsMigrationRecord = {
		id: APP_SETTINGS_MIGRATION_ID,
		version: 1,
		status: "completed",
		sourceDatabase: "TerraLogger-Maps",
		targetDatabase: "TerraLogger-App",
		recordId: settings.id,
		verified: true,
		completedAt: new Date().toISOString(),
	};

	await appDb.put(appDatabaseStores.databaseMigrations, marker);
}
