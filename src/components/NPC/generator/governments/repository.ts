import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type { GovernmentDefinition, GovernmentDefinitionQuery } from "../../types";

export function isGovernmentDefinition(
	record: GeneratorRecord,
): record is GovernmentDefinition {
	return (
		typeof record.category === "string" &&
		typeof record.name === "string" &&
		typeof record.descriptionHtml === "string" &&
		typeof record.presentation === "object" &&
		record.presentation !== null &&
		typeof record.leadership === "object" &&
		record.leadership !== null
	);
}

export async function listGovernmentDefinitions(
	query: GovernmentDefinitionQuery = {},
): Promise<GovernmentDefinition[]> {
	const database = await initGeneratorsDatabase();
	const records = query.source
		? await database.getAllFromIndex(
			"governmentDefinitions",
			"sourceIndex",
			query.source,
		)
		: await database.getAll("governmentDefinitions");

	return records
		.filter(isGovernmentDefinition)
		.filter((definition) => query.includeDisabled || definition.enabled)
		.filter(
			(definition) => !query.category || definition.category === query.category,
		)
		.sort(
			(left, right) =>
				left.category.localeCompare(right.category) ||
				left.name.localeCompare(right.name) ||
				left.id.localeCompare(right.id),
		);
}
