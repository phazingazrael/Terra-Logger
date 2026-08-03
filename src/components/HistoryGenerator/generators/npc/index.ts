import type { TLNPC } from "../../../../definitions/TerraLogger";
import { registerHistoryGenerator, runHistoryGenerators, type HistoryRunDiagnostics } from "../../core";
import type { NPCHistoryMapContext } from "./context";
import { npcEmploymentHistoryGenerator } from "./employment";
import { npcFamilyHistoryGenerator } from "./family";
import { npcGovernmentAppointmentsHistoryGenerator } from "./governmentAppointments";
import { npcLifeEventsHistoryGenerator } from "./lifeEvents";
import { npcRelationshipsHistoryGenerator } from "./relationships";
import { npcResidenceHistoryGenerator } from "./residence";
import type { NPCHistorySubject } from "./types";

let registered = false;

export function registerNPCHistoryGenerators(): void {
	if (registered) return;
	registerHistoryGenerator(npcLifeEventsHistoryGenerator);
	registerHistoryGenerator(npcResidenceHistoryGenerator);
	registerHistoryGenerator(npcEmploymentHistoryGenerator);
	registerHistoryGenerator(npcGovernmentAppointmentsHistoryGenerator);
	registerHistoryGenerator(npcFamilyHistoryGenerator);
	registerHistoryGenerator(npcRelationshipsHistoryGenerator);
	registered = true;
}

export type NPCHistoryGenerationOptions = {
	currentYear?: number;
	minimumYear?: number;
	random?: () => number;
	yieldEvery?: number;
	replaceGenerated?: boolean;
	mapContext?: NPCHistoryMapContext;
};

export function clearGeneratedNPCHistory(npcs: readonly TLNPC[]): void {
	const now = new Date().toISOString();
	for (const npc of npcs) {
		const history = npc.history.filter((entry) => entry.source !== "generated");
		const relationships = npc.relationships.filter((relationship) => relationship.source !== "history");
		if (history.length !== npc.history.length || relationships.length !== npc.relationships.length) {
			npc.history = history;
			npc.relationships = relationships;
			npc.updatedAt = now;
		}
	}
}

export async function runNPCHistoryGeneration(npcs: TLNPC[], options: NPCHistoryGenerationOptions = {}): Promise<HistoryRunDiagnostics> {
	registerNPCHistoryGenerators();
	if (options.replaceGenerated) clearGeneratedNPCHistory(npcs);
	options.mapContext?.lastGeneratedYearByNPCId.clear();
	const subjects: NPCHistorySubject[] = npcs.map((npc) => ({ id: npc._id, type: "npc", npc }));
	return runHistoryGenerators(subjects, options);
}

export * from "./context";
export * from "./types";
