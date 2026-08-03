import type { DefaultCatalogBundle } from "../../../../generators/defaults";
import type { GenderDefinition } from "../../types";

const common = {
	source: "default",
	version: 1,
	enabled: true,
	catalog: "real-world",
	generationWeight: 10,
} as const;

export const realWorldGenderDefaults = [
	{
		...common,
		id: "default:gender.male",
		name: "Male",
		description:
			"A male person is someone whose gender identity is man or boy. This identity is distinct from anatomy, assigned sex, gender expression, and the particular pronouns a person uses.",
		defaultPronouns: ["he", "him", "his"],
		namePoolStrategy: "masculine",
	},
	{
		...common,
		id: "default:gender.female",
		name: "Female",
		description:
			"A female person is someone whose gender identity is woman or girl. This identity is distinct from anatomy, assigned sex, gender expression, and the particular pronouns a person uses.",
		defaultPronouns: ["she", "her", "hers"],
		namePoolStrategy: "feminine",
	},
	{
		...common,
		id: "default:gender.nonbinary",
		name: "Nonbinary",
		description:
			"A nonbinary person has a gender identity that is not exclusively male or exclusively female. Nonbinary is an umbrella identity and does not prescribe appearance, anatomy, pronouns, or a single way of experiencing gender.",
		defaultPronouns: ["they", "them", "theirs"],
		namePoolStrategy: "neutral",
		generationWeight: 3,
	},
	{
		...common,
		id: "default:gender.genderfluid",
		name: "Genderfluid",
		description:
			"A genderfluid person experiences a gender identity that can change over time or by context. The identities, pace of change, expression, and pronouns involved are individual and should not be inferred from appearance.",
		defaultPronouns: ["they", "them", "theirs"],
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
	{
		...common,
		id: "default:gender.agender",
		name: "Agender",
		description:
			"An agender person identifies as having no gender, a neutral gender, or little connection to the concept of gender. Agender people may use any pronouns and may express themselves in any way.",
		defaultPronouns: ["they", "them", "theirs"],
		namePoolStrategy: "neutral",
		generationWeight: 2,
	},
	{
		...common,
		id: "default:gender.bigender",
		name: "Bigender",
		description:
			"A bigender person identifies with two genders, either simultaneously or at different times. Those genders and the person's pronouns or expression are individual rather than fixed by the label.",
		defaultPronouns: ["they", "them", "theirs"],
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
	{
		...common,
		id: "default:gender.genderqueer",
		name: "Genderqueer",
		description:
			"A genderqueer person has a gender identity or expression that deliberately exists outside conventional gender categories. The term can overlap with nonbinary while remaining a distinct self-chosen identity.",
		defaultPronouns: ["they", "them", "theirs"],
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
	{
		...common,
		id: "default:gender.transgender-male",
		name: "Transgender Male / FTM",
		description:
			"A transgender male is a man who was assigned a different sex at birth. FTM is included as a familiar catalog label, though individual men may prefer terms such as trans man, transgender man, or simply man.",
		defaultPronouns: ["he", "him", "his"],
		namePoolStrategy: "masculine",
		generationWeight: 2,
	},
	{
		...common,
		id: "default:gender.transgender-female",
		name: "Transgender Female / MTF",
		description:
			"A transgender female is a woman who was assigned a different sex at birth. MTF is included as a familiar catalog label, though individual women may prefer terms such as trans woman, transgender woman, or simply woman.",
		defaultPronouns: ["she", "her", "hers"],
		namePoolStrategy: "feminine",
		generationWeight: 2,
	},
	{
		...common,
		id: "default:gender.questioning",
		name: "Questioning",
		description:
			"A questioning person is actively exploring or reconsidering their gender identity. The label does not imply a final identity, particular pronouns, or uncertainty in other parts of the person's life.",
		defaultPronouns: ["they", "them", "theirs"],
		namePoolStrategy: "mixed",
		generationWeight: 1,
	},
] as const satisfies readonly GenderDefinition[];

const dragonkin = ["default:ancestry.dragonkin"];
const demonkin = ["default:ancestry.demonkin"];
const lizardfolk = ["default:ancestry.lizardfolk"];

export const fantasyGenderDefaults = [
	{
		id: "default:gender.dragonkin.ember",
		source: "default",
		version: 1,
		enabled: true,
		catalog: "fantasy",
		name: "Ember",
		description:
			"Ember is a Dragonkin gender associated with an inward, enduring sense of self: a banked flame that remains present even as roles and outward expression change. It does not imply anatomy, temperament, social rank, or a particular set of pronouns.",
		defaultPronouns: ["they", "them", "theirs"],
		applicableAncestryIds: dragonkin,
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
	{
		id: "default:gender.dragonkin.prism",
		source: "default",
		version: 1,
		enabled: true,
		catalog: "fantasy",
		name: "Prism",
		description:
			"Prism is a Dragonkin gender understood as containing several gendered facets that may be expressed together or in different circumstances. A Prism Dragonkin's facets, presentation, and pronouns are personal rather than prescribed.",
		defaultPronouns: ["they", "them", "theirs"],
		applicableAncestryIds: dragonkin,
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
	{
		id: "default:gender.dragonkin.eclipse",
		source: "default",
		version: 1,
		enabled: true,
		catalog: "fantasy",
		name: "Eclipse",
		description:
			"Eclipse is a Dragonkin gender defined by an identity outside the customary masculine and feminine paths. The name reflects a distinct alignment of self, not absence, concealment, anatomy, or moral character.",
		defaultPronouns: ["they", "them", "theirs"],
		applicableAncestryIds: dragonkin,
		namePoolStrategy: "neutral",
		generationWeight: 2,
	},
	{
		id: "default:gender.demonkin.virtueborn",
		source: "default",
		version: 1,
		enabled: true,
		catalog: "fantasy",
		name: "Virtueborn",
		description:
			"Virtueborn is a Demonkin gender shaped around a consciously chosen ideal that forms part of the person's identity. The chosen ideal may influence a personal name, but it does not dictate behavior, morality, anatomy, or pronouns.",
		defaultPronouns: ["they", "them", "theirs"],
		applicableAncestryIds: demonkin,
		namePoolStrategy: "custom",
		customNamePoolIds: ["default:name-pool.demonkin"],
		generationWeight: 2,
	},
	{
		id: "default:gender.demonkin.fluxborn",
		source: "default",
		version: 1,
		enabled: true,
		catalog: "fantasy",
		name: "Fluxborn",
		description:
			"Fluxborn is a Demonkin gender whose experience of self changes between distinct states or resists remaining fixed. The rhythm and meaning of those changes are individual and do not determine appearance or pronouns.",
		defaultPronouns: ["they", "them", "theirs"],
		applicableAncestryIds: demonkin,
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
	{
		id: "default:gender.lizardfolk.cyclescaled",
		source: "default",
		version: 1,
		enabled: true,
		catalog: "fantasy",
		name: "Cyclescaled",
		description:
			"Cyclescaled is a Lizardfolk gender experienced in recurring phases, with each phase belonging to one continuous identity. Its cycles need not follow seasons or biology, and expression and pronouns remain personal.",
		defaultPronouns: ["they", "them", "theirs"],
		applicableAncestryIds: lizardfolk,
		namePoolStrategy: "mixed",
		generationWeight: 2,
	},
] as const satisfies readonly GenderDefinition[];

export const npcGenderDefaultBundles = [
	{
		generatorType: "npc",
		sectionId: "npc.genders.real-world",
		version: 1,
		records: realWorldGenderDefaults,
	},
	{
		generatorType: "npc",
		sectionId: "npc.genders.fantasy",
		version: 1,
		records: fantasyGenderDefaults,
	},
] as const satisfies readonly DefaultCatalogBundle[];
