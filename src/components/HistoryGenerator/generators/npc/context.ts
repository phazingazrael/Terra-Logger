import type { TLNPC } from "../../../../definitions/TerraLogger";
import type { TLHistoryEra } from "../../../../definitions/History";
import type { MapInf, TLCity, TLCountry, TLCulture, TLNote, TLReligion } from "../../../../definitions/TerraLogger";

export type NPCHistoryMapContext = {
	map?: MapInf;
	cities: readonly TLCity[];
	countries: readonly TLCountry[];
	cultures: readonly TLCulture[];
	religions: readonly TLReligion[];
	notes: readonly TLNote[];
	notesByNPCId: ReadonlyMap<string, readonly TLNote[]>;
	lastGeneratedYearByNPCId: Map<string, number>;
	previousEras: readonly TLHistoryEra[];
	currentEraMinimumYear: number;
};

function normalizeName(value: unknown): string {
	return String(value ?? "").trim().toLocaleLowerCase();
}

function npcNameCandidates(npc: TLNPC): Set<string> {
	return new Set(
		[npc.name, npc.fullName, npc.nickName, ...(npc.aliases ?? [])].flatMap(
			(value) => {
				const name = normalizeName(value);
				return name ? [name] : [];
			},
		),
	);
}

export function matchNotesToNPCs(npcs: readonly TLNPC[], notes: readonly TLNote[]): ReadonlyMap<string, readonly TLNote[]> {
	const result = new Map<string, TLNote[]>();
	const explicitByNPC = new Map(npcs.map((npc) => [npc._id, new Set((npc.notes ?? []).map((note) => note.id))]));

	for (const npc of npcs) {
		const names = npcNameCandidates(npc);
		const explicit = explicitByNPC.get(npc._id) ?? new Set<string>();
		const matches = notes.filter((note) => {
			if (explicit.has(note._id) || explicit.has(note.id)) return true;
			const noteName = normalizeName(note.name);
			if (!noteName || !names.has(noteName)) return false;
			const type = normalizeName(note.type);
			return !type || type === "npc" || type === "npcs" || type === "person" || type === "character";
		});
		result.set(npc._id, matches);
	}

	return result;
}
