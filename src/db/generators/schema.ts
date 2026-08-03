import type { DBSchema } from "idb";

export type GeneratorCatalogSource = "default" | "user";

export type GeneratorRecord = {
	id: string;
	source: GeneratorCatalogSource;
	version: number;
	enabled: boolean;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown;
};

export const generatorCatalogStores = [
	"ancestries",
	"genders",
	"professions",
	"governmentDefinitions",
	"namePools",
	"generationTables",
] as const;

export type GeneratorCatalogStore = (typeof generatorCatalogStores)[number];

const generatorDatabaseStores = [
	"catalogMetadata",
	...generatorCatalogStores,
] as const;

export type GeneratorDatabaseStore = (typeof generatorDatabaseStores)[number];

export type GeneratorCatalogMetadata = GeneratorRecord & {
	generatorType: string;
	sectionId: string;
	store: GeneratorCatalogStore;
	recordCount?: number;
	seededAt?: string;
};

export const generatorCommonIndexes = {
	source: "sourceIndex",
	version: "versionIndex",
	updatedAt: "updatedAtIndex",
} as const;

export const generatorMetadataIndexes = {
	generatorType: "generatorTypeIndex",
	sectionId: "sectionIdIndex",
	generatorTypeSection: "generatorTypeSectionIndex",
} as const;

type GeneratorRecordIndexes = {
	sourceIndex: GeneratorCatalogSource;
	versionIndex: number;
	updatedAtIndex: string;
};

type GeneratorStoreSchema = {
	key: string;
	value: GeneratorRecord;
	indexes: GeneratorRecordIndexes;
};

export interface TerraLoggerGeneratorsSchema extends DBSchema {
	catalogMetadata: {
		key: string;
		value: GeneratorCatalogMetadata;
		indexes: GeneratorRecordIndexes & {
			generatorTypeIndex: string;
			sectionIdIndex: string;
			generatorTypeSectionIndex: [string, string];
		};
	};
	ancestries: GeneratorStoreSchema;
	genders: GeneratorStoreSchema;
	professions: GeneratorStoreSchema;
	governmentDefinitions: GeneratorStoreSchema;
	namePools: GeneratorStoreSchema;
	generationTables: GeneratorStoreSchema;
}

export const generatorCatalogOwnership = {
	default: {
		userCanCreate: false,
		userCanUpdate: false,
		userCanDelete: false,
	},
	user: {
		userCanCreate: true,
		userCanUpdate: true,
		userCanDelete: true,
	},
} as const satisfies Record<
	GeneratorCatalogSource,
	{
		userCanCreate: boolean;
		userCanUpdate: boolean;
		userCanDelete: boolean;
	}
>;
