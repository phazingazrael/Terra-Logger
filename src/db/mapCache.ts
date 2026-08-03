import type { MapScopedStore } from "./connections/mapsDatabase";

type MapCacheRecord = {
	_id: unknown;
	[key: string]: unknown;
};

type CachedStore = {
	rows: MapCacheRecord[];
	byId: Map<string, MapCacheRecord>;
};
type CacheBucket = Partial<Record<MapScopedStore, CachedStore>>;

const storeCache: Record<string, CacheBucket> = Object.create(null);
const mapsCache = new Map<string, unknown>();

function ensureBucket(mapId: string): CacheBucket {
	storeCache[mapId] ??= Object.create(null);
	return storeCache[mapId];
}

export function setCachedStore(
	mapId: string,
	store: MapScopedStore,
	rows: MapCacheRecord[],
): void {
	const byId = new Map<string, MapCacheRecord>();
	for (const row of rows) byId.set(String(row._id), row);
	ensureBucket(mapId)[store] = { rows, byId };
}

export function getCachedStore(
	mapId: string | null,
	store: MapScopedStore,
): MapCacheRecord[] | null {
	if (!mapId) return null;
	return storeCache[mapId]?.[store]?.rows ?? null;
}

export function addCachedRecord(
	mapId: string,
	store: MapScopedStore,
	record: MapCacheRecord,
): void {
	const bucket = ensureBucket(mapId);
	let cached = bucket[store];
	if (!cached) {
		cached = { rows: [], byId: new Map() };
		bucket[store] = cached;
	}
	cached.byId.set(String(record._id), record);
	cached.rows.push(record);
}

export function updateCachedRecord(
	mapId: string,
	store: MapScopedStore,
	record: MapCacheRecord,
): void {
	const cached = storeCache[mapId]?.[store];
	if (!cached) return;

	cached.byId.set(String(record._id), record);
	const index = cached.rows.findIndex(
		(row) => String(row._id) === String(record._id),
	);
	if (index >= 0) cached.rows[index] = record;
}

export function deleteCachedRecord(
	mapId: string,
	store: MapScopedStore,
	key: IDBValidKey,
): void {
	const cached = storeCache[mapId]?.[store];
	if (!cached) return;

	cached.byId.delete(String(key));
	const index = cached.rows.findIndex((row) => String(row._id) === String(key));
	if (index >= 0) cached.rows.splice(index, 1);
}

export function setCachedMap<T>(mapId: string, map: T): void {
	mapsCache.set(mapId, map);
}

export function getCachedMapRecord<T>(mapId: string): T | null {
	return (mapsCache.get(mapId) ?? null) as T | null;
}

export function clearMapCache(mapId: string): void {
	delete storeCache[mapId];
	mapsCache.delete(mapId);
}

export function clearAllMapCaches(): void {
	for (const mapId of Object.keys(storeCache)) {
		delete storeCache[mapId];
	}
	mapsCache.clear();
}
