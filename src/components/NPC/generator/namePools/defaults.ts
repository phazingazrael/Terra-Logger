import type { DefaultCatalogBundle } from "../../../../generators/defaults";
import demonkinFeminine from "../names/demonkin.f.json";
import demonkinFamily from "../names/demonkin.last.json";
import demonkinMasculine from "../names/demonkin.m.json";
import demonkinNicknames from "../names/demonkin.nick.json";
import dragonkinFeminine from "../names/dragonkin.f.json";
import dragonkinFamily from "../names/dragonkin.last.json";
import dragonkinMasculine from "../names/dragonkin.m.json";
import dragonkinNicknames from "../names/dragonkin.nick.json";
import dwarfFeminine from "../names/dwarf.f.json";
import dwarfFamily from "../names/dwarf.last.json";
import dwarfMasculine from "../names/dwarf.m.json";
import elfFeminine from "../names/elf.f.json";
import elfFamily from "../names/elf.last.json";
import elfMasculine from "../names/elf.m.json";
import giantFeminine from "../names/giant.f.json";
import giantFamily from "../names/giant.last.json";
import giantMasculine from "../names/giant.m.json";
import giantNicknames from "../names/giant.nick.json";
import gnomeFeminine from "../names/gnome.f.json";
import gnomeFamily from "../names/gnome.last.json";
import gnomeMasculine from "../names/gnome.m.json";
import goblinNames from "../names/goblin.json";
import halfElfFeminine from "../names/halfelf.f.json";
import halfElfFamily from "../names/halfelf.last.json";
import halfElfMasculine from "../names/halfelf.m.json";
import halflingNicknameFirst from "../names/halfling.1.json";
import halflingNicknameSecond from "../names/halfling.2.json";
import halflingFeminine from "../names/halfling.f.json";
import halflingFamily from "../names/halfling.last.json";
import halflingMasculine from "../names/halfling.m.json";
import humanFeminine from "../names/human.f.json";
import humanFamily from "../names/human.last.json";
import humanMasculine from "../names/human.m.json";
import lizardfolkFeminine from "../names/lizard.f.json";
import lizardfolkFamily from "../names/lizard.last.json";
import lizardfolkMasculine from "../names/lizard.m.json";
import orcNames from "../names/orc.json";
import orcFamily from "../names/orc.last.json";
import type { NamePoolDefinition } from "../../types";

type PoolInput = {
	slug: string;
	name: string;
	description: string;
	ancestryIds: string[];
	masculine?: string[];
	feminine?: string[];
	neutral?: string[];
	family?: string[];
	nicknames?: string[];
};

function pool(input: PoolInput): NamePoolDefinition {
	return {
		id: `default:name-pool.${input.slug}`,
		source: "default",
		version: 1,
		enabled: true,
		name: input.name,
		description: input.description,
		ancestryIds: input.ancestryIds,
		masculineGivenNames: input.masculine ?? [],
		feminineGivenNames: input.feminine ?? [],
		neutralGivenNames: input.neutral ?? [],
		familyNames: input.family ?? [],
		nicknames: input.nicknames ?? [],
	};
}

export const namePoolDefaults = [
	pool({
		slug: "human",
		name: "Human Names",
		description:
			"The bundled Human given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.human"],
		masculine: humanMasculine,
		feminine: humanFeminine,
		family: humanFamily,
	}),
	pool({
		slug: "dragonkin",
		name: "Dragonkin Names",
		description:
			"The bundled Dragonkin clan, adult-name, and childhood-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.dragonkin"],
		masculine: dragonkinMasculine,
		feminine: dragonkinFeminine,
		family: dragonkinFamily,
		nicknames: dragonkinNicknames,
	}),
	pool({
		slug: "dwarf",
		name: "Dwarf Names",
		description:
			"The bundled Dwarf given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.dwarf"],
		masculine: dwarfMasculine,
		feminine: dwarfFeminine,
		family: dwarfFamily,
	}),
	pool({
		slug: "elf",
		name: "Elf Names",
		description:
			"The bundled Elf given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.elf"],
		masculine: elfMasculine,
		feminine: elfFeminine,
		family: elfFamily,
	}),
	pool({
		slug: "gnome",
		name: "Gnome Names",
		description:
			"The bundled Gnome given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.gnome"],
		masculine: gnomeMasculine,
		feminine: gnomeFeminine,
		family: gnomeFamily,
	}),
	pool({
		slug: "goblin",
		name: "Goblin Names",
		description:
			"The bundled unisex Goblin name list retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.goblin"],
		neutral: goblinNames,
	}),
	pool({
		slug: "giant",
		name: "Giant Names",
		description:
			"The bundled Giant given-name, family-name, and nickname lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.giant"],
		masculine: giantMasculine,
		feminine: giantFeminine,
		family: giantFamily,
		nicknames: giantNicknames,
	}),
	pool({
		slug: "halfling",
		name: "Halfling Names",
		description:
			"The bundled Halfling given-name, family-name, and two-part nickname lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.halfling"],
		masculine: halflingMasculine,
		feminine: halflingFeminine,
		family: halflingFamily,
		nicknames: [...halflingNicknameFirst, ...halflingNicknameSecond],
	}),
	pool({
		slug: "half-elf",
		name: "Half-Elf Names",
		description:
			"The bundled Half-Elf given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.half-elf"],
		masculine: halfElfMasculine,
		feminine: halfElfFeminine,
		family: halfElfFamily,
	}),
	pool({
		slug: "lizardfolk",
		name: "Lizardfolk Names",
		description:
			"The bundled Lizardfolk given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.lizardfolk"],
		masculine: lizardfolkMasculine,
		feminine: lizardfolkFeminine,
		family: lizardfolkFamily,
	}),
	pool({
		slug: "orc",
		name: "Orc Names",
		description:
			"The bundled unisex Orc given-name and family-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.orc", "default:ancestry.half-orc"],
		neutral: orcNames,
		family: orcFamily,
	}),
	pool({
		slug: "demonkin",
		name: "Demonkin Names",
		description:
			"The bundled Demonkin given-name, family-name, and virtue-name lists retained from the original NPC generator.",
		ancestryIds: ["default:ancestry.demonkin"],
		masculine: demonkinMasculine,
		feminine: demonkinFeminine,
		family: demonkinFamily,
		nicknames: demonkinNicknames,
	}),
] as const satisfies readonly NamePoolDefinition[];

export const npcNamePoolDefaultBundle = {
	generatorType: "npc",
	sectionId: "npc.name-pools",
	version: 1,
	records: namePoolDefaults,
} as const satisfies DefaultCatalogBundle;
