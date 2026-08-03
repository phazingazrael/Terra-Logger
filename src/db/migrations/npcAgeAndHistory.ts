import type { IDBPDatabase, IDBPTransaction } from "idb";

function normalizeAge(value: unknown): number | "" {
	if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? Math.floor(value) : "";
	if (typeof value !== "string") return "";
	const parsed = Number.parseInt(value.trim(), 10);
	return Number.isFinite(parsed) && parsed >= 0 ? parsed : "";
}

// biome-ignore lint/suspicious/noExplicitAny: migration must support prior untyped records.
export async function migrateNPCAgeAndHistory(db: IDBPDatabase<any>, tx: IDBPTransaction<any, any, "versionchange">): Promise<void> {
	if (!db.objectStoreNames.contains("npcs")) return;
	const store = tx.objectStore("npcs");
	let cursor = await store.openCursor();
	while (cursor) {
		const npc = cursor.value as Record<string, unknown>;
		const normalizedAge = normalizeAge(npc.age);
		const next = {
			...npc,
			age: normalizedAge,
			history: Array.isArray(npc.history) ? npc.history : [],
			relationships: Array.isArray(npc.relationships) ? npc.relationships : [],
		};
		await cursor.update(next);
		cursor = await cursor.continue();
	}
}
