import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type { AncestryDefinition, AncestryDefinitionQuery } from "../../types";

export function isAncestryDefinition(
	record: GeneratorRecord,
): record is AncestryDefinition {
	return (
		typeof record.name === "string" &&
		typeof record.description === "string" &&
		["common", "uncommon", "rare"].includes(String(record.rarity)) &&
		typeof record.weight === "number" &&
		Array.isArray(record.namePoolIds) &&
		record.namePoolIds.every((value) => typeof value === "string") &&
		Array.isArray(record.appearanceTableIds) &&
		record.appearanceTableIds.every((value) => typeof value === "string")
	);
}

export async function listAncestryDefinitions(
	query: AncestryDefinitionQuery = {},
): Promise<AncestryDefinition[]> {
	const database = await initGeneratorsDatabase();
	const records = query.source
		? await database.getAllFromIndex("ancestries", "sourceIndex", query.source)
		: await database.getAll("ancestries");
	return records
		.filter(isAncestryDefinition)
		.filter((ancestry) => query.includeDisabled || ancestry.enabled)
		.filter((ancestry) => !query.rarity || ancestry.rarity === query.rarity)
		.sort(
			(left, right) =>
				left.name.localeCompare(right.name) || left.id.localeCompare(right.id),
		);
}

