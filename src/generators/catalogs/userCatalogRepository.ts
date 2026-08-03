import { initGeneratorsDatabase } from "../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../db/generators";
import { notifyGeneratorCatalogChanged } from "./events";
import { stringifyCatalogDocument } from "./exporters";
import type {
	GeneratorCatalogDocument,
	GeneratorCatalogSectionDefinition,
} from "./types";

export type UserCatalogSaveMode = "merge" | "replace";

export type UserCatalogChangePreview = {
	inserted: string[];
	updated: string[];
	removed: string[];
	unchanged: string[];
};

function sorted(records: readonly GeneratorRecord[]): GeneratorRecord[] {
	return [...records].sort((left, right) => left.id.localeCompare(right.id));
}

function recordsMatch(left: GeneratorRecord, right: GeneratorRecord): boolean {
	return JSON.stringify(left) === JSON.stringify(right);
}

function assertValidUserDocument(
	section: GeneratorCatalogSectionDefinition,
	document: GeneratorCatalogDocument,
): GeneratorCatalogDocument {
	const validation = section.validate(document, "user-input");
	if (!validation.valid) {
		throw new Error(
			validation.issues.map((issue) => issue.message).join(" ") ||
				"The user catalog is invalid.",
		);
	}
	return section.normalize(document);
}

export async function getSectionUserRecords(
	section: GeneratorCatalogSectionDefinition,
): Promise<GeneratorRecord[]> {
	const database = await initGeneratorsDatabase();
	const records = await database.getAllFromIndex(
		section.store,
		"sourceIndex",
		"user",
	);
	return sorted(records.filter(section.matchesRecord));
}

export async function previewUserCatalogChanges(
	section: GeneratorCatalogSectionDefinition,
	document: GeneratorCatalogDocument,
	mode: UserCatalogSaveMode,
): Promise<UserCatalogChangePreview> {
	const normalized = assertValidUserDocument(section, document);
	const current = await getSectionUserRecords(section);
	const currentById = new Map(current.map((record) => [record.id, record]));
	const submittedIds = new Set(normalized.records.map((record) => record.id));
	const preview: UserCatalogChangePreview = {
		inserted: [],
		updated: [],
		removed: [],
		unchanged: [],
	};

	for (const record of normalized.records) {
		const existing = currentById.get(record.id);
		if (!existing) preview.inserted.push(record.id);
		else if (recordsMatch(existing, record)) preview.unchanged.push(record.id);
		else preview.updated.push(record.id);
	}

	if (mode === "replace") {
		preview.removed = current
			.filter((record) => !submittedIds.has(record.id))
			.map((record) => record.id);
	}

	return preview;
}

export async function saveUserCatalog(
	section: GeneratorCatalogSectionDefinition,
	document: GeneratorCatalogDocument,
	mode: UserCatalogSaveMode,
): Promise<UserCatalogChangePreview> {
	const normalized = assertValidUserDocument(section, document);
	const preview = await previewUserCatalogChanges(section, normalized, mode);
	const database = await initGeneratorsDatabase();
	const transaction = database.transaction(section.store, "readwrite");
	const store = transaction.objectStore(section.store);

	for (const record of normalized.records) {
		await store.put(record);
	}
	if (mode === "replace") {
		for (const identifier of preview.removed) {
			await store.delete(identifier);
		}
	}

	await transaction.done;
	notifyGeneratorCatalogChanged(section.id);
	return preview;
}

export async function deleteSectionUserCatalog(
	section: GeneratorCatalogSectionDefinition,
): Promise<number> {
	const records = await getSectionUserRecords(section);
	if (!records.length) return 0;

	const database = await initGeneratorsDatabase();
	const transaction = database.transaction(section.store, "readwrite");
	const store = transaction.objectStore(section.store);
	for (const record of records) {
		await store.delete(record.id);
	}
	await transaction.done;
	notifyGeneratorCatalogChanged(section.id);
	return records.length;
}

export async function exportSectionUserCatalog(
	section: GeneratorCatalogSectionDefinition,
): Promise<string> {
	const records = await getSectionUserRecords(section);
	return stringifyCatalogDocument(
		section.normalize({
			...section.createTemplate(),
			records,
		}),
	);
}
