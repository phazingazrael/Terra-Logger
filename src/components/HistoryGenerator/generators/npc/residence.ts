import type { HistoryGeneratorModule } from "../../core";
import { addGeneratedHistory, allocateHistoryYear } from "./helpers";
import type { NPCHistoryMapContext } from "./context";
import type { NPCHistorySubject } from "./types";

export const npcResidenceHistoryGenerator: HistoryGeneratorModule<NPCHistorySubject> = {
	id: "npc/residence",
	subjectType: "npc",
	async run({ subjects, currentYear, minimumYear, random, yieldControl, mapContext }) {
		let accepted = 0;
		const rejected = [];
		const context = mapContext as NPCHistoryMapContext | undefined;
		for (const subject of subjects) {
			const location = subject.npc.currentLocation;
			if (!location?.name) { rejected.push({ generatorId: this.id, subjectId: subject.id, reason: "missing-current-location" }); continue; }
			const year = allocateHistoryYear({ npc: subject.npc, minimumYear, currentYear, random, mapContext: context, earliestAge: 0 });
			if (addGeneratedHistory(subject.npc, { year, title: `Settled in ${location.name}`, description: `${subject.npc.name} established a residence in ${location.name}.`, category: "residence" })) accepted += 1;
			else rejected.push({ generatorId: this.id, subjectId: subject.id, reason: "duplicate-history" });
			await yieldControl();
		}
		return { accepted, rejected };
	},
};
