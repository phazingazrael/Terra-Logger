import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import type {
	NPCAgeRangeRecord,
	NPCProfileField,
	NPCProfileGenerationRecord,
	NPCProfileValueRecord,
} from "../../types";
import {
	npcAgeRangeDefaults,
	npcProfileValueDefaults,
} from "./defaults";
import { listNPCProfileGenerationRecords } from "./repository";

let activeRecords: NPCProfileGenerationRecord[] = [
	...npcAgeRangeDefaults,
	...npcProfileValueDefaults,
].filter((record) => record.enabled);

export function listActiveNPCAgeRanges(
	ancestryId: string,
): NPCAgeRangeRecord[] {
	return activeRecords.filter(
		(record): record is NPCAgeRangeRecord =>
			record.table === "npc.profile.age-ranges" &&
			record.ancestryIds.includes(ancestryId),
	);
}

export function listActiveNPCProfileValues(
	field: NPCProfileField,
	ancestryId?: string,
): NPCProfileValueRecord[] {
	return activeRecords.filter(
		(record): record is NPCProfileValueRecord =>
			record.table !== "npc.profile.age-ranges" &&
			record.field === field &&
			(!record.ancestryIds?.length ||
				Boolean(ancestryId && record.ancestryIds.includes(ancestryId))),
	);
}

export async function refreshNPCProfileGenerationCatalog(): Promise<number> {
	activeRecords = await listNPCProfileGenerationRecords();
	return activeRecords.length;
}

if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail?.sectionId.startsWith("npc.profile."))
			void refreshNPCProfileGenerationCatalog();
	});
}
