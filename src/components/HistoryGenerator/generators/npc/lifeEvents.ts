import type { HistoryGeneratorModule, HistoryRejection } from "../../core";
import { resolveHistoryEra } from "../../eras";
import { addGeneratedHistory, allocateHistoryYear, birthYearForNPC } from "./helpers";
import type { NPCHistoryMapContext } from "./context";
import type { NPCHistorySubject } from "./types";

export const npcLifeEventsHistoryGenerator: HistoryGeneratorModule<NPCHistorySubject> = {
	id: "npc/life-events",
	subjectType: "npc",
	async run({ subjects, currentYear, minimumYear, random, yieldControl, mapContext }) {
		let accepted = 0;
		const rejected: HistoryRejection[] = [];
		const context = mapContext as NPCHistoryMapContext | undefined;
		for (const subject of subjects) {
			const npc = subject.npc;
			const birthYear = birthYearForNPC(npc, currentYear);
			if (birthYear !== undefined) {
				const location = npc.currentLocation?.name ? ` near ${npc.currentLocation.name}` : "";
				const era = resolveHistoryEra(birthYear, context?.previousEras ?? []);
				const displayedYear = era ? `${era.year} ${era.shortName}` : String(birthYear);
				if (addGeneratedHistory(npc, { year: birthYear, era, title: `Born${location}`, description: `${npc.name} was born in year ${displayedYear}${location}.`, category: "life event" })) accepted += 1;
				context?.lastGeneratedYearByNPCId.set(npc._id, birthYear);
			}
			const matchingNotes = context?.notesByNPCId.get(npc._id) ?? [];
			for (const note of matchingNotes.slice(0, 2)) {
				const detail = String(note.legend ?? "").trim();
				if (!detail) continue;
				const year = allocateHistoryYear({ npc, minimumYear, currentYear, random, mapContext: context, earliestAge: 5 });
				if (addGeneratedHistory(npc, { year, title: note.name || "Recorded account", description: detail, category: "recorded account" })) accepted += 1;
			}
			await yieldControl();
		}
		return { accepted, rejected };
	},
};
