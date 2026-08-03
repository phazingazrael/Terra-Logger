import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type { NamePoolDefinition, NamePoolDefinitionQuery } from "../../types";

const arrayFields = [
	"ancestryIds",
	"masculineGivenNames",
	"feminineGivenNames",
	"neutralGivenNames",
	"familyNames",
	"nicknames",
] as const;

export function isNamePoolDefinition(
	record: GeneratorRecord,
): record is NamePoolDefinition {
	return (
		typeof record.name === "string" &&
		typeof record.description === "string" &&
		arrayFields.every(
			(field) =>
				Array.isArray(record[field]) &&
				record[field].every((value) => typeof value === "string"),
		)
	);
}

export async function listNamePoolDefinitions(
	query: NamePoolDefinitionQuery = {},
): Promise<NamePoolDefinition[]> {
	const database = await initGeneratorsDatabase();
	const records = query.source
		? await database.getAllFromIndex("namePools", "sourceIndex", query.source)
		: await database.getAll("namePools");
	return records
		.filter(isNamePoolDefinition)
		.filter((pool) => query.includeDisabled || pool.enabled)
		.filter(
			(pool) =>
				!query.ancestryId || pool.ancestryIds.includes(query.ancestryId),
		)
		.sort(
			(left, right) =>
				left.name.localeCompare(right.name) || left.id.localeCompare(right.id),
		);
}
