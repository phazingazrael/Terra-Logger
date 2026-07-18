import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { readString } from "../../../../builder/markdownUtils";

type ExtraFrontmatterField = {
  key: string;
  value: unknown;
  block?: boolean;
};

export function renderBotiNoteFrontmatter({
  entity,
  banner,
  type,
  noteIcon = "Note",
  extraFields = [],
}: {
  entity: Record<string, unknown>;
  banner: string;
  type: string;
  noteIcon?: string;
  extraFields?: ExtraFrontmatterField[];
}): string {
  const name =
    readString(entity, "name") ||
    readString(entity, "Name") ||
    readString(entity, "title");

  const content =
    readString(entity, "legend") ||
    readString(entity, "Content") ||
    readString(entity, "content") ||
    readString(entity, "description");

  const tags = normalizeTags(entity.tags);

  return [
    "---",
    `BANNER: ${quoteYamlString(banner)}`,
    `NoteIcon: ${quoteYamlString(noteIcon)}`,
    `Type: ${quoteYamlString(type)}`,
    `Name: ${quoteYamlString(name)}`,
    `Content: ${yamlBlockScalar(content)}`,
    ...extraFields.map((field) =>
      field.block
        ? `${field.key}: ${yamlBlockScalar(formatYamlValue(field.value))}`
        : `${field.key}: ${quoteYamlString(formatYamlValue(field.value))}`,
    ),
    "tags:",
    ...tags.map((tag) => `  - ${quoteYamlString(tag)}`),
    "---",
  ].join("\n");
}

export function createBotiNoteTemplateBlock({
  id,
  banner,
  type,
  body,
  noteIcon = "Note",
  extraFields,
}: {
  id: string;
  banner: string;
  type: string;
  body: string[];
  noteIcon?: string;
  extraFields?: (entity: Record<string, unknown>) => ExtraFrontmatterField[];
}): MarkdownBlock {
  return {
    id,

    render({ entity }) {
      const frontmatter = renderBotiNoteFrontmatter({
        entity,
        banner,
        type,
        noteIcon,
        extraFields: extraFields?.(entity) ?? [],
      });

      return [frontmatter, "", ...body].join("\n");
    },
  };
}

function yamlBlockScalar(value: string): string {
  const normalized = value.replace(/\r\n?/g, "\n");

  if (!normalized.trim()) return quoteYamlString("");

  const indented = normalized
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");

  return `|-\n${indented}`;
}

function quoteYamlString(value: string): string {
  return JSON.stringify(value ?? "");
}

function formatYamlValue(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "string") return value.trim();

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return "";
}

function normalizeTags(value: unknown): string[] {
  const tags = Array.isArray(value) ? value : [];

  return tags
    .map((tag) => {
      if (typeof tag === "string") return tag.trim();

      if (tag && typeof tag === "object") {
        const record = tag as Record<string, unknown>;

        return String(record.Name ?? record.name ?? "").trim();
      }

      return "";
    })
    .filter(Boolean);
}
