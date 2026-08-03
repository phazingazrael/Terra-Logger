import type { GeneratorRecord } from "../../db/generators";
import type {
	GeneratorCatalogDocument,
	GeneratorCatalogSectionDefinition,
} from "./types";

export function stringifyCatalogDocument(
	document: GeneratorCatalogDocument,
): string {
	return `${JSON.stringify(document, null, 2)}\n`;
}

export function exportSectionTemplateJson(
	section: GeneratorCatalogSectionDefinition,
): string {
	return stringifyCatalogDocument(section.normalize(section.createTemplate()));
}

export function exportSectionDefaultReferenceJson(
	section: GeneratorCatalogSectionDefinition,
	records: readonly GeneratorRecord[],
): string {
	return stringifyCatalogDocument(section.exportDefaultReference(records));
}
