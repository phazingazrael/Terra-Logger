import {
	GENERATOR_CATALOG_CHANGED_EVENT,
	type GeneratorCatalogChangedDetail,
} from "../../../../generators/catalogs/events";
import { appearanceTableDefaults } from "./defaults";
import {
	isAncestryAppearanceRecord,
	isAppearanceTableRecord,
	listNPCAppearanceRecords,
} from "./repository";
import type {
	AncestryAppearanceRecord,
	AppearanceTableRecord,
	NPCAppearanceRecord,
} from "../../types";

function activeRecords(
	records: readonly NPCAppearanceRecord[],
): NPCAppearanceRecord[] {
	return records.filter((record) => record.enabled);
}

let activeAppearanceRecords = activeRecords(appearanceTableDefaults);

export function listActiveAppearanceTableRecords(
	table: string,
): AppearanceTableRecord[] {
	return activeAppearanceRecords.filter(
		(record): record is AppearanceTableRecord =>
			record.table === table && isAppearanceTableRecord(record),
	);
}

export function listActiveAncestryAppearanceRecords(
	ancestryId: string,
): AncestryAppearanceRecord[] {
	return activeAppearanceRecords.filter(
		(record): record is AncestryAppearanceRecord =>
			isAncestryAppearanceRecord(record) &&
			record.ancestryIds.includes(ancestryId),
	);
}

export async function refreshNPCAppearanceCatalog(): Promise<number> {
	activeAppearanceRecords = activeRecords(await listNPCAppearanceRecords());
	return activeAppearanceRecords.length;
}

if (typeof window !== "undefined") {
	window.addEventListener(GENERATOR_CATALOG_CHANGED_EVENT, (event: Event) => {
		const detail = (event as CustomEvent<GeneratorCatalogChangedDetail>).detail;
		if (detail?.sectionId.startsWith("npc.appearance."))
			void refreshNPCAppearanceCatalog();
	});
}
