import type { GeneratedNPCDraft } from "../generator/engine";
import type { NPCGenerationConstraints } from "../types";
import type { TLNPC } from "../../../definitions/TerraLogger";

export type PersistNPCDraftOptions = {
	mapId: string;
	id?: string;
	mode?: "manual" | "contextual" | "map-population";
	constraints?: NPCGenerationConstraints;
	now?: string;
};

function createNPCId(): string {
	const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
	return suffix;
}

function constraintsToRecord(
	constraints?: NPCGenerationConstraints,
): Record<string, string> | undefined {
	if (!constraints) return undefined;
	const entries = Object.entries(constraints).filter(
		(entry): entry is [string, string] => typeof entry[1] === "string",
	);
	return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export function createPersistentNPCFromDraft(
	draft: GeneratedNPCDraft,
	options: PersistNPCDraftOptions,
): TLNPC {
	const now = options.now ?? new Date().toISOString();

	return {
		_id: options.id ?? createNPCId(),
		mapId: options.mapId,
		name: draft.fullName,
		fullName: draft.fullName,
		nickName: draft.nickName,
		aliases: [],
		pronouns: [...draft.pronouns],
		pronounced: draft.pronounced,
		ancestry: { id: draft.catalog.ancestry.id, name: draft.catalog.ancestry.name },
		heritage: draft.heritage,
		gender: { id: draft.catalog.gender.id, name: draft.catalog.gender.name },
		age: draft.age,
		sexuality: draft.sexuality,
		alignment: draft.alignment,
		condition: draft.condition,
		profession: {
			id: draft.catalog.profession.id,
			name: draft.profession.title,
			description: draft.profession.description,
		},
		appearance: {
			build: draft.build || undefined,
			skinTone: draft.skin.tone || undefined,
			complexion: draft.skin.comp || undefined,
			eyeShape: draft.eye.shape || undefined,
			eyeColor: draft.eye.color || undefined,
			hairStyle: draft.hair.style || undefined,
			hairColor: draft.hair.color || undefined,
			facialHair: draft.hair.facial || undefined,
			descriptors: draft.descriptors || undefined,
		},
		personality: {
			demeanor: draft.demeanor || undefined,
			activities: draft.activities || undefined,
		},
		background: draft.background,
		aspirationsMotivations: draft.aspirationsMotivations,
		publicPerception: draft.publicPerception,
		hiddenDetails: draft.hiddenDetails,
		ownedLocations: [],
		groups: [],
		religions: [],
		notes: [],
		tags: [],
		portrait: { kind: "placeholder" },
		relationships: [],
		history: [],
		generation: {
			generator: "terra-logger/npc",
			generatorVersion: "1.0",
			generatedAt: now,
			mode: options.mode ?? "manual",
			constraints: constraintsToRecord(options.constraints),
			catalogs: {
				ancestry: { ...draft.catalog.ancestry },
				gender: { ...draft.catalog.gender },
				profession: { ...draft.catalog.profession },
				government: draft.catalog.government
					? { ...draft.catalog.government }
					: undefined,
				governmentRole: draft.catalog.governmentRole
					? { ...draft.catalog.governmentRole }
					: undefined,
			},
		},
		createdAt: now,
		updatedAt: now,
	};
}
