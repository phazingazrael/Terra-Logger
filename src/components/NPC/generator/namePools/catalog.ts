import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import { namePoolDefaults } from "./defaults";
import { listNamePoolDefinitions } from "./repository";
import type { NamePoolDefinition } from "../../types";

const NAME_POOL_SECTION_ID = "npc.name-pools";

function activeById(
	records: readonly NamePoolDefinition[],
): ReadonlyMap<string, NamePoolDefinition> {
	const result = new Map<string, NamePoolDefinition>();
	for (const record of records)
		if (record.enabled) result.set(record.id, record);
	return result;
}

let activeNamePools = activeById(namePoolDefaults);

export function getActiveNamePoolDefinition(
	id: string | undefined,
): NamePoolDefinition | undefined {
	return id ? activeNamePools.get(id) : undefined;
}

export async function refreshNamePoolCatalog(): Promise<number> {
	activeNamePools = activeById(await listNamePoolDefinitions());
	return activeNamePools.size;
}


if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail?.sectionId === NAME_POOL_SECTION_ID)
			void refreshNamePoolCatalog();
	});
}
