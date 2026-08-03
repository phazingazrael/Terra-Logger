// src/db/client.ts
/** biome-ignore-all lint/suspicious/noExplicitAny: We're modifying DB, any could be accepted. */
import { ensurePersistentNPCFields } from "../components/NPC/persistence/normalize";
import type { TLNPC } from "../definitions/TerraLogger";
import type { TLMapInfo } from "../definitions/TerraLogger";
import { getAppSettings, updateAppSettings } from "./appSettings";
import {
	initMapsDatabase,
	type MapScopedStore,
	mapScopedStores,
} from "./connections/mapsDatabase";
import {
	addDataToStore,
	deleteDataFromStore,
	queryDataFromStore,
	updateDataInStore,
} from "./interactions";
import {
	addCachedRecord,
	deleteCachedRecord,
	getCachedMapRecord,
	getCachedStore,
	setCachedMap,
	setCachedStore,
	updateCachedRecord,
} from "./mapCache";

export async function getActiveMapId(): Promise<string | null> {
	const s = await getAppSettings();
	return s.activeMapId;
}

export async function setActiveMapId(mapId: string | null): Promise<void> {
	await updateAppSettings((prev) => {
		if (prev.activeMapId === mapId) return prev;
		return { ...prev, activeMapId: mapId };
	});
}
// ---------- map-scoped reads using your existing index ----------
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

export function getCached(
	mapId: string | null,
	store: MapScopedStore,
): any[] | null {
	return getCachedStore(mapId, store);
}

const NPC_COMPLETENESS_FIELDS = [
	"nickName",
	"pronounced",
	"heritage",
	"age",
	"sexuality",
	"alignment",
	"condition",
	"background",
	"aspirationsMotivations",
	"publicPerception",
	"hiddenDetails",
] as const;

function npcNeedsCompletenessRepair(original: TLNPC, normalized: TLNPC): boolean {
	return NPC_COMPLETENESS_FIELDS.some((field) => original[field] !== normalized[field]);
}

async function repairLoadedNPCs(rows: any[]): Promise<any[]> {
	const normalized = rows.map((row) => ensurePersistentNPCFields(row as TLNPC));
	const repairs = normalized.filter((row, index) => npcNeedsCompletenessRepair(rows[index] as TLNPC, row));
	if (!repairs.length) return normalized;

	const db = await initMapsDatabase();
	const batchSize = 250;
	for (let start = 0; start < repairs.length; start += batchSize) {
		const tx = db.transaction("npcs", "readwrite");
		// The bounded transaction batch must finish before the next batch begins.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await Promise.all(
			repairs
				.slice(start, start + batchSize)
				.map((npc) => tx.store.put(npc)),
		);
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await tx.done;
		// Yield between repair batches to keep the interface responsive.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await new Promise<void>((resolve) => setTimeout(resolve, 0));
	}
	return normalized;
}

async function prepareRowsForCache(store: MapScopedStore, rows: any[]): Promise<any[]> {
	return store === "npcs" ? repairLoadedNPCs(rows) : rows;
}

export async function loadStoreIntoCache(
	mapId: string,
	store: MapScopedStore,
): Promise<any[]> {
	const rows = await prepareRowsForCache(store, await getAllByMapId(store, mapId));
	setCachedStore(mapId, store, rows);
	return rows;
}

// ---------- cache-aware mutations (keep IDB + memory in sync) ----------

export async function addAndCache(
	store: MapScopedStore,
	data: any,
	activeMapId: string | null,
): Promise<void> {
	const prepared = store === "npcs" ? ensurePersistentNPCFields(data as TLNPC) : data;
	await addDataToStore(store, prepared);
	if (activeMapId && prepared.mapId === activeMapId) {
		addCachedRecord(activeMapId, store, prepared);
	}
}

export async function updateAndCache(
	store: MapScopedStore,
	key: string,
	updated: any,
	activeMapId: string | null,
): Promise<void> {
	const prepared = store === "npcs" ? ensurePersistentNPCFields(updated as TLNPC) : updated;
	await updateDataInStore(store, key, prepared);
	if (activeMapId && prepared.mapId === activeMapId) {
		updateCachedRecord(activeMapId, store, prepared);
	}
}

export async function deleteAndCache(
	store: MapScopedStore,
	key: string,
	activeMapId: string | null,
): Promise<void> {
	await deleteDataFromStore(store, key);
	if (activeMapId) deleteCachedRecord(activeMapId, store, key);
}

// Optional convenience: preload several stores for a map
export async function preloadForMap(
	mapId: string,
	pick: readonly MapScopedStore[] = mapScopedStores,
): Promise<void> {
	const uniqueStores = [...new Set(pick)];
	const results = await Promise.all(
		uniqueStores.map(async (store) => prepareRowsForCache(store, await getAllByMapId(store, mapId))),
	);
	results.forEach((rows, i) => {
		setCachedStore(mapId, uniqueStores[i], rows);
	});
}

// ---------- active map (from 'maps' store) ----------
export function getCachedMap<T = any>(id: string): T | null {
	return getCachedMapRecord<T>(id);
}
export async function loadActiveMapIntoCache<T = any>(
	mapId: string,
): Promise<T | undefined> {
	// 1) The activeMapId is a mapId → use the mapIdIndex
	const db = await initMapsDatabase();
	const tx = db.transaction("maps", "readonly");
	let m = (await tx.store.index("mapIdIndex").get(mapId)) as T | undefined;
	// 2) Fallbacks (legacy data): try keyPath 'id' or info.ID
	if (!m) m = (await db.get("maps", mapId)) as T | undefined;
	if (!m) {
		const all = (await db.getAll("maps")) as TLMapInfo[];
		m = all.find((r) => r?.info?.ID === mapId) as T | undefined;
	}
	if (m) setCachedMap(mapId, m);
	return m;
}
