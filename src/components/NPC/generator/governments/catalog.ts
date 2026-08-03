import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import { governmentDefinitionDefaults } from "./defaults";
import { listGovernmentDefinitions } from "./repository";
import type { GovernmentDefinition, GovernmentRoleDefinition } from "../../types";

const GOVERNMENT_SECTION_ID = "npc.governments";

function normalizeName(name: string): string {
	return name.trim().toLocaleLowerCase();
}

function buildDefinitionMap(
	definitions: readonly GovernmentDefinition[],
): ReadonlyMap<string, GovernmentDefinition> {
	const byName = new Map<string, GovernmentDefinition>();
	const ordered = [...definitions].sort(
		(left, right) =>
			(left.source === "default" ? 0 : 1) -
			(right.source === "default" ? 0 : 1) || left.id.localeCompare(right.id),
	);
	for (const definition of ordered) {
		if (definition.enabled)
			byName.set(normalizeName(definition.name), definition);
	}
	return byName;
}

let activeDefinitions = buildDefinitionMap(governmentDefinitionDefaults);

export function getActiveGovernmentDefinitionById(
	id: string | undefined,
): GovernmentDefinition | undefined {
	if (!id) return undefined;
	return [...activeDefinitions.values()].find(
		(definition) => definition.id === id,
	);
}

export function getGovernmentDefinition(
	type: string | undefined,
): GovernmentDefinition | undefined {
	if (!type?.trim()) return undefined;
	return activeDefinitions.get(normalizeName(type));
}

export function getGovernmentLeadershipStructure(
	type: string | undefined,
): readonly GovernmentRoleDefinition[] {
	return getGovernmentDefinition(type)?.leadership.roles ?? [];
}

export async function refreshGovernmentDefinitionCatalog(): Promise<number> {
	const definitions = await listGovernmentDefinitions();
	activeDefinitions = buildDefinitionMap(definitions);
	return activeDefinitions.size;
}


if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail?.sectionId === GOVERNMENT_SECTION_ID) {
			void refreshGovernmentDefinitionCatalog();
		}
	});
}
