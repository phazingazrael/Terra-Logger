import {
	GENERATOR_CATALOG_DOCUMENT_SCHEMA,
	type GeneratorCatalogDocument,
	type GeneratorCatalogJsonParseResult,
	type GeneratorCatalogValidationContext,
	type GeneratorCatalogValidationIssue,
	type GeneratorCatalogValidationResult,
} from "./types";

const STABLE_GENERATOR_ID = /^(default|user):[a-z0-9][a-z0-9._-]*$/;

function error(
	issues: GeneratorCatalogValidationIssue[],
	code: string,
	path: string,
	message: string,
): void {
	issues.push({ code, path, message, severity: "error" });
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseGeneratorCatalogJson(
	json: string,
): GeneratorCatalogJsonParseResult {
	try {
		return { parsed: true, value: JSON.parse(json), issues: [] };
	} catch (parseError) {
		return {
			parsed: false,
			issues: [
				{
					code: "invalid-json",
					path: "$",
					message:
						parseError instanceof Error
							? parseError.message
							: "The JSON text could not be parsed.",
					severity: "error",
				},
			],
		};
	}
}

function validateRecord(
	value: unknown,
	index: number,
	context: GeneratorCatalogValidationContext,
	issues: GeneratorCatalogValidationIssue[],
): void {
	const path = `records[${index}]`;
	if (!isRecord(value)) {
		error(issues, "invalid-record", path, "Each record must be an object.");
		return;
	}

	if (typeof value.id !== "string" || !value.id.trim()) {
		error(issues, "missing-id", `${path}.id`, "A stable ID is required.");
	} else if (!STABLE_GENERATOR_ID.test(value.id.trim())) {
		error(
			issues,
			"invalid-id",
			`${path}.id`,
			"IDs must use default: or user: followed by lowercase letters, numbers, dots, underscores, or hyphens.",
		);
	}

	if (value.source !== "default" && value.source !== "user") {
		error(
			issues,
			"invalid-source",
			`${path}.source`,
			'Source must be "default" or "user".',
		);
	}

	if (
		context.purpose === "user-input" &&
		(value.source === "default" ||
			(typeof value.id === "string" && value.id.startsWith("default:")))
	) {
		error(
			issues,
			"reserved-default-record",
			path,
			"User catalogs cannot create or modify default records.",
		);
	}

	if (
		typeof value.version !== "number" ||
		!Number.isInteger(value.version) ||
		value.version < 1
	) {
		error(
			issues,
			"invalid-version",
			`${path}.version`,
			"Version must be a positive integer.",
		);
	}

	if (typeof value.enabled !== "boolean") {
		error(
			issues,
			"invalid-enabled",
			`${path}.enabled`,
			"Enabled must be a boolean.",
		);
	}

	for (const timestamp of ["createdAt", "updatedAt"] as const) {
		const timestampValue = value[timestamp];
		if (
			timestampValue !== undefined &&
			(typeof timestampValue !== "string" ||
				Number.isNaN(Date.parse(timestampValue)))
		) {
			error(
				issues,
				"invalid-timestamp",
				`${path}.${timestamp}`,
				`${timestamp} must be an ISO-compatible date string.`,
			);
		}
	}
}

export function validateCatalogDocument(
	input: unknown,
	context: GeneratorCatalogValidationContext,
): GeneratorCatalogValidationResult {
	const issues: GeneratorCatalogValidationIssue[] = [];

	if (!isRecord(input)) {
		error(issues, "invalid-document", "$", "The catalog must be an object.");
		return { valid: false, issues };
	}

	if (input.$schema !== GENERATOR_CATALOG_DOCUMENT_SCHEMA) {
		error(
			issues,
			"invalid-schema",
			"$.$schema",
			`Schema must be "${GENERATOR_CATALOG_DOCUMENT_SCHEMA}".`,
		);
	}
	if (input.generatorType !== context.generatorType) {
		error(
			issues,
			"wrong-generator-type",
			"$.generatorType",
			`Generator type must be "${context.generatorType}".`,
		);
	}
	if (input.sectionId !== context.sectionId) {
		error(
			issues,
			"wrong-section",
			"$.sectionId",
			`Section ID must be "${context.sectionId}".`,
		);
	}
	if (!Array.isArray(input.records)) {
		error(issues, "missing-records", "$.records", "Records must be an array.");
		return { valid: false, issues };
	}

	const identifiers = new Set<string>();
	input.records.forEach((record, index) => {
		validateRecord(record, index, context, issues);
		if (!isRecord(record) || typeof record.id !== "string") return;
		const identifier = record.id.trim();
		if (identifiers.has(identifier)) {
			error(
				issues,
				"duplicate-id",
				`records[${index}].id`,
				`Duplicate record ID "${identifier}".`,
			);
		}
		identifiers.add(identifier);
	});

	return {
		valid: !issues.some((issue) => issue.severity === "error"),
		issues,
	};
}

export function isGeneratorCatalogDocument(
	input: unknown,
): input is GeneratorCatalogDocument {
	if (!isRecord(input) || !Array.isArray(input.records)) return false;
	return (
		typeof input.$schema === "string" &&
		typeof input.generatorType === "string" &&
		typeof input.sectionId === "string"
	);
}
