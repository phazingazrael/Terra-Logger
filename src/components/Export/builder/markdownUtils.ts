export function compactMarkdown(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .concat("\n");
}

export function joinMarkdownBlocks(blocks: string[]): string {
  return compactMarkdown(blocks.map((block) => block.trim()).filter(Boolean).join("\n\n"));
}

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
  const lines = items
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `- ${item}`);

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
