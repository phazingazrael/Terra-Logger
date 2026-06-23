import type { AtlasRenderContext } from "../../../definitions/Atlas";
import { richTextJsonToHtml } from "../core/richText";


export type ResolvedDescription = {
  value: string;
  format: "text" | "html";
  source: "entity" | "note" | "fallback";
};

type DescribableEntity = {
  name?: string;
  nameFull?: string;
  description?: unknown;
  Description?: unknown;
  legend?: unknown;
  type?: string;
};

type RelatedNote = {
  name?: string;
  type?: string;
  legend?: unknown;
  description?: unknown;
  Description?: unknown;
};

export function resolveGenericDescription(
  context: AtlasRenderContext,
): ResolvedDescription {
  const entity = context.entity as DescribableEntity;
  const sourceType = context.sourceType;

  const noteDescription = getMatchingNoteDescription(context);

  if (noteDescription.value) {
    return {
      ...noteDescription,
      source: "note",
    };
  }

  const directDescription = getDirectEntityDescription(entity);

  if (directDescription.value) {
    return {
      ...directDescription,
      source: "entity",
    };
  }

  const entityName = entity.nameFull || entity.name || "This entry";

  return {
    value: `${entityName} is a ${sourceType}.`,
    format: "text",
    source: "fallback",
  };
}

function getDirectEntityDescription(
  entity: DescribableEntity,
): Omit<ResolvedDescription, "source"> {
  const candidates = [
    entity.description,
    entity.Description,
    entity.legend,
  ];

  for (const candidate of candidates) {
    const description = normalizeDescriptionValue(candidate);

    if (description.value) return description;
  }

  return {
    value: "",
    format: "text",
  };
}

function getMatchingNoteDescription(
  context: AtlasRenderContext,
): Omit<ResolvedDescription, "source"> {
  const entity = context.entity as DescribableEntity;
  const sourceType = context.sourceType;

  const notes = Array.isArray(context.related?.notes)
    ? (context.related.notes as RelatedNote[])
    : [];

  const entityNames = getEntityNameCandidates(entity);

  if (entityNames.size === 0) {
    return {
      value: "",
      format: "text",
    };
  }

  const matchingNote = notes.find((note) => {
    const noteName = normalizeName(note.name);
    const noteType = normalizeType(note.type);
    const wantedType = normalizeType(sourceType);

    const nameMatches = entityNames.has(noteName);

    const typeMatches =
      noteType === wantedType ||
      noteType === `${wantedType}s`;

    return nameMatches && typeMatches;
  });

  if (!matchingNote) {
    return {
      value: "",
      format: "text",
    };
  }

  return (
    normalizeDescriptionValue(matchingNote.legend) ||
    normalizeDescriptionValue(matchingNote.description) ||
    normalizeDescriptionValue(matchingNote.Description) || {
      value: "",
      format: "text",
    }
  );
}

function normalizeDescriptionValue(
  value: unknown,
): Omit<ResolvedDescription, "source"> {
  if (value === undefined || value === null) {
    return {
      value: "",
      format: "text",
    };
  }

  if (typeof value !== "string") {
    return {
      value: String(value).trim(),
      format: "text",
    };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return {
      value: "",
      format: "text",
    };
  }

  if (looksLikeRichTextJson(trimmed)) {
    return {
      value: richTextJsonToHtml(trimmed),
      format: "html",
    };
  }

  if (looksLikeHtml(trimmed)) {
    return {
      value: trimmed,
      format: "html",
    };
  }

  return {
    value: trimmed,
    format: "text",
  };
}

function getEntityNameCandidates(entity: DescribableEntity): Set<string> {
  return new Set(
    [
      entity.name,
      entity.nameFull,
    ]
      .map(normalizeName)
      .filter(Boolean),
  );
}

function normalizeName(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeType(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function looksLikeRichTextJson(value: string): boolean {
  return (
    value.startsWith("{") &&
    value.includes('"type"') &&
    value.includes('"doc"')
  );
}
