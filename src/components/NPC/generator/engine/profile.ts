import {
	listActiveNPCAgeRanges,
	listActiveNPCProfileValues,
} from "../profile";
import { pickWeighted, randomInteger, type RandomSource } from "./random";
import type { NPCGenerationSelection } from "../../types";

export type GeneratedNPCProfile = {
	nickName: string;
	pronounced: string;
	heritage: string;
	age: number;
	sexuality: string;
	alignment: string;
	condition: string;
	background: string;
	aspirationsMotivations: string;
	publicPerception: string;
	hiddenDetails: string;
};

function capitalize(value: string): string {
	return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function professionPlural(value: string): string {
	if (/s$/i.test(value)) return value;
	if (/y$/i.test(value) && !/[aeiou]y$/i.test(value)) return `${value.slice(0, -1)}ies`;
	return `${value}s`;
}

function renderTemplate(
	template: string,
	context: Record<string, string>,
): string {
	return template.replace(/\{([a-zA-Z]+)\}/g, (_match, key: string) => context[key] ?? "");
}

function selectValue(
	field: Parameters<typeof listActiveNPCProfileValues>[0],
	selection: NPCGenerationSelection,
	random: RandomSource,
): string {
	return (
		pickWeighted(
			listActiveNPCProfileValues(field, selection.ancestry.id),
			(record) => record.weight,
			random,
		)?.value ?? ""
	);
}

function pronunciationFromName(fullName: string): string {
	return fullName
		.split(/\s+/)
		.filter(Boolean)
		.join(" · ");
}

export function generateNPCProfile(
	selection: NPCGenerationSelection,
	base: {
		fullName: string;
		nickName: string;
		demeanor: string;
		activities: string;
	},
	professionTitle: string,
	random: RandomSource,
): GeneratedNPCProfile {
	const heritage = selectValue("heritage", selection, random) || selection.ancestry.name;
	const ageRange = pickWeighted(
		listActiveNPCAgeRanges(selection.ancestry.id),
		(record) => record.weight,
		random,
	);
	const age = ageRange
		? randomInteger(ageRange.minimumAge, ageRange.maximumAge, random)
		: randomInteger(18, 80, random);
	const context = {
		name: base.fullName,
		race: selection.ancestry.name,
		heritage,
		profession: professionTitle,
		professionPlural: professionPlural(professionTitle),
		demeanor: capitalize(base.demeanor),
		demeanorLower: base.demeanor.toLocaleLowerCase(),
		activity: base.activities,
	};
	const generatedNickname =
		selectValue("nickname", selection, random) || "the Wanderer";
	const nickname =
		base.nickName || generatedNickname;
	const background =
		selectValue("background", selection, random) ||
		"{name} learned the work of a {profession} through experience and necessity.";
	const aspirations =
		selectValue("aspirationsMotivations", selection, random) ||
		"Wants to earn lasting respect through their work as a {profession}.";
	const perception =
		selectValue("publicPerception", selection, random) ||
		"Known as a capable {profession} with a {demeanorLower} manner.";
	const hiddenDetails =
		selectValue("hiddenDetails", selection, random) ||
		"Keeps an important personal obligation hidden from casual acquaintances.";

	return {
		nickName: nickname,
		pronounced: pronunciationFromName(base.fullName),
		heritage,
		age,
		sexuality:
			selectValue("sexuality", selection, random) || "Unspecified",
		alignment:
			selectValue("alignment", selection, random) || "True Neutral",
		condition: selectValue("condition", selection, random) || "Healthy",
		background: renderTemplate(background, context),
		aspirationsMotivations: renderTemplate(aspirations, context),
		publicPerception: renderTemplate(perception, context),
		hiddenDetails: renderTemplate(hiddenDetails, context),
	};
}
