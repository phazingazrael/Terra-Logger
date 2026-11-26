import {
	getGovernmentDefinition,
	listActiveGovernmentDefinitions,
	resolveGovernmentRoleCount,
} from "../governments";
import type {
	GovernmentGenerationContext,
	GovernmentRoleAssignment,
} from "../../types";

import type { TLCity } from "../../../../definitions/TerraLogger";

export function assignNeutralCityGovernments(
	cities: readonly TLCity[],
	random = Math.random,
): number {
	const pending = cities.filter((city) => city.country.id === 0 && !city.government?.formName.trim());
	if (!pending.length) return 0;
	const choices = listActiveGovernmentDefinitions().filter((definition) => definition.category === "Anarchy");
	if (!choices.length) throw new Error("No enabled Anarchy governments are available for neutral Cities.");
	for (const city of pending) {
		const definition = choices[Math.floor(random() * choices.length)];
		city.government = { formName: definition.name };
	}
	return pending.length;
}

export function buildGovernmentRoleAssignments(
	governmentType: string,
	context: GovernmentGenerationContext,
): GovernmentRoleAssignment[] {
	const government = getGovernmentDefinition(governmentType);
	if (!government)
		throw new Error(`Government "${governmentType}" is not available.`);

	return government.leadership.roles.map((role) => ({
		governmentDefinitionId: government.id,
		governmentRoleId: role.id,
		professionId: role.professionId,
		title: role.title,
		classification: role.classification,
		primary: role.primary ?? false,
		count: resolveGovernmentRoleCount(role.count, context),
	}));
}
