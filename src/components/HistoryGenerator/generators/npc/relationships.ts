import { boundedCandidates, buildCandidateIndex, stableUnorderedPairKey, type HistoryGeneratorModule } from "../../core";
import { addGeneratedHistory, addReciprocalHistoryRelationship, allocateSharedHistoryYear, hasNPCRelationship } from "./helpers";
import type { NPCHistoryMapContext } from "./context";
import type { NPCHistorySubject } from "./types";

const MAX_LOCATION_CANDIDATES = 8;

export const npcRelationshipsHistoryGenerator: HistoryGeneratorModule<NPCHistorySubject> = {
	id: "npc/relationships",
	subjectType: "npc",
	async run({ subjects, currentYear, minimumYear, random, yieldControl, mapContext }) {
		let accepted = 0;
		const rejected = [];
		const context = mapContext as NPCHistoryMapContext | undefined;
		const handled = new Set<string>();
		const index = buildCandidateIndex(subjects, (subject) => subject.npc.currentLocation?.id ? [subject.npc.currentLocation.id] : []);
		for (const candidates of index.values()) {
			const bounded = boundedCandidates(candidates, MAX_LOCATION_CANDIDATES);
			for (let index = 0; index + 1 < bounded.length; index += 2) {
				const left = bounded[index].npc;
				const right = bounded[index + 1].npc;
				const pairKey = stableUnorderedPairKey(left._id, right._id);
				if (handled.has(pairKey)) continue;
				handled.add(pairKey);
				if (hasNPCRelationship(left, right._id) || hasNPCRelationship(right, left._id) || !addReciprocalHistoryRelationship(left, right, "acquaintance", "Acquaintance")) { rejected.push({ generatorId: this.id, subjectId: left._id, reason: "duplicate-or-existing-relationship" }); continue; }
				const location = left.currentLocation?.name ?? right.currentLocation?.name ?? "their community";
				const year = allocateSharedHistoryYear({ npcs: [left, right], minimumYear, currentYear, random, mapContext: context, earliestAge: 8 });
				addGeneratedHistory(left, { year, title: `Met ${right.name}`, description: `${left.name} became acquainted with ${right.name} in ${location}.`, category: "relationship" });
				addGeneratedHistory(right, { year, title: `Met ${left.name}`, description: `${right.name} became acquainted with ${left.name} in ${location}.`, category: "relationship" });
				accepted += 2;
				await yieldControl();
			}
		}
		return { accepted, rejected };
	},
};
