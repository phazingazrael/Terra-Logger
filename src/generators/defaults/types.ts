import type { GeneratorRecord } from "../../db/generators";

export type DefaultCatalogBundle = {
	generatorType: string;
	sectionId: string;
	version: number;
	records: readonly GeneratorRecord[];
};

export type DefaultCatalogSeedCounts = {
	inserted: number;
	updated: number;
	disabled: number;
	unchanged: number;
};

export type DefaultCatalogSeedResult = DefaultCatalogSeedCounts & {
	generatorType: string;
	sectionId: string;
	version: number;
	skipped: boolean;
};

export type DefaultCatalogSeedSummary = DefaultCatalogSeedCounts & {
	results: DefaultCatalogSeedResult[];
};
