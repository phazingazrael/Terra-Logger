import type { IDBPDatabase, IDBPTransaction } from "idb";
import { normalizeTradeEntries } from "../../components/Util/economy";

function migrateEntityEconomy(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected a City or Country record.");
  }

  const entity = value as Record<string, unknown>;
  const economy = entity.economy;
  if (economy != null && (typeof economy !== "object" || Array.isArray(economy))) {
    throw new Error("Expected an economy object.");
  }

  const current = (economy ?? {}) as Record<string, unknown>;
  if (current.description != null && typeof current.description !== "string") {
    throw new Error("Expected an economy description string.");
  }

  return {
    ...entity,
    economy: {
      ...current,
      description: current.description ?? "",
      imports: normalizeTradeEntries(current.imports),
      exports: normalizeTradeEntries(current.exports),
    },
  };
}

export async function migrateEconomy(
  db: IDBPDatabase<unknown>,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<void> {
  for (const storeName of ["cities", "countries"]) {
    if (!db.objectStoreNames.contains(storeName)) continue;

    const store = tx.objectStore(storeName);
    let cursor = await store.openCursor();

    while (cursor) {
      let next: Record<string, unknown>;
      try {
        next = migrateEntityEconomy(cursor.value);

        // Countries retain city snapshots as well as the separate city records.
        if (storeName === "countries" && Array.isArray(next.cities)) {
          next.cities = next.cities.map(migrateEntityEconomy);
        }
      } catch (error) {
        // The async upgrade callback must abort explicitly on validation errors.
        tx.abort();
        throw new Error(
          "Economy migration failed in " + storeName + " for " +
          String(cursor.primaryKey) + ": " +
          (error instanceof Error ? error.message : String(error)),
        );
      }

      await cursor.update(next);
      cursor = await cursor.continue();
    }
  }
}
