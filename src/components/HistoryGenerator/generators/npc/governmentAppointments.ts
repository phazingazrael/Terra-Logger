import type { HistoryGeneratorModule } from "../../core";
import { addGeneratedHistory, allocateHistoryYear } from "./helpers";
import type { NPCHistoryMapContext } from "./context";
import type { NPCHistorySubject } from "./types";

const appointmentTypes = new Set(["rules", "serves", "leads"]);

export const npcGovernmentAppointmentsHistoryGenerator: HistoryGeneratorModule<NPCHistorySubject> = {
	id: "npc/government-appointments",
	subjectType: "npc",
	async run({ subjects, currentYear, minimumYear, random, yieldControl, mapContext }) {
		let accepted = 0;
		const rejected = [];
		const context = mapContext as NPCHistoryMapContext | undefined;
		for (const subject of subjects) {
			const appointments = subject.npc.relationships.filter((relationship) => (relationship.relatedEntityType === "country" || relationship.relatedEntityType === "city") && appointmentTypes.has(relationship.relationshipType));
			if (!appointments.length) { rejected.push({ generatorId: this.id, subjectId: subject.id, reason: "missing-government-appointment" }); continue; }
			for (const appointment of appointments) {
				const title = appointment.roleTitle || "Government Official";
				const year = allocateHistoryYear({ npc: subject.npc, minimumYear, currentYear, random, mapContext: context, earliestAge: 18 });
				if (addGeneratedHistory(subject.npc, { year, title: `Appointed ${title}`, description: `${subject.npc.name} was appointed as ${title}.`, category: "government" })) accepted += 1;
				else rejected.push({ generatorId: this.id, subjectId: subject.id, reason: "duplicate-history" });
			}
			await yieldControl();
		}
		return { accepted, rejected };
	},
};
