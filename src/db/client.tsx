// src/db/client.ts
import { initDatabase } from "./database";
import { getAppSettings, updateAppSettings } from "./appSettings";
import {
	addDataToStore,
	updateDataInStore,
	deleteDataFromStore,
	queryDataFromStore,
} from "./interactions";

import type { AppInfo } from "../definitions/AppInfo";

import type { TLMapInfo } from "../definitions/TerraLogger";

/** Store names that have a "mapIdIndex" */
export type MapScopedStore =
	| "cities"
	| "countries"
	| "cultures"
	| "notes"
	| "npcs"
	| "religions"
	| "nameBases"
	| "tags";

const ALL_STORES: MapScopedStore[] = [
	"cities",
	"countries",
	"cultures",
	"notes",
	"npcs",
	"religions",
	"nameBases",
	"tags",
];

export async function getActiveMapId(): Promise<string> {
	const s = await getAppSettings();
	if (s.activeMapId === null) {
		throw new Error("No active map selected.");
	}
	return s.activeMapId;
}

export async function setActiveMapId(mapId: string): Promise<void> {
	await updateAppSettings((prev) => {
		if (prev.activeMapId === mapId) return prev;
		return { ...prev, activeMapId: mapId };
	});
}
// ---------- map-scoped reads using your existing index ----------

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getAllByMapId<T = any>(
	store: MapScopedStore,
	mapId: string,
): Promise<T[]> {
	return queryDataFromStore(
		store,
		"mapIdIndex",
		IDBKeyRange.only(mapId),
	) as Promise<T[]>;
}

// ---------- in-memory cache (per active map) ----------

type CacheBucket = Record<
	MapScopedStore,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	{ rows: any[]; byId: Map<string, any> } | undefined
>;
const cache: Record<string, CacheBucket> = Object.create(null);

function ensureBucket(mapId: string): CacheBucket {
	if (!cache[mapId]) {
		cache[mapId] = Object.create(null);
	}
	return cache[mapId];
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function setStoreCache(mapId: string, store: MapScopedStore, rows: any[]) {
	const bucket = ensureBucket(mapId);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const byId = new Map<string, any>();
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	for (const r of rows) byId.set(String((r as any)._id), r);
	bucket[store] = { rows, byId };
}

export function getCached(
	mapId: string | null,
	store: MapScopedStore,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): any[] | null {
	if (!mapId) return null;
	return cache[mapId]?.[store]?.rows ?? null;
}

export async function loadStoreIntoCache(
	mapId: string,
	store: MapScopedStore,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
): Promise<any[]> {
	const rows = await getAllByMapId(store, mapId);
	setStoreCache(mapId, store, rows);
	return rows;
}

// ---------- cache-aware mutations (keep IDB + memory in sync) ----------

export async function addAndCache(
	store: MapScopedStore,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	data: any,
	activeMapId: string | null,
): Promise<void> {
	await addDataToStore(store, data);
	if (activeMapId && data.mapId === activeMapId) {
		const bucket = ensureBucket(activeMapId);
		let s = bucket[store];
		if (!s) {
			s = { rows: [], byId: new Map() };
			bucket[store] = s;
		}
		s.byId.set(String(data._id), data);
		s.rows.push(data);
	}
}

export async function updateAndCache(
	store: MapScopedStore,
	key: string,
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	updated: any,
	activeMapId: string | null,
): Promise<void> {
	await updateDataInStore(store, key, updated);
	if (activeMapId && updated.mapId === activeMapId) {
		const s = cache[activeMapId]?.[store];
		if (s) {
			s.byId.set(String(updated._id), updated);
			const i = s.rows.findIndex(
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(r) => String((r as any)._id) === String(updated._id),
			);
			if (i >= 0) s.rows[i] = updated;
		}
	}
}

export async function deleteAndCache(
	store: MapScopedStore,
	key: string,
	activeMapId: string | null,
): Promise<void> {
	await deleteDataFromStore(store, key);
	if (!activeMapId) return;
	const s = cache[activeMapId]?.[store];
	if (s) {
		s.byId.delete(String(key));
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const i = s.rows.findIndex((r) => String((r as any)._id) === String(key));
		if (i >= 0) s.rows.splice(i, 1);
	}
}

// Wipe a map's in-memory bucket (e.g., after a map-level delete)
export function invalidateMap(mapId: string): void {
	delete cache[mapId];
}

// Optional convenience: preload several stores for a map
export async function preloadForMap(
	mapId: string,
	pick: MapScopedStore[] = ALL_STORES,
): Promise<void> {
	const results = await Promise.all(pick.map((s) => getAllByMapId(s, mapId)));
	results.forEach((rows, i) => setStoreCache(mapId, pick[i], rows));
}

// ---------- active map (from 'maps' store) ----------
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const mapsCache = new Map<string, any>();
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getCachedMap<T = any>(id: string): T | null {
	return (mapsCache.get(id) ?? null) as T | null;
}
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export async function loadActiveMapIntoCache<T = any>(
	mapId: string,
): Promise<T | undefined> {
	// 1) The activeMapId is a mapId → use the mapIdIndex
	const db = await initDatabase();
	const tx = db.transaction("maps", "readonly");
	let m = (await tx.store.index("mapIdIndex").get(mapId)) as T | undefined;
	// 2) Fallbacks (legacy data): try keyPath 'id' or info.ID
	if (!m) m = (await db.get("maps", mapId)) as T | undefined;
	if (!m) {
		const all = (await db.getAll("maps")) as TLMapInfo[];
		m = all.find((r) => r?.info?.ID === mapId) as T | undefined;
	}
	if (m) mapsCache.set(mapId, m);
	return m;
}
