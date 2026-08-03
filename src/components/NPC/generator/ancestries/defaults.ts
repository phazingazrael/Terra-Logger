import type { DefaultCatalogBundle } from "../../../../generators/defaults";
import type { AncestryDefinition, AncestryRarity } from "../../types";

const commonAppearanceTables = [
	"npc.appearance.activities",
	"npc.appearance.builds",
	"npc.appearance.complexions",
	"npc.appearance.demeanors",
	"npc.appearance.descriptors",
	"npc.appearance.eye-colors",
	"npc.appearance.eye-shapes",
	"npc.appearance.facial-hair",
	"npc.appearance.hair-colors",
	"npc.appearance.hair-styles",
	"npc.appearance.heights",
	"npc.appearance.skin-tones",
];

type AncestryInput = {
	slug: string;
	name: string;
	description: string;
	rarity: AncestryRarity;
	weight: number;
	namePoolSlug: string;
	fantasyGenderIds?: string[];
};

function ancestry(input: AncestryInput): AncestryDefinition {
	return {
		id: `default:ancestry.${input.slug}`,
		source: "default",
		version: 1,
		enabled: true,
		name: input.name,
		description: input.description,
		rarity: input.rarity,
		weight: input.weight,
		namePoolIds: [`default:name-pool.${input.namePoolSlug}`],
		appearanceTableIds: [
			...commonAppearanceTables,
			"npc.appearance.ancestry-specific",
		],
		fantasyGenderIds: input.fantasyGenderIds,
	};
}

export const ancestryDefaults = [
	ancestry({
		slug: "human",
		name: "Human",
		description:
			"Humans are adaptable, varied people found across a broad range of communities, environments, appearances, and traditions.",
		rarity: "common",
		weight: 4,
		namePoolSlug: "human",
	}),
	ancestry({
		slug: "dragonkin",
		name: "Dragonkin",
		description:
			"Dragonkin are draconic humanoids whose scaled features, colors, builds, and cultural identities vary widely among individuals and communities.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "dragonkin",
		fantasyGenderIds: [
			"default:gender.dragonkin.ember",
			"default:gender.dragonkin.prism",
			"default:gender.dragonkin.eclipse",
		],
	}),
	ancestry({
		slug: "dwarf",
		name: "Dwarf",
		description:
			"Dwarves are sturdy humanoids with diverse appearances and traditions, often shaped by enduring communities and skilled crafts.",
		rarity: "common",
		weight: 4,
		namePoolSlug: "dwarf",
	}),
	ancestry({
		slug: "elf",
		name: "Elf",
		description:
			"Elves are long-lived humanoids with varied features, communities, and relationships to art, history, magic, and the natural world.",
		rarity: "common",
		weight: 4,
		namePoolSlug: "elf",
	}),
	ancestry({
		slug: "gnome",
		name: "Gnome",
		description:
			"Gnomes are small humanoids whose individuals and cultures display a wide range of appearances, interests, and ways of life.",
		rarity: "common",
		weight: 4,
		namePoolSlug: "gnome",
	}),
	ancestry({
		slug: "goblin",
		name: "Goblin",
		description:
			"Goblins are small humanoids with diverse communities, personalities, features, and traditions rather than a single shared disposition.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "goblin",
	}),
	ancestry({
		slug: "giant",
		name: "Giant",
		description:
			"Giants are powerfully built humanoids of exceptional stature whose appearances and cultures vary across families and regions.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "giant",
	}),
	ancestry({
		slug: "halfling",
		name: "Halfling",
		description:
			"Halflings are small humanoids with varied appearances and communities, connected by ancestry rather than any required temperament or lifestyle.",
		rarity: "common",
		weight: 4,
		namePoolSlug: "halfling",
	}),
	ancestry({
		slug: "half-elf",
		name: "Half-Elf",
		description:
			"Half-Elves have both Human and Elven ancestry, with identities, features, families, and cultural connections unique to each individual.",
		rarity: "common",
		weight: 4,
		namePoolSlug: "half-elf",
	}),
	ancestry({
		slug: "lizardfolk",
		name: "Lizardfolk",
		description:
			"Lizardfolk are reptilian humanoids whose scales, builds, adaptations, communities, and personal identities vary widely.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "lizardfolk",
		fantasyGenderIds: ["default:gender.lizardfolk.cyclescaled"],
	}),
	ancestry({
		slug: "orc",
		name: "Orc",
		description:
			"Orcs are strong humanoids with diverse appearances, societies, professions, and beliefs rather than an inherent disposition.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "orc",
	}),
	ancestry({
		slug: "half-orc",
		name: "Half-Orc",
		description:
			"Half-Orcs have both Orc and Human ancestry, with personal identities and physical features shaped by individual heritage and community.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "orc",
	}),
	ancestry({
		slug: "demonkin",
		name: "Demonkin",
		description:
			"Demonkin are humanoids with fiendish traits whose horns, tails, coloration, features, identities, and communities differ greatly.",
		rarity: "uncommon",
		weight: 1,
		namePoolSlug: "demonkin",
		fantasyGenderIds: [
			"default:gender.demonkin.virtueborn",
			"default:gender.demonkin.fluxborn",
		],
	}),
] as const satisfies readonly AncestryDefinition[];

export const npcAncestryDefaultBundle = {
	generatorType: "npc",
	sectionId: "npc.ancestries",
	version: 1,
	records: ancestryDefaults,
} as const satisfies DefaultCatalogBundle;
