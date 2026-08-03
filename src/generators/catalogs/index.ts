export {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
	notifyGeneratorCatalogChanged,
} from "./events";
export {
	exportSectionDefaultReferenceJson,
	exportSectionTemplateJson,
	stringifyCatalogDocument,
} from "./exporters";
export {
	normalizeCatalogDocument,
	normalizeGeneratorRecord,
} from "./normalization";
export {
	npcCatalogSections,
	npcCatalogTypeDefinition,
} from "./npc";
export {
	GeneratorCatalogRegistry,
	generatorCatalogRegistry,
} from "./registry";
export { createCatalogSectionDefinition } from "./sectionFactory";
export {
	createGeneratorCatalogTemplateArchive,
	GENERATOR_CATALOG_TEMPLATE_ARCHIVE_NAME,
	GENERATOR_CATALOG_TEMPLATE_ARCHIVE_ROOT,
} from "./templateArchive";
export {
	GENERATOR_CATALOG_DOCUMENT_SCHEMA,
	type GeneratorCatalogDocument,
	type GeneratorCatalogJsonParseResult,
	type GeneratorCatalogSectionDefinition,
	type GeneratorCatalogTypeDefinition,
	type GeneratorCatalogValidationContext,
	type GeneratorCatalogValidationIssue,
	type GeneratorCatalogValidationPurpose,
	type GeneratorCatalogValidationResult,
} from "./types";
export {
	deleteSectionUserCatalog,
	exportSectionUserCatalog,
	getSectionUserRecords,
	previewUserCatalogChanges,
	saveUserCatalog,
	type UserCatalogChangePreview,
	type UserCatalogSaveMode,
} from "./userCatalogRepository";
export {
	isGeneratorCatalogDocument,
	parseGeneratorCatalogJson,
	validateCatalogDocument,
} from "./validation";
