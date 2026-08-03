import type { NPCPortrait, TLNPC } from "../../../definitions/TerraLogger";

function createId(): string {
	return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

function text(value: unknown): string {
	return typeof value === "string" ? value.trim() : "";
}


function numericAge(value: unknown): number | "" {
	if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? Math.floor(value) : "";
	const normalized = text(value);
	if (!normalized) return "";
	const parsed = Number.parseInt(normalized, 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
}

function stringArray(value: unknown): string[] {
	return Array.isArray(value)
		? value.filter((item): item is string => typeof item === "string")
		: [];
}

export function normalizeNPCPortrait(value: unknown): NPCPortrait {
	if (!value || typeof value !== "object") return { kind: "placeholder" };
	const portrait = value as Record<string, unknown>;
	const kind = text(portrait.kind);
	if (kind === "uploaded" && text(portrait.data) && text(portrait.mimeType)) {
		return { kind: "uploaded", data: text(portrait.data), mimeType: text(portrait.mimeType), originalFileName: text(portrait.originalFileName) || undefined };
	}
	if ((kind === "data-url" || kind === "uploaded") && text(portrait.value)) {
		const data = text(portrait.value);
		const mimeType = data.match(/^data:([^;,]+)/)?.[1] || "image/png";
		return { kind: "uploaded", data, mimeType };
	}
	if ((kind === "url" || kind === "asset") && text(portrait.value)) return { kind: "url", value: text(portrait.value) };
	return { kind: "placeholder" };
}

export function ensurePersistentNPCFields(npc: TLNPC): TLNPC {
	return {
		...npc,
		nickName: text(npc.nickName),
		pronounced: text(npc.pronounced),
		heritage: text(npc.heritage),
		age: numericAge(npc.age),
		sexuality: text(npc.sexuality),
		alignment: text(npc.alignment),
		condition: text(npc.condition),
		background: text(npc.background),
		aspirationsMotivations: text(npc.aspirationsMotivations),
		publicPerception: text(npc.publicPerception),
		hiddenDetails: text(npc.hiddenDetails),
	};
}

export function isPersistentNPC(value: unknown): value is TLNPC {
	if (!value || typeof value !== "object") return false;
	const npc = value as Partial<TLNPC>;
	return (
		typeof npc._id === "string" &&
		typeof npc.mapId === "string" &&
		typeof npc.fullName === "string" &&
		Array.isArray(npc.relationships) &&
		Array.isArray(npc.history) &&
		typeof npc.createdAt === "string" &&
		typeof npc.updatedAt === "string"
	);
}

export function normalizePersistentNPC(
	value: unknown,
	fallbackMapId = "",
	now = new Date().toISOString(),
): TLNPC {
	const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
	const fullName = text(source.fullName) || text(source.name) || "Unnamed NPC";
	const profession = source.profession && typeof source.profession === "object"
		? (source.profession as Record<string, unknown>)
		: undefined;
	const skin = source.skin && typeof source.skin === "object"
		? (source.skin as Record<string, unknown>)
		: undefined;
	const eye = source.eye && typeof source.eye === "object"
		? (source.eye as Record<string, unknown>)
		: undefined;
	const hair = source.hair && typeof source.hair === "object"
		? (source.hair as Record<string, unknown>)
		: undefined;

	return {
		_id: text(source._id).replace(/^npc:/, "") || createId(),
		mapId: text(source.mapId) || fallbackMapId,
		name: text(source.name) || fullName,
		fullName,
		nickName: text(source.nickName),
		aliases: stringArray(source.aliases),
		pronouns: stringArray(source.pronouns),
		pronounced: text(source.pronounced),
		ancestry: text(source.race)
			? { id: `legacy:${text(source.race).toLowerCase()}`, name: text(source.race) }
			: undefined,
		heritage: text(source.heritage),
		gender: text(source.gender)
			? { id: `legacy:${text(source.gender).toLowerCase()}`, name: text(source.gender) }
			: undefined,
		age: numericAge(source.age),
		sexuality: text(source.sexuality),
		alignment: text(source.alignment),
		condition: text(source.condition),
		profession: profession && text(profession.title)
			? {
				id: `legacy:${text(profession.title).toLowerCase()}`,
				name: text(profession.title),
				description: text(profession.description) || undefined,
			}
			: undefined,
		appearance: {
			build: text(source.build) || undefined,
			skinTone: text(skin?.tone) || undefined,
			complexion: text(skin?.comp) || undefined,
			eyeShape: text(eye?.shape) || undefined,
			eyeColor: text(eye?.color) || undefined,
			hairStyle: text(hair?.style) || undefined,
			hairColor: text(hair?.color) || undefined,
			facialHair: text(hair?.facial) || undefined,
			descriptors: text(source.descriptors) || undefined,
		},
		personality: {
			demeanor: text(source.demeanor) || undefined,
			activities: text(source.activities) || undefined,
		},
		background: text(source.background),
		aspirationsMotivations: text(source.aspirationsMotivations),
		publicPerception: text(source.publicPerception),
		hiddenDetails: text(source.hiddenDetails),
		currentLocation: undefined,
		ownedLocations: [],
		groups: [],
		religions: [],
		notes: [],
		tags: [],
		portrait: normalizeNPCPortrait(source.portrait),
		relationships: [],
		content: undefined,
		history: [],
		generation: {
			generator: "terra-logger/npc",
			generatorVersion: "legacy",
			generatedAt: now,
			mode: "migration",
			catalogs: {},
		},
		createdAt: text(source.createdAt) || now,
		updatedAt: text(source.updatedAt) || now,
	};
}
