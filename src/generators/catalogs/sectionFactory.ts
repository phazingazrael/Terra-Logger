import type {
	GeneratorCatalogStore,
	GeneratorRecord,
} from "../../db/generators";
import { normalizeCatalogDocument } from "./normalization";
import {
	GENERATOR_CATALOG_DOCUMENT_SCHEMA,
	type GeneratorCatalogDocument,
	type GeneratorCatalogSectionDefinition,
	type GeneratorCatalogValidationIssue,
	type GeneratorCatalogValidationPurpose,
} from "./types";
import {
	isGeneratorCatalogDocument,
	validateCatalogDocument,
} from "./validation";

type CatalogSectionFactoryOptions = {
	id: string;
	generatorType: string;
	label: string;
	store: GeneratorCatalogStore;
	templatePath: string;
	referencePath: string;
	exampleRecord: GeneratorRecord;
	recordMatches?: (record: GeneratorRecord) => boolean;
	validateRecord?: (
		record: GeneratorRecord,
		index: number,
	) => GeneratorCatalogValidationIssue[];
};

function createDocument(
	generatorType: string,
	sectionId: string,
	records: GeneratorRecord[],
): GeneratorCatalogDocument {
	return {
		$schema: GENERATOR_CATALOG_DOCUMENT_SCHEMA,
		generatorType,
		sectionId,
		records,
	};
}

export function createCatalogSectionDefinition(
	options: CatalogSectionFactoryOptions,
): GeneratorCatalogSectionDefinition {
	const context = {
		generatorType: options.generatorType,
		sectionId: options.id,
	};
	const matchesRecord = options.recordMatches ?? (() => true);

	return {
		id: options.id,
		generatorType: options.generatorType,
		label: options.label,
		store: options.store,
		templatePath: options.templatePath,
		referencePath: options.referencePath,
		createTemplate: () =>
			createDocument(options.generatorType, options.id, [
				{ ...options.exampleRecord },
			]),
		matchesRecord,
		normalize: normalizeCatalogDocument,
		validate: (
			input: unknown,
			purpose: GeneratorCatalogValidationPurpose = "user-input",
		) => {
			const result = validateCatalogDocument(input, { ...context, purpose });
			if (!isGeneratorCatalogDocument(input)) return result;

			const sectionIssues: GeneratorCatalogValidationIssue[] = [];
			input.records.forEach((record, index) => {
				if (!matchesRecord(record)) {
					sectionIssues.push({
						code: "record-outside-section",
						path: `records[${index}]`,
						message: `Record "${record.id}" does not belong to the ${options.label} section.`,
						severity: "error",
					});
				}
				if (matchesRecord(record)) {
					sectionIssues.push(
						...(options.validateRecord?.(record, index) ?? []),
					);
				}
			});

			return {
				valid: result.valid && sectionIssues.length === 0,
				issues: [...result.issues, ...sectionIssues],
			};
		},
		exportDefaultReference: (records: readonly GeneratorRecord[]) =>
			normalizeCatalogDocument(
				createDocument(
					options.generatorType,
					options.id,
					records
						.filter((record) => record.source === "default")
						.filter(matchesRecord)
						.map((record) => ({ ...record })),
				),
			),
	};
}
