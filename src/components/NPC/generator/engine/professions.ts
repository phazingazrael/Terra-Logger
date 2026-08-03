import {
	listActiveNPCProfessions,
	type NPCProfessionDefinition,
} from "../professions";
import { pickRandom, type RandomSource } from "./random";

export type GeneratedProfession = {
	definition: NPCProfessionDefinition;
	title: string;
	description: string;
};

export async function generateProfession(
	selected: NPCProfessionDefinition,
	random: RandomSource,
): Promise<GeneratedProfession> {
	if (!selected.requiresBaseProfession) {
		return {
			definition: selected,
			title: selected.name,
			description: selected.description,
		};
	}

	const baseOptions = listActiveNPCProfessions({ category: "general" }).filter(
		(profession) =>
			profession.id !== selected.id && !profession.requiresBaseProfession,
	);
	const base = pickRandom(baseOptions, random);
	if (!base) {
		return {
			definition: selected,
			title: selected.name,
			description: selected.description,
		};
	}
	return {
		definition: selected,
		title: `${base.name} (${selected.name})`,
		description: [selected.description, base.description]
			.filter(Boolean)
			.join(" "),
	};
}
