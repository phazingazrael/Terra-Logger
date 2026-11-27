import type { ExportContext } from "./exportTypes";

export function readString(
  entity: Record<string, unknown>,
  path: string,
  fallback = "",
): string {
  const value = readPath(entity, path);

  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  return fallback;
}

export function readPath(
  entity: Record<string, unknown>,
  path: string,
): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;

    return (current as Record<string, unknown>)[key];
  }, entity);
}

export function markdownHeading(level: number, text: string): string {
  const safeLevel = Math.min(Math.max(level, 1), 6);
  const trimmed = text.trim();

  if (!trimmed) return "";

  return `${"#".repeat(safeLevel)} ${trimmed}`;
}

export function markdownList(items: string[]): string {
  const lines = items.flatMap((item) => {
    const trimmed = item.trim();
    return trimmed ? [`- ${trimmed}`] : [];
  });

  return lines.join("\n");
}

export function markdownTable(headers: string[], rows: string[][]): string {
  const cleanHeaders = headers.map(escapeMarkdownTableCell);
  const cleanRows = rows.map((row) => row.map(escapeMarkdownTableCell));

  if (cleanHeaders.length === 0 || cleanRows.length === 0) return "";

  return [
    `| ${cleanHeaders.join(" | ")} |`,
    `| ${cleanHeaders.map(() => "---").join(" | ")} |`,
    ...cleanRows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

export function escapeMarkdownTableCell(value: unknown): string {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .trim();
}

function exportTagRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function normalizeExportTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags = new Map<string, string>();
  for (const item of value) {
    const record = exportTagRecord(item);
    const name = typeof item === "string" ? item : String(record.Name ?? record.name ?? "");
    let tag = name.normalize("NFC").trim().replace(/^#+/, "")
      .replace(/[^\p{L}\p{M}\p{N}\p{Extended_Pictographic}_/\-\uFE0F\u200D]+/gu, "-")
      .split("/").map((part) => part.replace(/^-+|-+$/g, "")).filter(Boolean).join("/");
    if (!tag) continue;
    if (/^[\p{N}/]+$/u.test(tag)) tag = `tag-${tag}`;
    const key = tag.toLocaleLowerCase();
    if (!tags.has(key)) tags.set(key, tag);
  }
  return Array.from(tags.values());
}

/** Only rewrite the tags property in the opening frontmatter, never document text. */
export function withExportTags(markdown: string, tags: unknown): string {
  if (!Array.isArray(tags)) return markdown;
  return markdown.replace(/^---\r?\n([\s\S]*?)\r?\n---(?=\r?\n|$)/, (_match, body: string) => {
    const lines: string[] = [];
    let inTags = false;
    for (const line of body.split(/\r?\n/)) {
      if (/^tags\s*:/i.test(line)) { inTags = true; continue; }
      if (inTags && (!line.trim() || /^\s|^-\s/.test(line))) continue;
      inTags = false;
      lines.push(line);
    }
    const names = normalizeExportTags(tags);
    lines.push(names.length ? "tags:" : "tags: []");
    lines.push(...names.map((name) => `  - ${JSON.stringify(name)}`));
    return ["---", ...lines, "---"].join("\n");
  });
}

export function singleLineText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

/** Use only selected documents' final allocated paths; missing targets stay plain text. */
export function exportDocumentLink(
  context: ExportContext, type: string, id: unknown, label: string,
): string {
  const target = context.documentPaths?.[`${type}:${String(id ?? "")}`];
  if (!target || !context.documentPath) return label;
  const from = context.documentPath.split("/").slice(0, -1);
  const to = target.split("/");
  while (from.length && to.length && from[0] === to[0]) { from.shift(); to.shift(); }
  const path = [...from.map(() => ".."), ...to].map(encodeURIComponent).join("/");
  const text = Array.from(label, (character) => "[]\\".includes(character) ? `\\${character}` : character).join("").replace(/[\r\n]/g, " ");
  return `[${text}](${path})`;
}

/** BotI resolves icon filenames in its vault; Default retains relative asset paths. */
export function exportIcon(context: ExportContext, key: string, label: string): string {
  const path = context.documentPaths?.[`icon:${key}`];
  if (!path || !context.documentPath) return "";
  if (context.templateId === "boti") return `![[${path.split("/").pop()}|24]]`;
  return `!${exportDocumentLink(context, "icon", key, label)}`;
}

/** Resolve typed religion centres by identity before using saved display labels. */
export function renderReligionCenter(context: ExportContext): string {
  const raw = context.entity.center ?? context.entity.cultureCenter ?? context.entity.originCenter;
  const center = raw !== null && typeof raw === "object" && !Array.isArray(raw)
    ? raw as Record<string, unknown> : {};
  const folk = context.entity.type === "Folk";
  const type = folk ? "culture" : "city";
  const collection = folk ? context.data.Cultures : context.data.Cities;
  const name = String(center.name ?? center.Name ?? center.title ?? (typeof raw === "string" ? raw : ""));
  const sourceId = center.i ?? center.id ?? (typeof raw === "number" ? raw : undefined);
  let target = typeof center._id === "string" && center._id
    ? collection.find((item) => item._id === center._id)
    : sourceId !== undefined ? collection.find((item) => String(item.id) === String(sourceId) || item._id === sourceId) : undefined;
  if (!target && typeof raw === "string") target = collection.find((item) => item._id === raw || String(item.id) === raw);
  if (!target && !center._id && sourceId === undefined && name) {
    const matches = collection.filter((item) => item.name === name || (folk && `Culture - ${item.name}` === name));
    if (matches.length === 1) target = matches[0];
  }
  return target ? exportDocumentLink(context, type, target._id, target.name)
    : folk ? name.replace(/^Culture\s*-\s*/, "") : name;
}

/** Compact label/value pairs; multi-column records remain tables. */
export function markdownFieldValues(rows: Array<[string, unknown]>): string {
  return rows.map(([label, value]) => `**${label}:** _${String(value ?? "").replace(/\r?\n/g, "<br>") || "—"}_`).join("\n");
}

/** Reuse the vault's existing column callout for paired trade lists. */
export function markdownSplitLists(groups: Array<{ label: string; body: string }>, columns = false): string {
  if (!columns) return groups.map(({ label, body }) =>
    [markdownHeading(3, label), body].filter(Boolean).join("\n\n")).join("\n\n");
  const body = groups.map(({ label, body }) =>
    `>> [!resources] ${label}\n${body.split("\n").map((line) => line ? `>> ${line}` : ">> ").join("\n")}`
  ).join("\n>\n");
  return `> [!column|2 no-title]\n${body}`;
}
