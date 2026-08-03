import type { IDBPDatabase, IDBPTransaction } from "idb";
import { normalizeNPCPortrait } from "../../components/NPC/persistence/normalize";

function replaceReferences(value: unknown, replacements: ReadonlyMap<string, string>): unknown {
  if (typeof value === "string") return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => replaceReferences(item, replacements));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, replaceReferences(item, replacements)]));
}

// biome-ignore lint/suspicious/noExplicitAny: Migration spans existing untyped map stores.
export async function migrateNPCIdentityAndPortrait(
  db: IDBPDatabase<any>,
  // biome-ignore lint/suspicious/noExplicitAny: Upgrade transaction spans the existing schema.
  tx: IDBPTransaction<any, any, "versionchange">,
): Promise<void> {
  if (!db.objectStoreNames.contains("npcs")) return;
  const npcStore = tx.objectStore("npcs");
  const replacements = new Map<string, string>();
  let cursor = await npcStore.openCursor();
  while (cursor) {
    const oldId = typeof cursor.value?._id === "string" ? cursor.value._id : String(cursor.key);
    if (oldId.startsWith("npc:")) replacements.set(oldId, oldId.slice(4));
    cursor = await cursor.continue();
  }

  if (replacements.size) {
    cursor = await npcStore.openCursor();
    while (cursor) {
      const oldKey = String(cursor.key);
      const replaced = replaceReferences(cursor.value, replacements) as Record<string, unknown>;
      const nextId = replacements.get(oldKey) ?? String(replaced._id ?? oldKey);
      const next = { ...replaced, _id: nextId, id: replacements.get(String(replaced.id ?? "")) ?? replaced.id };
      if (nextId !== oldKey) {
        const collision = await npcStore.get(nextId);
        if (collision) throw new Error(`Cannot migrate NPC ID ${oldKey}; ${nextId} already exists.`);
        await cursor.delete();
        await npcStore.put(next);
      } else {
        await cursor.update(next);
      }
      cursor = await cursor.continue();
    }
  }

  // Update exact NPC-ID references in every map-owned store, including Atlas content.
  for (const storeName of Array.from(db.objectStoreNames)) {
    if (!replacements.size || storeName === "npcs") continue;
    const store = tx.objectStore(storeName);
    let storeCursor = await store.openCursor();
    while (storeCursor) {
      const replaced = replaceReferences(storeCursor.value, replacements);
      await storeCursor.update(replaced);
      storeCursor = await storeCursor.continue();
    }
  }

  cursor = await npcStore.openCursor();
  while (cursor) {
    const value = cursor.value as Record<string, unknown>;
    await cursor.update({ ...value, portrait: normalizeNPCPortrait(value.portrait) });
    cursor = await cursor.continue();
  }
}
