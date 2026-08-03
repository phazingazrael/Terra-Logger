import {
	type AncestryDefinition,
	getActiveAncestryDefinition,
	listActiveAncestryDefinitions,
} from "../ancestries";
import {
	type GenderDefinition,
	getActiveGenderDefinition,
	listActiveGenderDefinitions,
} from "../genders";
import {
	type GovernmentDefinition,
	type GovernmentRoleDefinition,
	getActiveGovernmentDefinitionById,
	getGovernmentDefinition,
	getGovernmentLeadershipStructure,
} from "../governments";
import {
	getActiveNPCProfession,
	listActiveNPCProfessions,
	type NPCProfessionDefinition,
} from "../professions";
import { pickWeighted, type RandomSource } from "./random";
import type { NPCGenerationConstraints, NPCGenerationSelection } from "../../types";

function normalized(value: string): string {
	return value.trim().toLocaleLowerCase();
}

function byName<T extends { name: string }>(
	values: readonly T[],
	name: string | undefined,
): T | undefined {
	if (!name?.trim()) return undefined;
	const target = normalized(name);
	return values.find((value) => normalized(value.name) === target);
}

function resolveAncestry(
	constraints: NPCGenerationConstraints,
	random: RandomSource,
): AncestryDefinition {
	const ancestries = listActiveAncestryDefinitions();
	const constrainedById = getActiveAncestryDefinition(constraints.ancestryId);
	if (constraints.ancestryId && !constrainedById) {
		throw new Error(`Race "${constraints.ancestryId}" is not available.`);
	}
	const constrainedByName = byName(ancestries, constraints.ancestryName);
	if (constraints.ancestryName && !constrainedByName) {
		throw new Error(`Race "${constraints.ancestryName}" is not available.`);
	}
	const constrained = constrainedById ?? constrainedByName;
	const ancestry =
		constrained ?? pickWeighted(ancestries, (entry) => entry.weight, random);
	if (!ancestry) throw new Error("No enabled NPC races are available.");
	return ancestry;
}

function allowedGenders(ancestry: AncestryDefinition): GenderDefinition[] {
	const realWorld = listActiveGenderDefinitions({ catalog: "real-world" });
	const fantasy = listActiveGenderDefinitions({
		catalog: "fantasy",
		ancestryId: ancestry.id,
	}).filter((gender) => ancestry.fantasyGenderIds?.includes(gender.id));
	const available = [...realWorld, ...fantasy];
	if (!ancestry.allowedGenderIds?.length) return available;
	const allowed = new Set(ancestry.allowedGenderIds);
	return available.filter((gender) => allowed.has(gender.id));
}

function resolveGender(
	ancestry: AncestryDefinition,
	constraints: NPCGenerationConstraints,
	random: RandomSource,
): GenderDefinition {
	const genders = allowedGenders(ancestry);
	const requestedById = getActiveGenderDefinition(constraints.genderId);
	if (constraints.genderId && !requestedById) {
		throw new Error(`Gender "${constraints.genderId}" is not available.`);
	}
	const requestedByName = byName(genders, constraints.genderName);
	if (constraints.genderName && !requestedByName) {
		throw new Error(
			`Gender "${constraints.genderName}" is not available for race "${ancestry.name}".`,
		);
	}
	const requested = requestedById ?? requestedByName;
	if (requested && !genders.some((gender) => gender.id === requested.id)) {
		throw new Error(
			`Gender "${requested.name}" is not available for race "${ancestry.name}".`,
		);
	}
	const gender =
		requested ??
		pickWeighted(genders, (entry) => entry.generationWeight, random);
	if (!gender)
		throw new Error(
			`No enabled NPC genders are available for race "${ancestry.name}".`,
		);
	return gender;
}

function resolveGovernment(
	constraints: NPCGenerationConstraints,
): GovernmentDefinition | undefined {
	if (!constraints.governmentDefinitionId && !constraints.governmentType)
		return undefined;
	const government =
		getGovernmentDefinition(constraints.governmentType) ??
		getActiveGovernmentDefinitionById(constraints.governmentDefinitionId);
	if (!government) {
		throw new Error(
			`Government "${constraints.governmentType ?? constraints.governmentDefinitionId}" is not available.`,
		);
	}
	return government;
}

function resolveGovernmentRole(
	government: GovernmentDefinition | undefined,
	constraints: NPCGenerationConstraints,
): GovernmentRoleDefinition | undefined {
	if (!constraints.governmentRoleId) return undefined;
	if (!government)
		throw new Error(
			"A government definition is required when constraining a government role.",
		);
	const role = getGovernmentLeadershipStructure(government.name).find(
		(entry) => entry.id === constraints.governmentRoleId,
	);
	if (!role) {
		throw new Error(
			`Government role "${constraints.governmentRoleId}" is not part of "${government.name}".`,
		);
	}
	return role;
}

async function resolveProfession(
	constraints: NPCGenerationConstraints,
	governmentRole: GovernmentRoleDefinition | undefined,
	random: RandomSource,
): Promise<NPCProfessionDefinition> {
	if (governmentRole?.professionId) {
		const profession = getActiveNPCProfession(governmentRole.professionId);
		if (profession?.enabled) return profession;
		throw new Error(
			`Government role "${governmentRole.title}" references an unavailable profession.`,
		);
	}

	if (constraints.professionId) {
		const profession = getActiveNPCProfession(constraints.professionId);
		if (!profession?.enabled)
			throw new Error(
				`Profession "${constraints.professionId}" is not available.`,
			);
		return profession;
	}

	const professions = listActiveNPCProfessions();
	const named = byName(professions, constraints.professionName);
	if (named) return named;
	if (constraints.professionName) {
		throw new Error(
			`Profession "${constraints.professionName}" is not available.`,
		);
	}

	if (governmentRole) {
		return {
			id: `default:profession.role-fallback.${governmentRole.id.replace(
				/^(default|user):/,
				"",
			)}`,
			source: "default",
			version: 1,
			enabled: true,
			catalog: "government",
			category: "government",
			name: governmentRole.title,
			description: governmentRole.description,
			governmentRoleId: governmentRole.id,
		};
	}

	const general = professions.filter(
		(profession) => profession.category === "general",
	);
	const profession = pickWeighted(general, () => 1, random);
	if (!profession) throw new Error("No enabled NPC professions are available.");
	return profession;
}

export async function resolveNPCGenerationSelection(
	constraints: NPCGenerationConstraints = {},
	random: RandomSource = Math.random,
): Promise<NPCGenerationSelection> {
	const ancestry = resolveAncestry(constraints, random);
	const gender = resolveGender(ancestry, constraints, random);
	const government = resolveGovernment(constraints);
	const governmentRole = resolveGovernmentRole(government, constraints);
	const profession = await resolveProfession(
		constraints,
		governmentRole,
		random,
	);
	return { ancestry, gender, profession, government, governmentRole };
}
