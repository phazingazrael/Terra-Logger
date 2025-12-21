// src/db/appSettings.ts
import Package from "../../package.json";
import type { AppInfo } from "../definitions/AppInfo";
import { initDatabase } from "./database";

export const APP_SETTINGS_ID = "TL_APP_SETTINGS" as const;

export function createDefaultAppSettings(): AppInfo {
  return {
    id: APP_SETTINGS_ID,
    application: {
      name: Package.name,
      version: Package.version,
      afmgVer: "1.105.15",
      supportedLanguages: ["en"],
      defaultLanguage: "en",
      onboarding: true,
      description: (Package as any).descriptionFull ?? Package.description ?? "",
    },
    userSettings: {
      dataDisplay: "default",
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

export function normalizeAppSettings(raw: unknown): AppInfo {
  const base = createDefaultAppSettings();
  const src = (raw ?? {}) as any;

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

  // legacy migration: some older rows used userSettings.forceMobile
  if (
    typeof src?.userSettings?.forceMobile === "boolean" &&
    typeof src?.forceMobile !== "boolean"
  ) {
    merged.forceMobile = src.userSettings.forceMobile;
  }

  return merged;
}

/**
 * Single entrypoint for reading settings.
 * - Reads canonical row
 * - Falls back to existing rows (legacy/versioned ids) once
 * - Normalizes + persists back under canonical id
 */
export async function getAppSettings(): Promise<AppInfo> {
  const db = await initDatabase();

  // Prefer canonical record
  const byId = (await db.get("appSettings", APP_SETTINGS_ID)) as unknown;

  if (byId) {
    const normalized = normalizeAppSettings(byId);
    // keep it normalized on disk too
    await db.put("appSettings", normalized);
    return normalized;
  }

  // Legacy fallback: pick "latest" existing row if any (matches old behavior)
  const all = (await db.getAll("appSettings")) as unknown[];
  const candidate = all.length ? all[all.length - 1] : undefined;

  const normalized = normalizeAppSettings(candidate);
  await db.put("appSettings", normalized);
  return normalized;
}

type Updater = Partial<AppInfo> | ((prev: AppInfo) => AppInfo);

export async function updateAppSettings(updater: Updater): Promise<AppInfo> {
  const db = await initDatabase();
  const prev = await getAppSettings();

  const next =
    typeof updater === "function"
      ? (updater as (p: AppInfo) => AppInfo)(prev)
      : {
        ...prev,
        ...(updater as Partial<AppInfo>),
        application: {
          ...prev.application,
          ...((updater as any).application ?? {}),
        },
        userSettings: {
          ...prev.userSettings,
          ...((updater as any).userSettings ?? {}),
        },
      };

  const normalized = normalizeAppSettings(next);
  await db.put("appSettings", normalized);
  return normalized;
}

// Convenience helpers (optional but keeps call sites clean)
export function setTheme(theme: "light" | "dark") {
  return updateAppSettings((prev) => ({
    ...prev,
    userSettings: { ...prev.userSettings, theme },
  }));
}

export function setForceMobile(forceMobile: boolean) {
  return updateAppSettings((prev) => ({ ...prev, forceMobile }));
}
