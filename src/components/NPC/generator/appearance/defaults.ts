import type { DefaultCatalogBundle } from "../../../../generators/defaults";
import Activities from "../details/activities.json";
import Build from "../details/build.json";
import Complexion from "../details/complexion.json";
import Demeanor from "../details/demeanor.json";
import Demonkin from "../details/demonkin.json";
import Descriptors1 from "../details/descriptor.1.json";
import Descriptors2 from "../details/descriptor.2.json";
import Descriptors3 from "../details/descriptor.3.json";
import Dragonkin from "../details/dragonkin.json";
import EyeColor1 from "../details/eye.color.1.json";
import EyeColor2 from "../details/eye.color.2.json";
import EyeColor3 from "../details/eye.color.3.json";
import EyeShape from "../details/eye.shape.json";
import HairColor from "../details/hair.color.json";
import FacialHair from "../details/hair.face.json";
import HairStyle from "../details/hair.style.json";
import Height from "../details/height.json";
import Lizardfolk from "../details/lizard.json";
import OrcGoblin from "../details/orcgob.json";
import SkinTone from "../details/skin.json";
import type { AncestryAppearanceRecord, AppearanceTableRecord } from "../../types";

function tableRecords(
	table: string,
	values: readonly string[],
	weight = 1,
	idSuffix = "",
): AppearanceTableRecord[] {
	return values.map((value, index) => ({
		id: `default:appearance.${table.replace("npc.appearance.", "")}.${idSuffix}${index + 1}`,
		source: "default",
		version: 1,
		enabled: true,
		table,
		value,
		weight,
	}));
}

const tables = {
	"npc.appearance.activities": tableRecords(
		"npc.appearance.activities",
		Activities,
	),
	"npc.appearance.builds": tableRecords("npc.appearance.builds", Build),
	"npc.appearance.complexions": tableRecords(
		"npc.appearance.complexions",
		Complexion,
	),
	"npc.appearance.demeanors": tableRecords(
		"npc.appearance.demeanors",
		Demeanor,
	),
	"npc.appearance.descriptors": [
		...tableRecords("npc.appearance.descriptors", Descriptors1, 65, "common."),
		...tableRecords(
			"npc.appearance.descriptors",
			Descriptors2,
			25,
			"uncommon.",
		),
		...tableRecords("npc.appearance.descriptors", Descriptors3, 10, "rare."),
	],
	"npc.appearance.eye-colors": [
		...tableRecords("npc.appearance.eye-colors", EyeColor1, 65, "common."),
		...tableRecords("npc.appearance.eye-colors", EyeColor2, 25, "uncommon."),
		...tableRecords("npc.appearance.eye-colors", EyeColor3, 10, "rare."),
	],
	"npc.appearance.eye-shapes": tableRecords(
		"npc.appearance.eye-shapes",
		EyeShape,
	),
	"npc.appearance.facial-hair": tableRecords(
		"npc.appearance.facial-hair",
		FacialHair,
	),
	"npc.appearance.hair-colors": tableRecords(
		"npc.appearance.hair-colors",
		HairColor,
	),
	"npc.appearance.hair-styles": tableRecords(
		"npc.appearance.hair-styles",
		HairStyle,
	),
	"npc.appearance.heights": tableRecords("npc.appearance.heights", Height),
	"npc.appearance.skin-tones": tableRecords(
		"npc.appearance.skin-tones",
		SkinTone,
	),
} as const;

const ancestrySpecificRecords = [
	{
		id: "default:appearance.ancestry-specific.dragonkin",
		source: "default",
		version: 1,
		enabled: true,
		table: "npc.appearance.ancestry-specific",
		ancestryIds: ["default:ancestry.dragonkin"],
		values: Dragonkin,
	},
	{
		id: "default:appearance.ancestry-specific.demonkin",
		source: "default",
		version: 1,
		enabled: true,
		table: "npc.appearance.ancestry-specific",
		ancestryIds: ["default:ancestry.demonkin"],
		values: Demonkin,
	},
	{
		id: "default:appearance.ancestry-specific.lizardfolk",
		source: "default",
		version: 1,
		enabled: true,
		table: "npc.appearance.ancestry-specific",
		ancestryIds: ["default:ancestry.lizardfolk"],
		values: Lizardfolk,
	},
	{
		id: "default:appearance.ancestry-specific.orc",
		source: "default",
		version: 1,
		enabled: true,
		table: "npc.appearance.ancestry-specific",
		ancestryIds: [
			"default:ancestry.goblin",
			"default:ancestry.orc",
			"default:ancestry.half-orc",
		],
		values: OrcGoblin,
	},
] as const satisfies readonly AncestryAppearanceRecord[];

export const appearanceTableDefaults = [
	...Object.values(tables).flat(),
	...ancestrySpecificRecords,
];

export const npcAppearanceDefaultBundles = [
	...Object.entries(tables).map(([sectionId, records]) => ({
		generatorType: "npc",
		sectionId,
		version: 1,
		records,
	})),
	{
		generatorType: "npc",
		sectionId: "npc.appearance.ancestry-specific",
		version: 1,
		records: ancestrySpecificRecords,
	},
] satisfies readonly DefaultCatalogBundle[];
