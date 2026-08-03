import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import { ancestryDefaults } from "./defaults";
import { listAncestryDefinitions } from "./repository";
import type { AncestryDefinition, AncestryRarity } from "../../types";

const ANCESTRY_SECTION_ID = "npc.ancestries";

function activeById(
	records: readonly AncestryDefinition[],
): ReadonlyMap<string, AncestryDefinition> {
	const result = new Map<string, AncestryDefinition>();
	for (const record of records)
		if (record.enabled) result.set(record.id, record);
	return result;
}

let activeAncestries = activeById(ancestryDefaults);

export function getActiveAncestryDefinition(
	id: string | undefined,
): AncestryDefinition | undefined {
	return id ? activeAncestries.get(id) : undefined;
}

export function listActiveAncestryDefinitions(options?: {
	rarity?: AncestryRarity;
}): AncestryDefinition[] {
	return [...activeAncestries.values()]
		.filter(
			(ancestry) => !options?.rarity || ancestry.rarity === options.rarity,
		)
		.sort((left, right) => left.name.localeCompare(right.name));
}

export async function refreshAncestryCatalog(): Promise<number> {
	activeAncestries = activeById(await listAncestryDefinitions());
	return activeAncestries.size;
}

if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail?.sectionId === ANCESTRY_SECTION_ID)
			void refreshAncestryCatalog();
	});
}
