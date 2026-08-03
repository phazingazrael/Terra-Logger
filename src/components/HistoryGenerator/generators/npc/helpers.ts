import type { NPCHistoryEntry, NPCRelationship, TLNPC } from "../../../../definitions/TerraLogger";
import { compareOptionalYears } from "../../core";
import type { NPCHistoryMapContext } from "./context";

function uniqueId(prefix: string): string {
	return `${prefix}:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`;
}

export function addGeneratedHistory(npc: TLNPC, input: Omit<NPCHistoryEntry, "id" | "source" | "createdAt">): boolean {
	const duplicate = npc.history.some((entry) => entry.title === input.title && entry.description === input.description && entry.year === input.year);
	if (duplicate) return false;
	npc.history.push({ ...input, id: uniqueId("history"), source: "generated", createdAt: new Date().toISOString() });
	npc.history.sort((left, right) => compareOptionalYears(left.year, right.year));
	npc.updatedAt = new Date().toISOString();
	return true;
}

export function parseAge(npc: TLNPC): number | undefined {
	const value = typeof npc.age === "number" ? npc.age : typeof npc.age === "string" && npc.age.trim() ? Number(npc.age) : Number.NaN;
	return Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
}

export function birthYearForNPC(npc: TLNPC, currentYear: number | undefined): number | undefined {
	if (!Number.isFinite(currentYear)) return undefined;
	const age = parseAge(npc);
	if (age === undefined) return undefined;
	return Math.floor(currentYear as number) - age;
}


export function minimumHistoryYearForNPC(npc: TLNPC, minimumYear: number | undefined, currentYear: number | undefined): number | undefined {
	const configuredMinimum = Number.isFinite(minimumYear) ? Math.floor(minimumYear as number) : 0;
	return birthYearForNPC(npc, currentYear) ?? configuredMinimum;
}

export function minimumSharedHistoryYear(npcs: readonly TLNPC[], minimumYear: number | undefined, currentYear: number | undefined): number | undefined {
	return npcs.reduce<number | undefined>((latest, npc) => {
		const candidate = minimumHistoryYearForNPC(npc, minimumYear, currentYear);
		return latest === undefined ? candidate : candidate === undefined ? latest : Math.max(latest, candidate);
	}, undefined);
}

export function allocateHistoryYear(args: {
	npc: TLNPC;
	minimumYear?: number;
	currentYear?: number;
	random: () => number;
	mapContext?: NPCHistoryMapContext;
	earliestAge?: number;
	latestAge?: number;
}): number | undefined {
	if (!Number.isFinite(args.currentYear)) return undefined;
	const current = Math.floor(args.currentYear as number);
	const age = parseAge(args.npc);
	const birth = minimumHistoryYearForNPC(args.npc, args.minimumYear, args.currentYear) ?? 0;
	const earliest = Math.min(current, birth + Math.max(0, args.earliestAge ?? 0));
	const ageBound = age === undefined ? current : birth + Math.min(age, Math.max(args.earliestAge ?? 0, args.latestAge ?? age));
	const previous = args.mapContext?.lastGeneratedYearByNPCId.get(args.npc._id);
	const min = Math.min(current, Math.max(earliest, previous === undefined ? earliest : previous));
	const max = Math.max(min, Math.min(current, ageBound));
	const year = min + Math.floor(args.random() * (max - min + 1));
	args.mapContext?.lastGeneratedYearByNPCId.set(args.npc._id, year);
	return year;
}

export function allocateSharedHistoryYear(args: {
	npcs: readonly TLNPC[];
	minimumYear?: number;
	currentYear?: number;
	random: () => number;
	mapContext?: NPCHistoryMapContext;
	earliestAge?: number;
}): number | undefined {
	if (!Number.isFinite(args.currentYear)) return undefined;
	const current = Math.floor(args.currentYear as number);
	let min = minimumSharedHistoryYear(args.npcs, args.minimumYear, args.currentYear) ?? 0;
	for (const npc of args.npcs) {
		const birth = minimumHistoryYearForNPC(npc, args.minimumYear, args.currentYear) ?? min;
		min = Math.max(min, birth + Math.max(0, args.earliestAge ?? 0), args.mapContext?.lastGeneratedYearByNPCId.get(npc._id) ?? min);
	}
	min = Math.min(min, current);
	const year = min + Math.floor(args.random() * (current - min + 1));
	for (const npc of args.npcs) args.mapContext?.lastGeneratedYearByNPCId.set(npc._id, year);
	return year;
}

export function hasNPCRelationship(npc: TLNPC, relatedId: string, relationshipType?: string): boolean {
	return npc.relationships.some((relationship) => relationship.relatedEntityType === "npc" && relationship.relatedEntityId === relatedId && (!relationshipType || relationship.relationshipType === relationshipType));
}

export function addReciprocalHistoryRelationship(left: TLNPC, right: TLNPC, relationshipType: string, roleTitle?: string): boolean {
	if (left._id === right._id || hasNPCRelationship(left, right._id, relationshipType) || hasNPCRelationship(right, left._id, relationshipType)) return false;
	const now = new Date().toISOString();
	const create = (relatedEntityId: string): NPCRelationship => ({ id: uniqueId("relationship"), relatedEntityType: "npc", relatedEntityId, relationshipType, roleTitle, primary: false, source: "history", createdAt: now, updatedAt: now });
	left.relationships.push(create(right._id));
	right.relationships.push(create(left._id));
	left.updatedAt = now;
	right.updatedAt = now;
	return true;
}
