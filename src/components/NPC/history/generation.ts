import { getMapEras, mapWithEraRecords, reflowMapEras } from "../../HistoryGenerator/eras/mapEras";
import { queryDataFromStore } from "../../../db/interactions";
import { initMapsDatabase } from "../../../db/connections/mapsDatabase";
import type { TLMapEra } from "../../../definitions/History";
import type { TLNPC } from "../../../definitions/TerraLogger";
import type { MapInf, TLCity, TLCountry, TLCulture, TLNote, TLReligion } from "../../../definitions/TerraLogger";
import type { HistoryRunDiagnostics } from "../../HistoryGenerator/core/types";
import {
	applyEraMetadataToNPCs,
	collectPreviousEraDrafts,
	type PreviousEraDraft,
} from "../../HistoryGenerator/eras/model";
import { promptForPreviousEra } from "../../HistoryGenerator/eras/prompt";
import { matchNotesToNPCs, type NPCHistoryMapContext } from "../../HistoryGenerator/generators/npc/context";
import { runNPCHistoryGeneration } from "../../HistoryGenerator/generators/npc";
import { ensurePersistentNPCFields } from "../persistence/normalize";
import { NPC_GENERATION_BATCH_SIZE, yieldToBrowser } from "../performance";


export type PersistedNPCHistoryGenerationOptions = {
	npcIds?: readonly string[];
	replaceGenerated?: boolean;
	random?: () => number;
	yieldEvery?: number;
	onProgress?: (completed: number, total: number, message: string) => void;
};

async function listMapRows<T>(store: "cities" | "countries" | "cultures" | "notes" | "religions" | "npcs", mapId: string): Promise<T[]> {
	return queryDataFromStore<T>(store, "mapIdIndex", IDBKeyRange.only(mapId));
}

export type NPCHistoryEraRequirement = {
	drafts: PreviousEraDraft[];
	currentYear: number;
	minimumYear: number;
};

export async function buildNPCHistoryMapContext(mapId: string, npcs?: readonly TLNPC[]): Promise<NPCHistoryMapContext> {
	const db = await initMapsDatabase();
	const [mapRows, cities, countries, cultures, religions, notes, loadedNPCs, eras] = await Promise.all([
		db.getAllFromIndex("maps", "mapIdIndex", mapId) as Promise<MapInf[]>,
		listMapRows<TLCity>("cities", mapId),
		listMapRows<TLCountry>("countries", mapId),
		listMapRows<TLCulture>("cultures", mapId),
		listMapRows<TLReligion>("religions", mapId),
		listMapRows<TLNote>("notes", mapId),
		npcs ? Promise.resolve([...npcs]) : listMapRows<TLNPC>("npcs", mapId),
		db.getAllFromIndex("eras", "mapIdIndex", mapId) as Promise<TLMapEra[]>,
	]);
	const map = mapRows[0] ? reflowMapEras(mapWithEraRecords(mapRows[0], eras)) : undefined;
	return {
		map,
		cities,
		countries,
		cultures,
		religions,
		notes,
		notesByNPCId: matchNotesToNPCs(loadedNPCs, notes),
		lastGeneratedYearByNPCId: new Map(),
		previousEras: map?.historyGenerator?.previousEras ?? [],
		currentEraMinimumYear: map?.historyGenerator?.currentEraMinimumYear ?? 0,
	};
}


async function resolvePreviousErasForNPCs(mapId: string, npcs: readonly TLNPC[]): Promise<NPCHistoryMapContext> {
	let context = await buildNPCHistoryMapContext(mapId);
	const year = context.map?.settings.options.year;
	const currentYear = year !== undefined && Number.isFinite(year) ? Math.floor(year) : 0;
	let drafts = collectPreviousEraDrafts(npcs, currentYear, context.currentEraMinimumYear, context.previousEras);
	while (drafts.length) {
		await promptForPreviousEra(mapId, drafts);
		context = await buildNPCHistoryMapContext(mapId);
		drafts = collectPreviousEraDrafts(npcs, currentYear, context.currentEraMinimumYear, context.previousEras);
	}
	return context;
}

export async function generateNPCHistoryForRecords(
	npcs: TLNPC[],
	mapId: string,
	options: Omit<PersistedNPCHistoryGenerationOptions, "npcIds" | "onProgress"> = {},
): Promise<HistoryRunDiagnostics> {
	const context = await resolvePreviousErasForNPCs(mapId, npcs);
	const currentYear = Number.isFinite(context.map?.settings.options.year) ? context.map?.settings.options.year : undefined;
	const diagnostics = await runNPCHistoryGeneration(npcs, {
		replaceGenerated: options.replaceGenerated,
		currentYear,
		minimumYear: context.currentEraMinimumYear,
		random: options.random,
		yieldEvery: options.yieldEvery,
		mapContext: context,
	});
	applyEraMetadataToNPCs(npcs, context.map ? getMapEras(context.map) : context.previousEras);
	return diagnostics;
}

export async function generateAndPersistNPCHistory(mapId: string, options: PersistedNPCHistoryGenerationOptions = {}): Promise<HistoryRunDiagnostics> {
	const allNPCs = await listMapRows<TLNPC>("npcs", mapId);
	const selectedIds = options.npcIds ? new Set(options.npcIds) : undefined;
	const selected = selectedIds ? allNPCs.filter((npc) => selectedIds.has(npc._id)) : allNPCs;
	const context = await resolvePreviousErasForNPCs(mapId, selected);
	const currentYear = Number.isFinite(context.map?.settings.options.year) ? context.map?.settings.options.year : undefined;
	const diagnostics = await runNPCHistoryGeneration(selected, {
		replaceGenerated: options.replaceGenerated,
		currentYear,
		minimumYear: context.currentEraMinimumYear,
		random: options.random,
		yieldEvery: options.yieldEvery,
		mapContext: context,
	});

	applyEraMetadataToNPCs(selected, context.map ? getMapEras(context.map) : context.previousEras);

	if (!selected.length) return diagnostics;
	const db = await initMapsDatabase();
	const batchSize = NPC_GENERATION_BATCH_SIZE;
	for (let start = 0; start < selected.length; start += batchSize) {
		const end = Math.min(start + batchSize, selected.length);
		const tx = db.transaction("npcs", "readwrite");
		// The batch is bounded, and each transaction must finish before the next batch.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await Promise.all(
			selected
				.slice(start, end)
				.map((npc) => tx.store.put(ensurePersistentNPCFields(npc))),
		);
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await tx.done;
		options.onProgress?.(end, selected.length, `Persisted history for ${end.toLocaleString("en-US")} of ${selected.length.toLocaleString("en-US")} NPCs.`);
		// Browser yielding is intentionally ordered between batches.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await yieldToBrowser();
	}
	return diagnostics;
}
