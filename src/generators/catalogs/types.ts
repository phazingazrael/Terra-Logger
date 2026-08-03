import type {
	GeneratorCatalogStore,
	GeneratorRecord,
} from "../../db/generators";

export const GENERATOR_CATALOG_DOCUMENT_SCHEMA =
	"terra-logger/generator-catalog-section/v1" as const;

export type GeneratorCatalogDocument = {
	$schema: typeof GENERATOR_CATALOG_DOCUMENT_SCHEMA;
	generatorType: string;
	sectionId: string;
	records: GeneratorRecord[];
};

export type GeneratorCatalogValidationPurpose = "user-input" | "default-data";

export type GeneratorCatalogValidationIssue = {
	code: string;
	path: string;
	message: string;
	severity: "error" | "warning";
};

export type GeneratorCatalogValidationContext = {
	purpose: GeneratorCatalogValidationPurpose;
	generatorType: string;
	sectionId: string;
};

export type GeneratorCatalogValidationResult = {
	valid: boolean;
	issues: GeneratorCatalogValidationIssue[];
};

export type GeneratorCatalogSectionDefinition = {
	id: string;
	generatorType: string;
	label: string;
	store: GeneratorCatalogStore;
	templatePath: string;
	referencePath: string;
	createTemplate: () => GeneratorCatalogDocument;
	matchesRecord: (record: GeneratorRecord) => boolean;
	normalize: (document: GeneratorCatalogDocument) => GeneratorCatalogDocument;
	validate: (
		input: unknown,
		purpose?: GeneratorCatalogValidationPurpose,
	) => GeneratorCatalogValidationResult;
	exportDefaultReference: (
		records: readonly GeneratorRecord[],
	) => GeneratorCatalogDocument;
};

export type GeneratorCatalogTypeDefinition = {
	id: string;
	label: string;
	sections: readonly GeneratorCatalogSectionDefinition[];
};

export type GeneratorCatalogJsonParseResult =
	| { parsed: true; value: unknown; issues: [] }
	| {
			parsed: false;
			value?: never;
			issues: GeneratorCatalogValidationIssue[];
	  };
