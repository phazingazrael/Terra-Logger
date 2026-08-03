import type { DefaultCatalogBundle } from "../../../../generators/defaults";
import GovernmentProfessions from "./government.json";
import ProfessionDescriptions from "./profession.desc.json";
import ProfessionNames from "./profession.json";
import type { NPCProfessionDefinition } from "../../types";

const PROFESSION_CATALOG_VERSION = 1;

type GovernmentProfessionSource = Record<
	string,
	Record<string, Record<string, string>>
>;

function stableSlug(value: string): string {
	const slug = value
		.replace(/<[^>]+>/g, " ")
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	if (!slug)
		throw new Error(`Cannot create a stable profession ID from "${value}".`);
	return slug;
}

function assertUniqueIds(records: readonly NPCProfessionDefinition[]): void {
	const identifiers = new Set<string>();
	for (const record of records) {
		if (identifiers.has(record.id)) {
			throw new Error(`Duplicate normalized profession ID "${record.id}".`);
		}
		identifiers.add(record.id);
	}
}

function normalizeGeneralName(name: string): {
	name: string;
	legacyName?: string;
	requiresBaseProfession?: boolean;
} {
	if (name === "Apprentice<br>(Roll again for profession)") {
		return {
			name: "Apprentice",
			legacyName: name,
			requiresBaseProfession: true,
		};
	}
	if (name === "Journeyman<br>(Roll again for profession)") {
		return {
			name: "Journeyman",
			legacyName: name,
			requiresBaseProfession: true,
		};
	}
	return { name };
}

export function createGeneralProfessionDefaults(): NPCProfessionDefinition[] {
	const descriptions = ProfessionDescriptions as Record<string, string>;
	const records = (ProfessionNames as string[]).map((legacyName) => {
		const normalizedName = normalizeGeneralName(legacyName);
		return {
			id: `default:npc.profession.general.${stableSlug(normalizedName.name)}`,
			source: "default" as const,
			version: PROFESSION_CATALOG_VERSION,
			enabled: true,
			catalog: "general" as const,
			category: "general" as const,
			description: descriptions[normalizedName.name] ?? "",
			...normalizedName,
		};
	});
	assertUniqueIds(records);
	return records;
}

export function createGovernmentProfessionDefaults(): NPCProfessionDefinition[] {
	const source = GovernmentProfessions as GovernmentProfessionSource;
	const records: NPCProfessionDefinition[] = [];

	for (const [governmentCategory, governments] of Object.entries(source)) {
		for (const [governmentName, roles] of Object.entries(governments)) {
			const governmentPath = `${stableSlug(governmentCategory)}.${stableSlug(
				governmentName,
			)}`;
			for (const [name, description] of Object.entries(roles)) {
				const rolePath = `${governmentPath}.${stableSlug(name)}`;
				records.push({
					id: `default:npc.profession.government.${rolePath}`,
					source: "default",
					version: PROFESSION_CATALOG_VERSION,
					enabled: true,
					catalog: "government",
					category: "government",
					name,
					description,
					governmentCategory,
					governmentDefinitionId: `default:npc.government.${governmentPath}`,
					governmentRoleId: `default:npc.government-role.${rolePath}`,
				});
			}
		}
	}

	assertUniqueIds(records);
	return records;
}

export const generalProfessionDefaults = Object.freeze(
	createGeneralProfessionDefaults(),
);
export const governmentProfessionDefaults = Object.freeze(
	createGovernmentProfessionDefaults(),
);

export const npcProfessionDefaultBundles = Object.freeze([
	{
		generatorType: "npc",
		sectionId: "npc.professions.general",
		version: PROFESSION_CATALOG_VERSION,
		records: generalProfessionDefaults,
	},
	{
		generatorType: "npc",
		sectionId: "npc.professions.government",
		version: PROFESSION_CATALOG_VERSION,
		records: governmentProfessionDefaults,
	},
] as const satisfies readonly DefaultCatalogBundle[]);
