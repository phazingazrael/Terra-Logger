import { initGeneratorsDatabase } from "../../db/connections/generatorsDatabase";
import type {
	GeneratorCatalogMetadata,
	GeneratorCatalogStore,
	GeneratorRecord,
} from "../../db/generators";
import {
	GENERATOR_CATALOG_DOCUMENT_SCHEMA,
	generatorCatalogRegistry,
} from "../catalogs";
import { defaultCatalogBundleRegistry } from "./registry";
import type {
	DefaultCatalogBundle,
	DefaultCatalogSeedCounts,
	DefaultCatalogSeedResult,
	DefaultCatalogSeedSummary,
} from "./types";

function emptyCounts(): DefaultCatalogSeedCounts {
	return { inserted: 0, updated: 0, disabled: 0, unchanged: 0 };
}

function metadataId(sectionId: string): string {
	return `default:metadata.${sectionId}`;
}

function recordsEqual(left: GeneratorRecord, right: GeneratorRecord): boolean {
	return JSON.stringify(left) === JSON.stringify(right);
}

function prepareBundle(bundle: DefaultCatalogBundle): {
	section: ReturnType<typeof generatorCatalogRegistry.requireSection>;
	records: GeneratorRecord[];
} {
	if (!Number.isInteger(bundle.version) || bundle.version < 1) {
		throw new Error(
			`Default bundle "${bundle.sectionId}" needs a positive integer version.`,
		);
	}

	const section = generatorCatalogRegistry.requireSection(bundle.sectionId);
	if (section.generatorType !== bundle.generatorType) {
		throw new Error(
			`Bundle "${bundle.sectionId}" does not belong to "${bundle.generatorType}".`,
		);
	}

	const normalized = section.normalize({
		$schema: GENERATOR_CATALOG_DOCUMENT_SCHEMA,
		generatorType: bundle.generatorType,
		sectionId: bundle.sectionId,
		records: bundle.records.map((record) => ({ ...record })),
	});
	// Default bundles are trusted application data. Do not apply the user catalog
	// validation rules here. Those rules can reject valid internal identifiers and
	// are only required for data that a user can add or change.

	for (const record of normalized.records) {
		if (record.source !== "default" || !record.id.startsWith("default:")) {
			throw new Error(
				`Default bundle "${bundle.sectionId}" contains non-default record "${record.id}".`,
			);
		}
		if (!section.matchesRecord(record)) {
			throw new Error(
				`Record "${record.id}" does not belong to section "${bundle.sectionId}".`,
			);
		}
	}

	return { section, records: normalized.records };
}

export async function seedDefaultCatalogBundle(
	bundle: DefaultCatalogBundle,
): Promise<DefaultCatalogSeedResult> {
	const { section, records } = prepareBundle(bundle);
	const db = await initGeneratorsDatabase();
	const id = metadataId(bundle.sectionId);
	const metadata = await db.get("catalogMetadata", id);

	if (metadata?.version === bundle.version) {
		return {
			...emptyCounts(),
			unchanged: records.length,
			generatorType: bundle.generatorType,
			sectionId: bundle.sectionId,
			version: bundle.version,
			skipped: true,
		};
	}

	const storeName: GeneratorCatalogStore = section.store;
	const tx = db.transaction(["catalogMetadata", storeName], "readwrite");
	const catalogStore = tx.objectStore(storeName);
	const existingDefaults = (
		await catalogStore.index("sourceIndex").getAll("default")
	).filter(section.matchesRecord);
	const existingById = new Map(
		existingDefaults.map((record) => [record.id, record]),
	);
	const incomingIds = new Set(records.map((record) => record.id));
	const counts = emptyCounts();

	for (const record of records) {
		const existing = existingById.get(record.id);
		if (!existing) {
			await catalogStore.add(record);
			counts.inserted += 1;
		} else if (!recordsEqual(existing, record)) {
			await catalogStore.put(record);
			counts.updated += 1;
		} else {
			counts.unchanged += 1;
		}
	}

	for (const existing of existingDefaults) {
		if (incomingIds.has(existing.id) || !existing.enabled) continue;
		await catalogStore.put({
			...existing,
			enabled: false,
			version: bundle.version,
			updatedAt: new Date().toISOString(),
		});
		counts.disabled += 1;
	}

	const now = new Date().toISOString();
	const nextMetadata: GeneratorCatalogMetadata = {
		id,
		generatorType: bundle.generatorType,
		sectionId: bundle.sectionId,
		store: storeName,
		source: "default",
		version: bundle.version,
		enabled: true,
		recordCount: records.length,
		seededAt: now,
		updatedAt: now,
	};
	await tx.objectStore("catalogMetadata").put(nextMetadata);
	await tx.done;

	return {
		...counts,
		generatorType: bundle.generatorType,
		sectionId: bundle.sectionId,
		version: bundle.version,
		skipped: false,
	};
}

export async function seedRegisteredDefaultCatalogs(): Promise<DefaultCatalogSeedSummary> {
	const results: DefaultCatalogSeedResult[] = [];
	const summary: DefaultCatalogSeedSummary = {
		...emptyCounts(),
		results,
	};

	for (const bundle of defaultCatalogBundleRegistry.list()) {
		const result = await seedDefaultCatalogBundle(bundle);
		results.push(result);
		summary.inserted += result.inserted;
		summary.updated += result.updated;
		summary.disabled += result.disabled;
		summary.unchanged += result.unchanged;
	}

	return summary;
}
