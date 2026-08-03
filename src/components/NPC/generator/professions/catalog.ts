import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import {
	generalProfessionDefaults,
	governmentProfessionDefaults,
} from "./defaults";
import { listNPCProfessions } from "./repository";
import type { NPCProfessionCategory, NPCProfessionDefinition } from "../../types";

const PROFESSION_SECTIONS = new Set([
	"npc.professions.general",
	"npc.professions.government",
]);

function activeById(
	records: readonly NPCProfessionDefinition[],
): ReadonlyMap<string, NPCProfessionDefinition> {
	const result = new Map<string, NPCProfessionDefinition>();
	for (const record of records)
		if (record.enabled) result.set(record.id, record);
	return result;
}

let activeProfessions = activeById([
	...generalProfessionDefaults,
	...governmentProfessionDefaults,
]);

export function getActiveNPCProfession(
	id: string | undefined,
): NPCProfessionDefinition | undefined {
	return id ? activeProfessions.get(id) : undefined;
}

export function listActiveNPCProfessions(options?: {
	category?: NPCProfessionCategory;
}): NPCProfessionDefinition[] {
	return [...activeProfessions.values()]
		.filter(
			(profession) =>
				!options?.category || profession.category === options.category,
		)
		.sort(
			(left, right) =>
				left.name.localeCompare(right.name) || left.id.localeCompare(right.id),
		);
}

export async function refreshNPCProfessionCatalog(): Promise<number> {
	activeProfessions = activeById(await listNPCProfessions());
	return activeProfessions.size;
}

if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail && PROFESSION_SECTIONS.has(detail.sectionId))
			void refreshNPCProfessionCatalog();
	});
}
