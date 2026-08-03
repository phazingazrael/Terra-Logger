import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import { fantasyGenderDefaults, realWorldGenderDefaults } from "./defaults";
import { listGenderDefinitions } from "./repository";
import type { GenderCatalog, GenderDefinition } from "../../types";

const GENDER_SECTIONS = new Set([
	"npc.genders.real-world",
	"npc.genders.fantasy",
]);

function activeById(
	records: readonly GenderDefinition[],
): ReadonlyMap<string, GenderDefinition> {
	const result = new Map<string, GenderDefinition>();
	for (const record of records)
		if (record.enabled) result.set(record.id, record);
	return result;
}

let activeGenders = activeById([
	...realWorldGenderDefaults,
	...fantasyGenderDefaults,
]);

export function getActiveGenderDefinition(
	id: string | undefined,
): GenderDefinition | undefined {
	return id ? activeGenders.get(id) : undefined;
}

export function listActiveGenderDefinitions(options?: {
	catalog?: GenderCatalog;
	ancestryId?: string;
}): GenderDefinition[] {
	return [...activeGenders.values()]
		.filter((gender) => !options?.catalog || gender.catalog === options.catalog)
		.filter(
			(gender) =>
				!options?.ancestryId ||
				!gender.applicableAncestryIds?.length ||
				gender.applicableAncestryIds.includes(options.ancestryId),
		)
		.sort((left, right) => left.name.localeCompare(right.name));
}

export async function refreshGenderCatalog(): Promise<number> {
	activeGenders = activeById(await listGenderDefinitions());
	return activeGenders.size;
}

if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail && GENDER_SECTIONS.has(detail.sectionId))
			void refreshGenderCatalog();
	});
}
