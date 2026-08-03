import {
	getGovernmentDefinition,
	resolveGovernmentRoleCount,
} from "../governments";
import type {
	GovernmentGenerationContext,
	GovernmentRoleAssignment,
} from "../../types";

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
