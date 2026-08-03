import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type { NPCProfessionDefinition, NPCProfessionQuery } from "../../types";

export function isNPCProfessionDefinition(
	record: GeneratorRecord,
): record is NPCProfessionDefinition {
	return (
		(record.category === "general" || record.category === "government") &&
		record.catalog === record.category &&
		typeof record.name === "string" &&
		typeof record.description === "string"
	);
}

function matchesQuery(
	profession: NPCProfessionDefinition,
	query: NPCProfessionQuery,
): boolean {
	if (!query.includeDisabled && !profession.enabled) return false;
	if (query.source && profession.source !== query.source) return false;
	if (query.category && profession.category !== query.category) return false;
	if (
		query.governmentCategory &&
		profession.governmentCategory !== query.governmentCategory
	) {
		return false;
	}
	if (
		query.governmentDefinitionId &&
		profession.governmentDefinitionId !== query.governmentDefinitionId
	) {
		return false;
	}
	return true;
}

function compareProfessions(
	left: NPCProfessionDefinition,
	right: NPCProfessionDefinition,
): number {
	return (
		left.category.localeCompare(right.category) ||
		(left.governmentCategory ?? "").localeCompare(
			right.governmentCategory ?? "",
		) ||
		(left.governmentDefinitionId ?? "").localeCompare(
			right.governmentDefinitionId ?? "",
		) ||
		left.name.localeCompare(right.name) ||
		left.id.localeCompare(right.id)
	);
}

export async function listNPCProfessions(
	query: NPCProfessionQuery = {},
): Promise<NPCProfessionDefinition[]> {
	const database = await initGeneratorsDatabase();
	const records = query.source
		? await database.getAllFromIndex("professions", "sourceIndex", query.source)
		: await database.getAll("professions");

	return records
		.filter(isNPCProfessionDefinition)
		.filter((profession) => matchesQuery(profession, query))
		.sort(compareProfessions);
}
