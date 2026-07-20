// src/db/DataContext.tsx
/** biome-ignore-all lint/suspicious/noExplicitAny: We're modifying DB, any could be accepted. */
import React, {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useReducer,
} from "react";
import type { MapScopedStore } from "./database";
import {
	getActiveMapId,
	setActiveMapId,
	getCached,
	loadStoreIntoCache,
	addAndCache,
	updateAndCache,
	deleteAndCache,
	preloadForMap,
	getCachedMap,
	loadActiveMapIntoCache,
} from "./client";

type Ctx = {
	activeMapId: string | null;
	setActive: (mapId: string) => Promise<void>;
	/** Lazy selector: returns the array for the active map & given store. */
	useActive: <T = any>(store: MapScopedStore) => T[];
	/** Lazy selector: returns the active map object from 'maps' store. */
	useActiveMap: <T = any>() => T | null;
	/** Mutations (already cache-aware) */
	add: (store: MapScopedStore, data: any) => Promise<void>;
	update: (store: MapScopedStore, key: string, updated: any) => Promise<void>;
	remove: (store: MapScopedStore, key: string) => Promise<void>;
	/** Optional: preload several stores for the active map at once */
	preload: (stores: MapScopedStore[]) => Promise<void>;
};

const DBContext = createContext<Ctx | undefined>(undefined);

export function useDB() {
	const ctx = useContext(DBContext);
	if (!ctx) throw new Error("useDB must be used within <DBProvider>");
	return ctx;
}

export function DBProvider({ children }: React.PropsWithChildren<any>) {
	const [activeMapId, setActiveState] = React.useState<string | null>(null);
	// a simple "version" bump forces subscribers to reread the cache.
	const [version, bump] = useReducer((x) => x + 1, 0);

	// Restore previously active map on boot
	useEffect(() => {
		(async () => {
			const saved = await getActiveMapId();
			if (saved) setActiveState(saved);
		})();
	}, []);

	const setActive = async (mapId: string) => {
		setActiveState(mapId);
		await setActiveMapId(mapId);
		// Optionally eager-preload a few hot stores here:
		await preloadForMap(mapId, ["cities"]);
		bump();
	};

	// Hook that components will call to read active data for a store

	function useActive<T = any>(store: MapScopedStore): T[] {
		const [, force] = React.useReducer((x) => x + 1, 0);

		// biome-ignore lint/correctness/useExhaustiveDependencies: needs to run on map change
		useEffect(() => {
			let cancelled = false;
			(async () => {
				if (!activeMapId) return;
				if (getCached(activeMapId, store) == null) {
					await loadStoreIntoCache(activeMapId, store);
					if (!cancelled) force(); // re-render this subscriber
				}
			})();
			return () => {
				cancelled = true;
			};
			// re-run when store or active map changes or provider version bumps
		}, [store, activeMapId, version]);

		return (activeMapId ? (getCached(activeMapId, store) ?? []) : []) as T[];
	}

	const add = async (store: MapScopedStore, data: any) => {
		await addAndCache(store, data, activeMapId);
		bump();
	};

	const update = async (store: MapScopedStore, key: string, updated: any) => {
		await updateAndCache(store, key, updated, activeMapId);
		bump();
	};
	const remove = async (store: MapScopedStore, key: string) => {
		await deleteAndCache(store, key, activeMapId);
		bump();
	};
	const preload = async (pick: MapScopedStore[]) => {
		if (!activeMapId) return;
		await preloadForMap(activeMapId, pick);
		bump();
	};

	function useActiveMap<T = any>(): T | null {
		const [, force] = React.useReducer((x) => x + 1, 0);
		// biome-ignore lint/correctness/useExhaustiveDependencies: needs to run on map change
		useEffect(() => {
			let cancelled = false;
			(async () => {
				if (!activeMapId) return;
				if (!getCachedMap(activeMapId)) {
					await loadActiveMapIntoCache(activeMapId);
					if (!cancelled) force();
				}
			})();
			return () => {
				cancelled = true;
			};
		}, [activeMapId, version]);
		return activeMapId ? (getCachedMap<T>(activeMapId) as T | null) : null;
	}

	// biome-ignore lint/correctness/useExhaustiveDependencies: meant to keep the context value’s identity stable
	const value = useMemo<Ctx>(
		() => ({
			activeMapId,
			setActive,
			useActive,
			useActiveMap,
			add,
			update,
			remove,
			preload,
		}),
		[activeMapId, version],
	);

	return <DBContext.Provider value={value}>{children}</DBContext.Provider>;
}
