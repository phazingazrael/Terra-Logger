import { boundedCandidates, buildCandidateIndex, stableUnorderedPairKey, type HistoryGeneratorModule } from "../../core";
import { addGeneratedHistory, addReciprocalHistoryRelationship, allocateSharedHistoryYear, hasNPCRelationship, parseAge } from "./helpers";
import type { NPCHistoryMapContext } from "./context";
import type { NPCHistorySubject } from "./types";

const MAX_FAMILY_CANDIDATES = 6;
const MAX_SIBLING_AGE_GAP = 18;
const FAMILY_WORDS = /\b(family|sibling|brother|sister|parent|child|clan|house|dynasty)\b/i;

function familyEvidenceKeys(subject: NPCHistorySubject, context?: NPCHistoryMapContext): string[] {
	const keys = subject.npc.groups
		.filter((group) => FAMILY_WORDS.test(group.name))
		.map((group) => `group:${group.id}`);
	for (const note of context?.notesByNPCId.get(subject.npc._id) ?? []) {
		if (FAMILY_WORDS.test(`${note.name} ${note.legend}`)) keys.push(`note:${note._id}`);
	}
	return keys;
}

export const npcFamilyHistoryGenerator: HistoryGeneratorModule<NPCHistorySubject> = {
	id: "npc/family",
	subjectType: "npc",
	async run({ subjects, currentYear, minimumYear, random, yieldControl, mapContext }) {
		let accepted = 0;
		const rejected = [];
		const handled = new Set<string>();
		const context = mapContext as NPCHistoryMapContext | undefined;
		const index = buildCandidateIndex(subjects, (subject) => familyEvidenceKeys(subject, context));

		for (const candidates of index.values()) {
			const bounded = boundedCandidates(candidates, MAX_FAMILY_CANDIDATES);
			for (let leftIndex = 0; leftIndex < bounded.length; leftIndex += 1) {
				for (let rightIndex = leftIndex + 1; rightIndex < bounded.length; rightIndex += 1) {
					const left = bounded[leftIndex].npc;
					const right = bounded[rightIndex].npc;
					const pairKey = stableUnorderedPairKey(left._id, right._id);
					if (handled.has(pairKey)) continue;
					handled.add(pairKey);
					const leftAge = parseAge(left);
					const rightAge = parseAge(right);
					if (left.ancestry?.id && right.ancestry?.id && left.ancestry.id !== right.ancestry.id) { rejected.push({ generatorId: this.id, subjectId: left._id, reason: "different-races" }); continue; }
					if (leftAge === undefined || rightAge === undefined) { rejected.push({ generatorId: this.id, subjectId: left._id, reason: "missing-numeric-age" }); continue; }
					if (Math.abs(leftAge - rightAge) > MAX_SIBLING_AGE_GAP) { rejected.push({ generatorId: this.id, subjectId: left._id, reason: "implausible-sibling-age-gap" }); continue; }
					if (hasNPCRelationship(left, right._id) || hasNPCRelationship(right, left._id) || !addReciprocalHistoryRelationship(left, right, "sibling", "Sibling")) { rejected.push({ generatorId: this.id, subjectId: left._id, reason: "duplicate-or-existing-relationship" }); continue; }
					const year = allocateSharedHistoryYear({ npcs: [left, right], minimumYear, currentYear, random, mapContext: context, earliestAge: 0 });
					addGeneratedHistory(left, { year, title: `Sibling of ${right.name}`, description: `${left.name} and ${right.name} are siblings.`, category: "family" });
					addGeneratedHistory(right, { year, title: `Sibling of ${left.name}`, description: `${right.name} and ${left.name} are siblings.`, category: "family" });
					accepted += 2;
					await yieldControl();
				}
			}
		}
		return { accepted, rejected };
	},
};
