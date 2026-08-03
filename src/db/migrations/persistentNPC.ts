import type { IDBPDatabase, IDBPTransaction } from "idb";
import { isPersistentNPC, normalizePersistentNPC } from "../../components/NPC/persistence/normalize";

// biome-ignore lint/suspicious/noExplicitAny: Migration must support the existing untyped database.
export async function migrateNPCsToPersistentEntity(
	db: IDBPDatabase<any>,
	// biome-ignore lint/suspicious/noExplicitAny: Upgrade transaction spans the existing schema.
	tx: IDBPTransaction<any, any, "versionchange">,
): Promise<void> {
	if (!db.objectStoreNames.contains("npcs")) return;
	const store = tx.objectStore("npcs");
	let cursor = await store.openCursor();
	while (cursor) {
		if (!isPersistentNPC(cursor.value)) {
			await cursor.update(normalizePersistentNPC(cursor.value));
		}
		cursor = await cursor.continue();
	}
}
