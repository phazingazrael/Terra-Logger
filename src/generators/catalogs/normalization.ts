import type { GeneratorRecord } from "../../db/generators";
import type { GeneratorCatalogDocument } from "./types";

function normalizeOptionalTimestamp(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const normalized = value.trim();
	return normalized || undefined;
}

export function normalizeGeneratorRecord(
	record: GeneratorRecord,
): GeneratorRecord {
	const normalized: GeneratorRecord = {
		...record,
		id: record.id.trim(),
		source: record.source,
		version: record.version,
		enabled: record.enabled,
	};

	const createdAt = normalizeOptionalTimestamp(record.createdAt);
	const updatedAt = normalizeOptionalTimestamp(record.updatedAt);

	if (createdAt) normalized.createdAt = createdAt;
	else delete normalized.createdAt;

	if (updatedAt) normalized.updatedAt = updatedAt;
	else delete normalized.updatedAt;

	return normalized;
}

export function normalizeCatalogDocument(
	document: GeneratorCatalogDocument,
): GeneratorCatalogDocument {
	return {
		...document,
		generatorType: document.generatorType.trim(),
		sectionId: document.sectionId.trim(),
		records: document.records
			.map(normalizeGeneratorRecord)
			.sort((left, right) => left.id.localeCompare(right.id)),
	};
}
