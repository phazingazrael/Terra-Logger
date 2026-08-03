//  **********************************************
//  *        A HEAVILY modified version of       *
//  *        Shuggaloaf's NPC Generator          *
//  **********************************************
//  *    A systems agnostic RPG NPC Generator.   *
//  *           Created by Shuggaloaf            *
//  *  Reddit: u/shuggaloaf; Discord: Earl#7716  *
//  **********************************************
//  *    This has been modified to work with     *
//  *    the Terra-Logger project.               *
//  **********************************************

import type { GeneratorRecord } from "../../../../db/generators";
import type { GeneratedNPC } from "../../types";
import { generateNPCAppearance } from "./appearance";
import { resolveNPCGenerationSelection } from "./catalogSelection";
import { generateNPCName } from "./names";
import { generateProfession } from "./professions";
import { generateNPCProfile } from "./profile";
import type {
	GeneratedNPCDraft,
	NPCCatalogSnapshot,
	NPCGenerationOptions,
} from "../../types";

function snapshot(
	record: GeneratorRecord & { name: string },
): NPCCatalogSnapshot {
	return {
		id: record.id,
		name: record.name,
		source: record.source,
		version: record.version,
	};
}

export async function generateNPCDraft(
	options: NPCGenerationOptions = {},
): Promise<GeneratedNPCDraft> {
	const random = options.random ?? Math.random;
	const selection = await resolveNPCGenerationSelection(
		options.constraints,
		random,
	);
	const name = generateNPCName(selection, random);
	const appearance = generateNPCAppearance(
		selection.ancestry.id,
		selection.ancestry.name,
		selection.gender.name,
		random,
	);
	const profession = await generateProfession(selection.profession, random);
	const profile = generateNPCProfile(
		selection,
		{
			fullName: name.fullName,
			nickName: name.nickName,
			demeanor: appearance.demeanor,
			activities: appearance.activities,
		},
		profession.title,
		random,
	);

	return {
		...name,
		...profile,
		...appearance,
		race: selection.ancestry.name,
		gender: selection.gender.name,
		pronouns: [...(selection.gender.defaultPronouns ?? [])],
		profession: {
			title: profession.title,
			description: profession.description,
		},
		catalog: {
			ancestry: snapshot(selection.ancestry),
			gender: snapshot(selection.gender),
			profession: snapshot(profession.definition),
			government: selection.government
				? snapshot(selection.government)
				: undefined,
			governmentRole: selection.governmentRole
				? {
					id: selection.governmentRole.id,
					name: selection.governmentRole.title,
				}
				: undefined,
		},
	};
}
