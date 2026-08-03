import type { DefaultCatalogBundle } from "../../../../generators/defaults";
import { governmentProfessionDefaults } from "../professions";
import GovernmentProfessionSource from "../professions/government.json";
import {
	politicalColors,
	politicalDescriptors,
	politicalIconKeys,
} from "./presentation";
import { supplementalGovernmentRoles } from "./supplementalRoles";
import type {
	GovernmentDefinition,
	GovernmentRoleCount,
	GovernmentRoleDefinition,
} from "../../types";

const GOVERNMENT_CATALOG_VERSION = 1;

const governmentNamesByCategory = {
	Monarchy: [
		"Beylik", "Despotate", "Dominion", "Duchy", "Emirate", "Empire", "Horde",
		"Grand Duchy", "Heptarchy", "Khaganate", "Khanate", "Kingdom", "Marches",
		"Principality", "Satrapy", "Shogunate", "Sultanate", "Tsardom", "Ulus", "Viceroyalty",
	],
	Republic: [
		"Chancellery", "City-state", "Diarchy", "Federation", "Free City",
		"Most Serene Republic", "Oligarchy", "Protectorate", "Republic", "Tetrarchy",
		"Trade Company", "Triumvirate",
	],
	Union: [
		"Confederacy", "Confederation", "Conglomerate", "Commonwealth", "League", "Union",
		"United Hordes", "United Kingdom", "United Provinces", "United Republic",
		"United States", "United Tribes",
	],
	Theocracy: [
		"Bishopric", "Brotherhood", "Caliphate", "Diocese", "Divine Duchy",
		"Divine Grand Duchy", "Divine Principality", "Divine Kingdom", "Divine Empire",
		"Eparchy", "Exarchate", "Holy State", "Imamah", "Patriarchate", "Theocracy",
	],
	Anarchy: ["Commune", "Community", "Council", "Free Territory", "Tribes"],
} as const;

type GovernmentProfessionInput = Record<
	string,
	Record<string, Record<string, string>>
>;

function stableSlug(value: string): string {
	const slug = value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (!slug) throw new Error(`Cannot create a government ID from "${value}".`);
	return slug;
}

function governmentId(category: string, name: string): string {
	return `default:npc.government.${stableSlug(category)}.${stableSlug(name)}`;
}

function roleId(category: string, name: string, title: string): string {
	return `default:npc.government-role.${stableSlug(category)}.${stableSlug(
		name,
	)}.${stableSlug(title)}`;
}

function countForRole(
	governmentName: string,
	roleTitle: string,
): GovernmentRoleCount {
	const override = {
		"Tetrarchy:Tetrarch": { mode: "fixed", value: 4 },
		"Tetrarchy:Quadrant Governor": { mode: "fixed", value: 4 },
		"Tetrarchy:Military Tribune": {
			mode: "random-range",
			minimum: 1,
			maximum: 4,
		},
		"Tetrarchy:Civic Planner": {
			mode: "random-range",
			minimum: 1,
			maximum: 4,
		},
		"Tetrarchy:Cultural Curator": {
			mode: "random-range",
			minimum: 1,
			maximum: 4,
		},
		"Tetrarchy:Foreign Envoy": {
			mode: "per-related-entity",
			entityType: "country",
			excludeCurrentEntity: true,
			multiplier: 1,
			minimum: 0,
		},
		"Triumvirate:Triumvir": { mode: "fixed", value: 3 },
		"Diarchy:Co-King/Co-Queen": { mode: "fixed", value: 2 },
	} as const satisfies Record<string, GovernmentRoleCount>;

	return (
		override[`${governmentName}:${roleTitle}` as keyof typeof override] ?? {
			mode: "fixed",
			value: 1,
		}
	);
}

function sourcedRoles(
	category: string,
	name: string,
	source: Record<string, string>,
): GovernmentRoleDefinition[] {
	const definitionId = governmentId(category, name);
	const professions = new Map(
		governmentProfessionDefaults
			.filter(
				(profession) => profession.governmentDefinitionId === definitionId,
			)
			.map((profession) => [profession.name, profession]),
	);

	return Object.entries(source).map(([title, description], index) => {
		const profession = professions.get(title);
		if (!profession) {
			throw new Error(`Government role "${name}: ${title}" has no profession.`);
		}
		return {
			id: profession.governmentRoleId ?? roleId(category, name, title),
			title,
			description,
			classification: index === 0 ? "leader" : "advisor",
			primary: index === 0 || undefined,
			professionId: profession.id,
			count: countForRole(name, title),
		};
	});
}

