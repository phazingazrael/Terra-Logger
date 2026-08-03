// src/db/appSettings.ts
import Package from "../../package.json";
import type { AppInfo } from "../definitions/AppInfo";
import { appDatabaseStores, initAppDatabase } from "./connections/appDatabase";
import {
	hasCompletedAppSettingsMigration,
	migrateAppSettingsToAppDatabase,
	readLegacyAppSettings,
} from "./migrations/appSettingsToAppDatabase";

export const APP_SETTINGS_ID = "TL_APP_SETTINGS" as const;

function getCodeAppVersion(): string {
	return (
		sanitizeVersionString(
			(Package as { version?: string }).version ?? "0.0.0",
		) || "0.0.0"
	);
}

function sanitizeVersionString(value: unknown): string {
	if (typeof value !== "string") {
		return "";
	}

	return value.trim().replace(/_Beta/gi, "");
}

/**
 * Creates the default app settings object.
 * @returns {AppInfo} The default app settings object.
 */
export function createDefaultAppSettings(): AppInfo {
	return {
		id: APP_SETTINGS_ID,
		application: {
			name: (Package as { name?: string }).name ?? "Terra-Logger",
			version: getCodeAppVersion(),
			afmgVer: "1.105.15",
			supportedLanguages: ["en"],
			defaultLanguage: "en",
			onboarding: true,
			description:
				(Package as { descriptionFull?: string }).descriptionFull ??
				Package.description ??
				"",
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
		},
		activeMapId: null,
		forceMobile: false,
	};
}

/**
 * Normalizes the given app settings object by merging it with the default app settings object.
 * It ensures all required fields exist and their types are correct.
 * @param raw The app settings object to normalize.
 * @returns {AppInfo} The normalized app settings object.
 */
export function normalizeAppSettings(raw: unknown): AppInfo {
	const base = createDefaultAppSettings();
	const src = (raw ?? {}) as AppInfo;

	const merged: AppInfo = {
		...base,
		...src,
		application: { ...base.application, ...(src.application ?? {}) },
		userSettings: { ...base.userSettings, ...(src.userSettings ?? {}) },
	};

	// canonical id
	merged.id = APP_SETTINGS_ID;

	// ensure required fields exist
	if (merged.activeMapId === undefined) merged.activeMapId = null;
	if (typeof merged.forceMobile !== "boolean") merged.forceMobile = false;

	return merged;
}

export async function getAppSettings(): Promise<AppInfo> {
	const appDb = await initAppDatabase();
	const current = (await appDb.get(
		appDatabaseStores.appSettings,
		APP_SETTINGS_ID,
	)) as unknown;

	if (current) {
		const normalized = normalizeAppSettings(current);
		await appDb.put(appDatabaseStores.appSettings, normalized);

		if (!(await hasCompletedAppSettingsMigration())) {
			try {
				await migrateAppSettingsToAppDatabase(normalized);
			} catch (error) {
				console.error(
					"Could not finalize the application settings migration marker.",
					error,
				);
			}
		}

		return normalized;
	}

	const legacy = await readLegacyAppSettings(APP_SETTINGS_ID);
	const normalized = normalizeAppSettings(legacy);

	try {
		await migrateAppSettingsToAppDatabase(normalized);
	} catch (error) {
		console.error(
			"Could not migrate application settings. Using the legacy fallback.",
			error,
		);
	}

	return normalized;
}

type Updater = Partial<AppInfo> | ((prev: AppInfo) => AppInfo);

/**
 * Updates the application settings.
 * It reads the current settings, applies the update, normalizes the result and persists it back.
 * @param updater A function that takes the current settings and returns the updated settings, or a partial object to merge.
 * @returns The updated app settings object.
 */
export async function updateAppSettings(updater: Updater): Promise<AppInfo> {
	const db = await initAppDatabase();
	const prev = await getAppSettings();

	const next =
		typeof updater === "function"
			? (updater as (p: AppInfo) => AppInfo)(prev)
			: {
				...prev,
				...(updater as Partial<AppInfo>),
				application: {
					...prev.application,
					...((updater as Partial<AppInfo>).application ?? {}),
				},
				userSettings: {
					...prev.userSettings,
					...((updater as Partial<AppInfo>).userSettings ?? {}),
				},
			};

	const normalized = normalizeAppSettings(next);
	await db.put(appDatabaseStores.appSettings, normalized);
	return normalized;
}

/**
 * Sets the theme of the application.
 * @param theme The theme to set. Should be either "light" or "dark".
 * @returns A promise that resolves to the updated app settings object.
 */
export function setTheme(theme: "light" | "dark") {
	return updateAppSettings((prev) => ({
		...prev,
		userSettings: { ...prev.userSettings, theme },
	}));
}

/**
 * Sets whether the application should be forced to display in mobile layout.
 * @param forceMobile If true, the application will be forced to display in mobile layout.
 * @returns A promise that resolves to the updated app settings object.
 */
export function setForceMobile(forceMobile: boolean) {
	return updateAppSettings((prev) => ({ ...prev, forceMobile }));
}
