import type { Tag } from "../../../../definitions/Common";
import type { AtlasRelatedUpdate } from "../../../../definitions/Atlas";
import type { TLCity, TLNote } from "../../../../definitions/TerraLogger";

type StoredTag = Tag & {
  mapId?: string;
};

type SaveAtlasRelatedUpdatesArgs = {
  updates: AtlasRelatedUpdate[] | undefined;
  entity: unknown;
  existingTags: Tag[];
  add: (store: "tags", data: StoredTag) => Promise<void>;
  update: (
    store: "tags" | "notes" | "cities",
    key: string,
    data: StoredTag | TLNote | TLCity,
  ) => Promise<void>;
};

export async function saveAtlasRelatedUpdates({
  updates,
  entity,
  existingTags,
  add,
  update,
}: SaveAtlasRelatedUpdatesArgs): Promise<void> {
  const existingTagIds = new Set(existingTags.map((tag) => tag._id));
  const pendingTagAdds = new Map<string, StoredTag>();
  const pendingTagUpdates = new Map<string, StoredTag>();
  const pendingNoteUpdates = new Map<string, TLNote>();
  const pendingCityUpdates = new Map<string, TLCity>();

  for (const relatedUpdate of updates ?? []) {
    if (relatedUpdate.store === "notes") {
      if (relatedUpdate.action === "update") {
        pendingNoteUpdates.set(relatedUpdate.key, relatedUpdate.value);
      }

      continue;
    }

    if (relatedUpdate.store === "cities") {
      if (relatedUpdate.action === "update") {
        pendingCityUpdates.set(relatedUpdate.key, relatedUpdate.value);
      }

      continue;
    }

    if (relatedUpdate.store !== "tags") continue;

    if (relatedUpdate.action === "add") {
      const tag = ensureTagMapId(relatedUpdate.value, entity);

      if (existingTagIds.has(tag._id)) {
        pendingTagUpdates.set(tag._id, tag);
      } else {
        pendingTagAdds.set(tag._id, tag);
      }

      continue;
    }

    const tag = ensureTagMapId(relatedUpdate.value, entity);
    pendingTagUpdates.set(relatedUpdate.key, tag);
  }

  for (const tag of getAppliedTagsFromEntity(entity)) {
    if (existingTagIds.has(tag._id)) continue;

    if (isAtlasCreatedTag(tag)) {
      pendingTagAdds.set(tag._id, ensureTagMapId(tag, entity));
    }
  }

  for (const [key, city] of pendingCityUpdates) {
    await update("cities", key, city);
  }

  for (const [key, note] of pendingNoteUpdates) {
    await update("notes", key, note);
  }

  for (const [key, tag] of pendingTagUpdates) {
    await update("tags", key, tag);
  }

  for (const tag of pendingTagAdds.values()) {
    await add("tags", tag);
  }
}

function getAppliedTagsFromEntity(entity: unknown): StoredTag[] {
  if (!isRecord(entity)) return [];

  const tags = entity.tags;

  if (!Array.isArray(tags)) return [];

  return tags
    .map(normalizeStoredTag)
    .filter((tag): tag is StoredTag => Boolean(tag));
}

function normalizeStoredTag(value: unknown): StoredTag | null {
  if (!isRecord(value)) return null;

  if (typeof value._id !== "string" || !value._id) return null;
  if (typeof value.Name !== "string" || !value.Name) return null;

  return {
    _id: value._id,
    Name: value.Name,
    Type: typeof value.Type === "string" ? value.Type : "Custom",
    Default: Boolean(value.Default),
    Description:
      typeof value.Description === "string" ? value.Description : "",
    mapId: typeof value.mapId === "string" ? value.mapId : undefined,
  };
}

function isAtlasCreatedTag(tag: StoredTag): boolean {
  return tag._id.startsWith("tag_");
}

function ensureTagMapId(tag: StoredTag, entity: unknown): StoredTag {
  if (tag.mapId) return tag;

  const mapId = getEntityMapId(entity);

  if (!mapId) return tag;

  return {
    ...tag,
    mapId,
  };
}

function getEntityMapId(entity: unknown): string | undefined {
  if (!isRecord(entity)) return undefined;

  return typeof entity.mapId === "string" ? entity.mapId : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