function supplementalRoles(
	category: string,
	name: string,
): GovernmentRoleDefinition[] {
	const roles = supplementalGovernmentRoles[name];
	if (roles) {
		return roles.map((role) => ({
			id: roleId(category, name, role.title),
			title: role.title,
			description: role.description,
			classification: role.classification,
			primary: role.primary,
			count: role.count ?? { mode: "fixed", value: 1 },
		}));
	}

	const fallback = {
		Monarchy: ["Sovereign", "Chancellor", "Marshal", "Treasurer"],
		Republic: ["First Magistrate", "Councilor", "Chief Justice", "Treasurer"],
		Union: ["Union Speaker", "Member Delegate", "Unity Ambassador", "Treasurer"],
		Theocracy: ["High Priest", "Religious Scholar", "Temple Guardian", "Steward"],
		Anarchy: ["Facilitator", "Mediator", "Resource Steward", "Envoy"],
	}[category as "Monarchy" | "Republic" | "Union" | "Theocracy" | "Anarchy"];

	if (!fallback) throw new Error(`Government category "${category}" has no structured role source.`);
	return fallback.map((title, index) => ({
		id: roleId(category, name, title),
		title,
		description: index === 0
			? `The primary leader or coordinating authority of the ${name}.`
			: `A senior official who supports the administration of the ${name}.`,
		classification: index === 0 ? "leader" : "advisor",
		primary: index === 0 || undefined,
		count: { mode: "fixed", value: 1 },
	}));
}

function municipalRoles(category: string, name: string): GovernmentRoleDefinition[] {
	const title = (() => {
		if (["Theocracy", "Brotherhood", "Thearchy", "See", "Holy State", "Divine Monarchy", "Diocese", "Bishopric"].includes(name)) return "High Priest";
		if (["Junta", "Horde", "Shogunate", "Khaganate"].includes(name)) return "Military Governor";
		if (["Duchy", "Grand Duchy", "Principality", "Kingdom", "Empire", "Tsardom", "Emirate", "Caliphate", "Satrapy", "Dominion", "Protectorate", "Marches", "Despotate", "Ulus"].includes(name)) return "Governor";
		if (["Free City", "City-state", "Republic", "Federation", "Most Serene Republic", "United Republic", "United Provinces", "Commonwealth"].includes(name)) return "Mayor";
		if (["Council", "Commune", "Community", "Free Territory", "Anarchy"].includes(name)) return "Council Speaker";
		if (["Oligarchy", "Tetrarchy", "Triumvirate", "Diarchy", "Heptarchy"].includes(name)) return "Magistrate";
		return category === "Monarchy" ? "Governor" : category === "Theocracy" ? "High Priest" : "Mayor";
	})();

	return [{
		id: roleId(category, name, `municipal-${title}`),
		title,
		description: `The primary local leader responsible for administering a settlement within a ${name}.`,
		classification: "leader",
		primary: true,
		count: { mode: "fixed", value: 1 },
	}];
}

export function createGovernmentDefinitionDefaults(): GovernmentDefinition[] {
	const professionSource =
		GovernmentProfessionSource as GovernmentProfessionInput;
	const records: GovernmentDefinition[] = [];

	for (const [category, governmentNames] of Object.entries(
		governmentNamesByCategory,
	)) {
		for (const name of governmentNames) {
			const descriptionHtml =
				politicalDescriptors[name as keyof typeof politicalDescriptors] ??
				politicalDescriptors[category as keyof typeof politicalDescriptors];
			const color =
				politicalColors[name as keyof typeof politicalColors] ??
				politicalColors[category as keyof typeof politicalColors];
			const iconKey =
				politicalIconKeys[name as keyof typeof politicalIconKeys] ??
				politicalIconKeys[category as keyof typeof politicalIconKeys];
			if (!descriptionHtml || !color || !iconKey) {
				throw new Error(`Government presentation is incomplete for category "${category}".`);
			}

			const roleSource = professionSource[category]?.[name];
			records.push({
				id: governmentId(category, name),
				source: "default",
				version: GOVERNMENT_CATALOG_VERSION,
				enabled: true,
				category,
				name,
				presentation: { color, iconKey },
				descriptionHtml,
				leadership: {
					roles: roleSource
						? sourcedRoles(category, name, roleSource)
						: supplementalRoles(category, name),
				},
				municipalLeadership: { roles: municipalRoles(category, name) },
			});
		}
	}

	const identifiers = new Set(records.map((record) => record.id));
	if (identifiers.size !== records.length) {
		throw new Error("Government definition IDs are not unique.");
	}
	return records;
}

export const governmentDefinitionDefaults = Object.freeze(
	createGovernmentDefinitionDefaults(),
);

export const npcGovernmentDefaultBundle = Object.freeze({
	generatorType: "npc",
	sectionId: "npc.governments",
	version: GOVERNMENT_CATALOG_VERSION,
	records: governmentDefinitionDefaults,
} as const satisfies DefaultCatalogBundle);
