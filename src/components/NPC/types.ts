import type {
	GeneratorCatalogSource,
	GeneratorRecord,
} from "../../db/generators";
import type { NPCCatalogRecordSnapshot } from "../../definitions/TerraLogger";

/** Shared contracts for NPC generation, catalogs, persistence, and diagnostics. */

export type AncestryRarity = "common" | "uncommon" | "rare";

export type AncestryDefinition = GeneratorRecord & {
	source: GeneratorCatalogSource;
	name: string;
	description: string;
	rarity: AncestryRarity;
	weight: number;
	namePoolIds: string[];
	appearanceTableIds: string[];
	allowedGenderIds?: string[];
	fantasyGenderIds?: string[];
};

export type AncestryDefinitionQuery = {
	source?: GeneratorCatalogSource;
	rarity?: AncestryRarity;
	includeDisabled?: boolean;
};

export type AppearanceTableRecord = GeneratorRecord & {
	table: string;
	value: string;
	weight: number;
};

export type AncestryAppearanceRecord = GeneratorRecord & {
	table: "npc.appearance.ancestry-specific";
	ancestryIds: string[];
	values: string[];
};

export type NPCAppearanceRecord =
	| AppearanceTableRecord
	| AncestryAppearanceRecord;

export type GenderCatalog = "real-world" | "fantasy";

export type GenderNamePoolStrategy =
	| "masculine"
	| "feminine"
	| "mixed"
	| "neutral"
	| "custom";

export type GenderDefinition = GeneratorRecord & {
	source: GeneratorCatalogSource;
	catalog: GenderCatalog;
	name: string;
	description: string;
	defaultPronouns?: string[];
	applicableAncestryIds?: string[];
	namePoolStrategy: GenderNamePoolStrategy;
	customNamePoolIds?: string[];
	generationWeight: number;
};

export type GenderDefinitionQuery = {
	source?: GeneratorCatalogSource;
	catalog?: GenderCatalog;
	ancestryId?: string;
	includeDisabled?: boolean;
};

export type GovernmentRoleClassification = "leader" | "advisor" | "official";

export type GovernmentRoleCount =
	| { mode: "fixed"; value: number }
	| { mode: "random-range"; minimum: number; maximum: number }
	| {
		mode: "per-related-entity";
		entityType: "country" | "city";
		excludeCurrentEntity?: boolean;
		multiplier?: number;
		minimum?: number;
		maximum?: number;
	};

export type GovernmentRoleDefinition = {
	id: string;
	title: string;
	description: string;
	classification: GovernmentRoleClassification;
	primary?: boolean;
	professionId?: string;
	count: GovernmentRoleCount;
};

export type GovernmentDefinition = GeneratorRecord & {
	category: string;
	name: string;
	presentation: {
		color: string;
		iconKey: string;
	};
	descriptionHtml: string;
	leadership: {
		roles: GovernmentRoleDefinition[];
	};
	municipalLeadership?: {
		roles: GovernmentRoleDefinition[];
	};
};

export type GovernmentDefinitionQuery = {
	category?: string;
	source?: "default" | "user";
	includeDisabled?: boolean;
};

export type NamePoolDefinition = GeneratorRecord & {
	source: GeneratorCatalogSource;
	name: string;
	description: string;
	ancestryIds: string[];
	masculineGivenNames: string[];
	feminineGivenNames: string[];
	neutralGivenNames: string[];
	familyNames: string[];
	nicknames: string[];
};

export type NamePoolDefinitionQuery = {
	source?: GeneratorCatalogSource;
	ancestryId?: string;
	includeDisabled?: boolean;
};


export type NPCProfileField =
	| "nickname"
	| "heritage"
	| "sexuality"
	| "alignment"
	| "condition"
	| "background"
	| "aspirationsMotivations"
	| "publicPerception"
	| "hiddenDetails";

export type NPCProfileValueRecord = GeneratorRecord & {
	table: `npc.profile.${NPCProfileField}`;
	field: NPCProfileField;
	value: string;
	weight: number;
	ancestryIds?: string[];
};

