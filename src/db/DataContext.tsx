// src/db/DataContext.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: Database functions accept several record types. */

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useState,
} from "react";
import {
	addAndCache,
	deleteAndCache,
	getActiveMapId,
	getCached,
	getCachedMap,
	loadActiveMapIntoCache,
	loadStoreIntoCache,
	preloadForMap,
	setActiveMapId,
	updateAndCache,
} from "./client";
import type { MapScopedStore } from "./connections/mapsDatabase";

type DatabaseContextValue = {
	activeMapId: string | null;

	/**
	 * Changes the active map and preloads its common data.
	 */
	setActive: (mapId: string | null) => Promise<void>;

	/**
	 * Changes when the shared database cache changes.
	 *
	 * The data-reading Hooks use this value to read the cache again.
	 */
	version: number;

	/**
	 * Reports whether a store has loaded for the active map.
	 */
	isActiveLoaded: (store: MapScopedStore) => boolean;

	/**
	 * Cache-aware database mutations.
	 */
	add: (store: MapScopedStore, data: any) => Promise<void>;

	update: (store: MapScopedStore, key: string, updated: any) => Promise<void>;

	remove: (store: MapScopedStore, key: string) => Promise<void>;

	/**
	 * Preloads several stores for the active map.
	 */
	preload: (stores: MapScopedStore[]) => Promise<void>;
};

const EMPTY_RESULTS: never[] = [];

const DBContext = createContext<DatabaseContextValue | undefined>(undefined);

function useDatabaseContext(): DatabaseContextValue {
	const context = useContext(DBContext);

	if (!context) {
		throw new Error("Database Hooks must be used within <DBProvider>.");
	}

	return context;
}

/**
 * Returns the database actions and active-map information.
 */
export function useDB(): DatabaseContextValue {
	return useDatabaseContext();
}

/**
 * Returns records from one store for the active map.
 *
 * The Hook loads the store into the shared cache when required.
 */
export function useActive<T = any>(store: MapScopedStore): T[] {
	const { activeMapId, version } = useDatabaseContext();

	const [, forceRender] = useReducer((value: number) => value + 1, 0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: version is included because a cache load can complete without changing activeMapId
	useEffect(() => {
		let cancelled = false;

		async function loadActiveStore() {
			if (!activeMapId) return;

			if (getCached(activeMapId, store) != null) {
				return;
			}

			await loadStoreIntoCache(activeMapId, store);

			if (!cancelled) {
				forceRender();
			}
		}

		void loadActiveStore();

		return () => {
			cancelled = true;
		};
	}, [activeMapId, store, version]);

	if (!activeMapId) {
		return EMPTY_RESULTS as T[];
	}

	return (getCached(activeMapId, store) ?? EMPTY_RESULTS) as T[];
}

/**
 * Returns the complete active map record.
 *
 * The Hook loads the map into the shared cache when required.
 */
export function useActiveMap<T = any>(): T | null {
	const { activeMapId, version } = useDatabaseContext();

	const [, forceRender] = useReducer((value: number) => value + 1, 0);

	// biome-ignore lint/correctness/useExhaustiveDependencies: version is included because a cache load can complete without changing activeMapId
	useEffect(() => {
		let cancelled = false;

		async function loadMap() {
			if (!activeMapId) return;

			if (getCachedMap(activeMapId)) {
				return;
			}

			await loadActiveMapIntoCache(activeMapId);

			if (!cancelled) {
				forceRender();
			}
		}

		void loadMap();

		return () => {
			cancelled = true;
		};
	}, [activeMapId, version]);

	if (!activeMapId) {
		return null;
	}

	return getCachedMap<T>(activeMapId) as T | null;
}

export function DBProvider({ children }: React.PropsWithChildren) {
	const [activeMapId, setActiveState] = useState<string | null>(null);

	/**
	 * A version change tells readers to get the current cache value.
	 */
	const [version, bumpVersion] = useReducer((value: number) => value + 1, 0);

	/**
	 * Restores the previous active map when the application starts.
	 */
	useEffect(() => {
		let cancelled = false;

		async function restoreActiveMap() {
			const savedMapId = await getActiveMapId();

			if (!cancelled && savedMapId) {
				setActiveState(savedMapId);
			}
		}

		void restoreActiveMap();

		return () => {
			cancelled = true;
		};
	}, []);

	const setActive = useCallback(async (mapId: string | null): Promise<void> => {
		setActiveState(mapId);
		await setActiveMapId(mapId);

		if (mapId) {
			await preloadForMap(mapId, ["cities"]);
		}

		bumpVersion();
	}, []);

	const add = useCallback(
		async (store: MapScopedStore, data: any): Promise<void> => {
			await addAndCache(store, data, activeMapId);

			bumpVersion();
		},
		[activeMapId],
	);

	const update = useCallback(
		async (store: MapScopedStore, key: string, updated: any): Promise<void> => {
			await updateAndCache(store, key, updated, activeMapId);

			bumpVersion();
		},
		[activeMapId],
	);

	const remove = useCallback(
		async (store: MapScopedStore, key: string): Promise<void> => {
			await deleteAndCache(store, key, activeMapId);

			bumpVersion();
		},
		[activeMapId],
	);

	const preload = useCallback(
		async (stores: MapScopedStore[]): Promise<void> => {
			if (!activeMapId) return;

			await preloadForMap(activeMapId, stores);

			bumpVersion();
		},
		[activeMapId],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: version is included because a cache load can complete without changing activeMapId
	const isActiveLoaded = useCallback(
		(store: MapScopedStore): boolean =>
			!activeMapId || getCached(activeMapId, store) != null,
		[activeMapId, version],
	);

	const value = useMemo<DatabaseContextValue>(
		() => ({
			activeMapId,
			setActive,
			version,
			isActiveLoaded,
			add,
			update,
			remove,
			preload,
		}),
		[
			activeMapId,
			setActive,
			version,
			isActiveLoaded,
			add,
			update,
			remove,
			preload,
		],
	);

	return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}
