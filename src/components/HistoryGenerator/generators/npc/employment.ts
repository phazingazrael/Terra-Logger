import type { HistoryGeneratorModule } from "../../core";
import { addGeneratedHistory, allocateHistoryYear } from "./helpers";
import type { NPCHistoryMapContext } from "./context";
import type { NPCHistorySubject } from "./types";

export const npcEmploymentHistoryGenerator: HistoryGeneratorModule<NPCHistorySubject> = {
	id: "npc/employment",
	subjectType: "npc",
	async run({ subjects, currentYear, minimumYear, random, yieldControl, mapContext }) {
		let accepted = 0;
		const rejected = [];
		const context = mapContext as NPCHistoryMapContext | undefined;
		for (const subject of subjects) {
			const profession = subject.npc.profession;
			if (!profession?.name) { rejected.push({ generatorId: this.id, subjectId: subject.id, reason: "missing-profession" }); continue; }
			const year = allocateHistoryYear({ npc: subject.npc, minimumYear, currentYear, random, mapContext: context, earliestAge: 14 });
			const added = addGeneratedHistory(subject.npc, { year, title: `Began work as ${profession.name}`, description: `${subject.npc.name} began working as ${profession.name}.${profession.description ? ` ${profession.description}` : ""}`, category: "employment" });
			if (added) accepted += 1; else rejected.push({ generatorId: this.id, subjectId: subject.id, reason: "duplicate-history" });
			await yieldControl();
		}
		return { accepted, rejected };
	},
};