export type NPCAgeRangeRecord = GeneratorRecord & {
	table: "npc.profile.age-ranges";
	ancestryIds: string[];
	minimumAge: number;
	maximumAge: number;
	weight: number;
};

export type NPCProfileGenerationRecord =
	| NPCProfileValueRecord
	| NPCAgeRangeRecord;

export type NPCProfessionCategory = "general" | "government";

export type NPCProfessionDefinition = GeneratorRecord & {
	name: string;
	description: string;
	category: NPCProfessionCategory;
	catalog: NPCProfessionCategory;
	governmentCategory?: string;
	governmentDefinitionId?: string;
	governmentRoleId?: string;
	legacyName?: string;
	requiresBaseProfession?: boolean;
};

export type NPCProfessionQuery = {
	category?: NPCProfessionCategory;
	governmentCategory?: string;
	governmentDefinitionId?: string;
	source?: GeneratorCatalogSource;
	includeDisabled?: boolean;
};

export interface GeneratedNPC {
	fullName: string;
	nickName: string;
	pronounced: string;
	heritage: string;
	age: number | "";
	sexuality: string;
	alignment: string;
	condition: string;
	race: string;
	gender: string;
	profession: {
		title: string;
		description: string;
	};
	build: string;
	skin: {
		tone: string;
		comp: string;
	};
	eye: {
		shape: string;
		color: string;
	};
	hair: {
		style: string;
		color: string;
		facial: string;
	};
	descriptors: string;
	demeanor: string;
	activities: string;
	clan: string;
	background: string;
	aspirationsMotivations: string;
	publicPerception: string;
	hiddenDetails: string;
}

export type NPCCatalogSnapshot = NPCCatalogRecordSnapshot;

export type NPCGenerationConstraints = {
	ancestryId?: string;
	ancestryName?: string;
	genderId?: string;
	genderName?: string;
	professionId?: string;
	professionName?: string;
	governmentDefinitionId?: string;
	governmentType?: string;
	governmentRoleId?: string;
};

export type NPCGenerationOptions = {
	constraints?: NPCGenerationConstraints;
	random?: () => number;
};

export type NPCGenerationSelection = {
	ancestry: AncestryDefinition;
	gender: GenderDefinition;
	profession: NPCProfessionDefinition;
	government?: GovernmentDefinition;
	governmentRole?: GovernmentRoleDefinition;
};

export type GeneratedNPCDraft = GeneratedNPC & {
	catalog: {
		ancestry: NPCCatalogSnapshot;
		gender: NPCCatalogSnapshot;
		profession: NPCCatalogSnapshot;
		government?: NPCCatalogSnapshot;
		governmentRole?: {
			id: string;
			name: string;
		};
	};
	pronouns: string[];
};

export type GovernmentGenerationContext = {
	countryCount: number;
	cityCount: number;
	random?: () => number;
};

export type GovernmentRoleAssignment = {
	governmentDefinitionId: string;
	governmentRoleId: string;
	professionId?: string;
	title: string;
	classification: GovernmentRoleDefinition["classification"];
	primary: boolean;
	count: number;
};

export const NPC_GENERATION_BATCH_SIZE = 500;

export type NPCWorkPhase = "generation" | "persistence" | "history";

export type NPCPhaseTiming = {
	phase: NPCWorkPhase;
	startedAt: number;
	completedAt: number;
	durationMs: number;
	records: number;
};

export type NPCPerformanceDiagnostics = {
	startedAt: string;
	completedAt?: string;
	totalDurationMs?: number;
	slowestPhase?: NPCWorkPhase;
	phases: NPCPhaseTiming[];
	longTasks: Array<{ startTime: number; duration: number }>;
	watchdogDelays: Array<{
		expectedAt: number;
		observedAt: number;
		delayMs: number;
	}>;
	failedBatch?: {
		phase: NPCWorkPhase;
		startIndex: number;
		endIndex: number;
		message: string;
	};
};

export type NPCBatchProgress = {
	phase: NPCWorkPhase;
	completed: number;
	total: number;
	message: string;
};
