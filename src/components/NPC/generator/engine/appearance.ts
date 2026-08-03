import {
	listActiveAncestryAppearanceRecords,
	listActiveAppearanceTableRecords,
} from "../appearance";
import type { GeneratedNPC } from "../../types";
import {
	pickRandom,
	pickWeighted,
	type RandomSource,
	randomInteger,
} from "./random";

export type GeneratedNPCAppearance = Pick<
	GeneratedNPC,
	"build" | "skin" | "eye" | "hair" | "descriptors" | "demeanor" | "activities"
>;

function tableValue(table: string, random: RandomSource): string {
	return (
		pickWeighted(
			listActiveAppearanceTableRecords(table),
			(record) => record.weight,
			random,
		)?.value ?? ""
	);
}

function ancestryValue(
	ancestryId: string,
	random: RandomSource,
): string | undefined {
	const values = listActiveAncestryAppearanceRecords(ancestryId).flatMap(
		(record) => record.values,
	);
	return pickRandom(values, random);
}

function genderUsesMasculineAppearance(genderName: string): boolean {
	const normalized = genderName.toLocaleLowerCase();
	return (
		normalized === "male" ||
		normalized.includes("male / ftm") ||
		normalized.includes("transgender male")
	);
}

export function generateNPCAppearance(
	ancestryId: string,
	ancestryName: string,
	genderName: string,
	random: RandomSource,
): GeneratedNPCAppearance {
	const ancestry = ancestryName.toLocaleLowerCase();
	const heightRoll = randomInteger(1, 100, random);
	let height =
		heightRoll < 20 || heightRoll > 80
			? tableValue("npc.appearance.heights", random)
			: "Average Height";
	let build = tableValue("npc.appearance.builds", random);
	let tone = tableValue("npc.appearance.skin-tones", random);
	let complexion = tableValue("npc.appearance.complexions", random);
	let hairStyle = tableValue("npc.appearance.hair-styles", random);
	let hairColor = tableValue("npc.appearance.hair-colors", random);
	let facialHair = "None";
	let descriptor = tableValue("npc.appearance.descriptors", random);

	if (
		genderUsesMasculineAppearance(genderName) ||
		(ancestry === "dwarf" && genderName === "Female")
	) {
		facialHair = tableValue("npc.appearance.facial-hair", random);
	}

	if (["dragonkin", "goblin", "lizardfolk", "elf"].includes(ancestry)) {
		facialHair = "None";
		descriptor = descriptor
			.replace("Very hairy", "Exceptionally Average")
			.replace("One hell of a mustache", "Exceptionally Average");
	}
	if (ancestry === "dwarf") {
		facialHair = facialHair.replace("Clean-Shaven", "Long, Braided Beard");
	}

	if (["goblin", "half-orc", "orc"].includes(ancestry)) {
		tone = ancestryValue(ancestryId, random) ?? tone;
	} else if (ancestry === "dragonkin") {
		tone = ancestryValue(ancestryId, random) ?? tone;
		complexion = "Scaled";
	} else if (ancestry === "lizardfolk") {
		tone = ancestryValue(ancestryId, random) ?? tone;
		complexion = "Scaled";
	} else if (ancestry === "demonkin" && randomInteger(0, 99, random) > 4) {
		tone = ancestryValue(ancestryId, random) ?? tone;
	}

	if (hairStyle === "Bald" || hairStyle === "Shaved") {
		hairColor = `Eyebrow ${hairColor}`;
	}
	if (ancestry === "dragonkin" || ancestry === "lizardfolk") {
		hairStyle = "None";
		hairColor = "None";
	}

	if (!height) height = "Average Height";
	if (!build) build = "Average build";

	return {
		build: `${height} and ${build}`,
		skin: { tone, comp: complexion },
		eye: {
			shape: tableValue("npc.appearance.eye-shapes", random),
			color: tableValue("npc.appearance.eye-colors", random),
		},
		hair: {
			style: hairStyle,
			color: hairColor,
			facial: facialHair,
		},
		descriptors: descriptor,
		demeanor: tableValue("npc.appearance.demeanors", random),
		activities: tableValue("npc.appearance.activities", random),
	};
}
