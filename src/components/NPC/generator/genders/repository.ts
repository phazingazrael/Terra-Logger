import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type { GenderDefinition, GenderDefinitionQuery } from "../../types";

export function isGenderDefinition(
	record: GeneratorRecord,
): record is GenderDefinition {
	return (
		(record.catalog === "real-world" || record.catalog === "fantasy") &&
		typeof record.name === "string" &&
		typeof record.description === "string" &&
		["masculine", "feminine", "mixed", "neutral", "custom"].includes(
			String(record.namePoolStrategy),
		) &&
		typeof record.generationWeight === "number"
	);
}

export async function listGenderDefinitions(
	query: GenderDefinitionQuery = {},
): Promise<GenderDefinition[]> {
	const database = await initGeneratorsDatabase();
	const records = query.source
		? await database.getAllFromIndex("genders", "sourceIndex", query.source)
		: await database.getAll("genders");

	return records
		.filter(isGenderDefinition)
		.filter((gender) => query.includeDisabled || gender.enabled)
		.filter((gender) => !query.catalog || gender.catalog === query.catalog)
		.filter(
			(gender) =>
				!query.ancestryId ||
				!gender.applicableAncestryIds?.length ||
				gender.applicableAncestryIds.includes(query.ancestryId),
		)
		.sort(
			(left, right) =>
				left.catalog.localeCompare(right.catalog) ||
				left.name.localeCompare(right.name) ||
				left.id.localeCompare(right.id),
		);
}

export async function getGenderDefinition(
	id: string,
): Promise<GenderDefinition | undefined> {
	const database = await initGeneratorsDatabase();
	const record = await database.get("genders", id);
	return record && isGenderDefinition(record) ? record : undefined;
}
