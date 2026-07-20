import type { IDBPDatabase, IDBPTransaction } from "idb";
import type {
  AtlasContent,
  AtlasEntityBySource,
  AtlasSourceType,
} from "../../definitions/Atlas";
import { createDefaultAtlasContent } from "../../components/atlas/adapters/registry";
import { isAtlasContent } from "../../components/atlas/core/validators";
import {
  isLegacyJsonUiContent,
  migrateLegacyJsonUiContent,
} from "../../components/atlas/legacy/jsonUiConverter";
import { enrichAtlasContent } from "../../components/atlas/legacy/enrichAtlasContent";

type AtlasMigrationStoreConfig<TSource extends AtlasSourceType = AtlasSourceType> = {
  storeName: string;
  sourceType: TSource;
};

const ATLAS_MIGRATION_STORES: AtlasMigrationStoreConfig[] = [
  { storeName: "cities", sourceType: "city" },
  { storeName: "countries", sourceType: "country" },
  { storeName: "cultures", sourceType: "culture" },
  { storeName: "religions", sourceType: "religion" },
  { storeName: "notes", sourceType: "note" },
];

type AtlasMigrationResult = {
  checked: number;
  updated: number;
  alreadyAtlas: number;
  legacyConverted: number;
  defaultCreated: number;
  enriched: number;
};

export async function migrateAtlasContentToV3(
  db: IDBPDatabase<unknown>,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<void> {
  const totals: Record<string, AtlasMigrationResult> = {};

  for (const config of ATLAS_MIGRATION_STORES) {
    if (!db.objectStoreNames.contains(config.storeName)) continue;

    totals[config.storeName] = await migrateStore(config, tx);
  }

  console.log("Atlas IndexedDB migration v3 complete:", totals);
}

export async function migrateAtlasContentToV4(
  db: IDBPDatabase<unknown>,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<void> {
  const totals: Record<string, AtlasMigrationResult> = {};

  for (const config of ATLAS_MIGRATION_STORES) {
    if (!db.objectStoreNames.contains(config.storeName)) continue;

    totals[config.storeName] = await enrichStore(config, tx);
  }

  console.log("Atlas IndexedDB migration v4 complete:", totals);
}

async function enrichStore(
  config: AtlasMigrationStoreConfig,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<AtlasMigrationResult> {
  const result: AtlasMigrationResult = {
    checked: 0,
    updated: 0,
    alreadyAtlas: 0,
    legacyConverted: 0,
    defaultCreated: 0,
    enriched: 0,
  };

  const store = tx.objectStore(config.storeName);
  let cursor = await store.openCursor();

  while (cursor) {
    result.checked += 1;

    const record = cursor.value as Record<string, unknown>;
    const nextContent = enrichRecordContent(config.sourceType, record, result);

    if (nextContent) {
      await cursor.update({
        ...record,
        content: nextContent,
      });

      result.updated += 1;
    }

    cursor = await cursor.continue();
  }

  return result;
}

function enrichRecordContent<TSource extends AtlasSourceType>(
  sourceType: TSource,
  record: Record<string, unknown>,
  result: AtlasMigrationResult,
): AtlasContent | null {
  const currentContent = record.content;
  const entity = record as AtlasEntityBySource[TSource];

  if (isAtlasContent(currentContent)) {
    result.alreadyAtlas += 1;

    const enrichedContent = enrichAtlasContent({
      sourceType,
      entity,
      content: currentContent,
    });

    if (enrichedContent === currentContent) {
      return null;
    }

    result.enriched += 1;
    return enrichedContent;
  }

  const defaultContent = createDefaultAtlasContent(sourceType, entity);

  if (isLegacyJsonUiContent(currentContent)) {
    result.legacyConverted += 1;

    const migratedContent = migrateLegacyJsonUiContent({
      defaultContent,
      legacyContent: currentContent,
      strategy: "replaceMatchingEditable",
    });

    const enrichedContent = enrichAtlasContent({
      sourceType,
      entity,
      content: migratedContent,
    });

    result.enriched += enrichedContent === migratedContent ? 0 : 1;

    return {
      ...enrichedContent,
      meta: {
        ...enrichedContent.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  }

  result.defaultCreated += 1;

  return {
    ...defaultContent,
    meta: {
      ...defaultContent.meta,
      createdBy: "migration",
      updatedAt: new Date().toISOString(),
    },
  };
}

async function migrateStore(
  config: AtlasMigrationStoreConfig,
  tx: IDBPTransaction<unknown, string[], "versionchange">,
): Promise<AtlasMigrationResult> {
  const result: AtlasMigrationResult = {
    checked: 0,
    updated: 0,
    alreadyAtlas: 0,
    legacyConverted: 0,
    defaultCreated: 0,
    enriched: 0,
  };

  const store = tx.objectStore(config.storeName);
  let cursor = await store.openCursor();

  while (cursor) {
    result.checked += 1;

    const record = cursor.value as Record<string, unknown>;
    const nextContent = migrateRecordContent(config.sourceType, record, result);

    if (nextContent) {
      await cursor.update({
        ...record,
        content: nextContent,
      });

      result.updated += 1;
    }

    cursor = await cursor.continue();
  }

  return result;
}

function migrateRecordContent<TSource extends AtlasSourceType>(
  sourceType: TSource,
  record: Record<string, unknown>,
  result: AtlasMigrationResult,
): AtlasContent | null {
  const currentContent = record.content;

  if (isAtlasContent(currentContent)) {
    result.alreadyAtlas += 1;
    return null;
  }

  const defaultContent = createDefaultAtlasContent(
    sourceType,
    record as AtlasEntityBySource[TSource],
  );

  if (isLegacyJsonUiContent(currentContent)) {
    result.legacyConverted += 1;

    return migrateLegacyJsonUiContent({
      defaultContent,
      legacyContent: currentContent,
      strategy: "replaceMatchingEditable",
    });
  }

  result.defaultCreated += 1;
  return {
    ...defaultContent,
    meta: {
      ...defaultContent.meta,
      createdBy: "migration",
      updatedAt: new Date().toISOString(),
    },
  };
}
