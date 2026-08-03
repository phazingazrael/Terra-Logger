import { initGeneratorsDatabase } from "../../db/connections/generatorsDatabase";
import { seedRegisteredDefaultCatalogs } from "./seeder";
import type { DefaultCatalogSeedSummary } from "./types";
import "./bundles";

let initializationPromise: Promise<DefaultCatalogSeedSummary> | null = null;

export function initializeGeneratorCatalogs(): Promise<DefaultCatalogSeedSummary> {
	initializationPromise ??= (async () => {
		await initGeneratorsDatabase();
		return seedRegisteredDefaultCatalogs();
	})();

	return initializationPromise;
}
