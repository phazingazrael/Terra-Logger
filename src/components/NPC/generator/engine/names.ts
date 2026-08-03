import {
	getActiveNamePoolDefinition,
	type NamePoolDefinition,
} from "../namePools";
import { pickRandom, type RandomSource } from "./random";
import type { NPCGenerationSelection } from "../../types";

export type GeneratedNPCName = {
	fullName: string;
	nickName: string;
	clan: string;
};

function unique(values: readonly string[]): string[] {
	return [...new Set(values.filter((value) => value.trim()))];
}

function availablePools(
	selection: NPCGenerationSelection,
): NamePoolDefinition[] {
	const ids =
		selection.gender.namePoolStrategy === "custom"
			? selection.gender.customNamePoolIds
			: selection.ancestry.namePoolIds;
	const pools = (ids ?? []).flatMap((id) => {
		const pool = getActiveNamePoolDefinition(id);
		return pool ? [pool] : [];
	});
	if (!pools.length) {
		throw new Error(
			`No enabled name pools are available for ancestry "${selection.ancestry.name}".`,
		);
	}
	return pools;
}

function givenNames(
	pools: readonly NamePoolDefinition[],
	strategy: NPCGenerationSelection["gender"]["namePoolStrategy"],
): string[] {
	const masculine = pools.flatMap((pool) => pool.masculineGivenNames);
	const feminine = pools.flatMap((pool) => pool.feminineGivenNames);
	const neutral = pools.flatMap((pool) => pool.neutralGivenNames);
	switch (strategy) {
		case "masculine":
			return unique([...masculine, ...neutral]);
		case "feminine":
			return unique([...feminine, ...neutral]);
		case "neutral":
			return unique(neutral.length ? neutral : [...masculine, ...feminine]);
		case "mixed":
		case "custom":
			return unique([...masculine, ...feminine, ...neutral]);
	}
}

export function generateNPCName(
	selection: NPCGenerationSelection,
	random: RandomSource,
): GeneratedNPCName {
	const pools = availablePools(selection);
	const availableGivenNames = givenNames(
		pools,
		selection.gender.namePoolStrategy,
	);
	const families = unique(pools.flatMap((pool) => pool.familyNames));
	const nicknames = unique(pools.flatMap((pool) => pool.nicknames));
	const fallbackNames = unique([
		...availableGivenNames,
		...families,
		...nicknames,
	]);
	const given = pickRandom(availableGivenNames, random) ?? "Unnamed";
	const family =
		pickRandom(families, random) ??
		pickRandom(
			fallbackNames.filter((name) => name !== given),
			random,
		) ??
		"";
	const ancestryName = selection.ancestry.name.toLocaleLowerCase();

	if (ancestryName === "dragonkin") {
		const childName = pickRandom(nicknames, random);
		return {
			fullName: [family, given].filter(Boolean).join(" "),
			nickName: childName ? `Child Name: ${childName}` : "",
			clan: "*Dragonkin display their clan name first. The 'Child Name' is a nickname earned as a child.",
		};
	}
	if (ancestryName === "giant") {
		const nickname = pickRandom(nicknames, random);
		return {
			fullName: [given, family].filter(Boolean).join(" "),
			nickName: nickname ? nickname : "",
			clan: "*Giant display their Clan name last.",
		};
	}
	if (ancestryName === "halfling") {
		// The default Halfling nickname catalog is composed from two source lists:
		// first halves end in a hyphen and second halves complete the compound name.
		// Keep the pools separate here rather than selecting two arbitrary entries.
		const firstParts = nicknames.filter((nickname) => nickname.trim().endsWith("-"));
		const secondParts = nicknames.filter((nickname) => !nickname.trim().endsWith("-"));
		const first = pickRandom(firstParts, random)?.trim() ?? "";
		const second = pickRandom(secondParts, random)?.trim() ?? "";
		const nickname = first && second
			? `${first}${second}`
			: (first || second).replace(/-+$/, "");

		return {
			fullName: [given, family].filter(Boolean).join(" "),
			nickName: nickname,
			clan: "",
		};
	}
	if (ancestryName === "demonkin") {
		const virtueName = pickRandom(nicknames, random);
		return {
			fullName: [given, family].filter(Boolean).join(" "),
			nickName: virtueName ? `Virtue Name: ${virtueName}` : "",
			clan: "",
		};
	}

	return {
		fullName: [given, family].filter(Boolean).join(" "),
		nickName: "",
		clan: "",
	};
}
