import type { ExportSourceType } from "./exportTypes";
import {
  markdownHeading,
  markdownList,
  markdownTable,
  readPath,
  readString,
} from "./markdownUtils";

type AtlasExportContent = {
  sections?: AtlasExportSection[];
};

type AtlasExportSection = {
  id?: string;
  kind?: string;
  label?: string;
  title?: string;
  className?: string;
  wrapper?: {
    className?: string;
    gridSpan?: string;
    variant?: string;
  };
  blocks?: AtlasExportBlock[];
};

type AtlasExportBlock = {
  id?: string;
  kind?: string;
  type?: string;
  label?: string;
  dataMode?: string;
  binding?: {
    path?: string;
    entityPath?: string;
    valuePath?: string;
    resolver?: string;
  };
  editor?: {
    editorType?: string;
    editable?: boolean;
    removable?: boolean;
    reorderable?: boolean;
  };
  props?: Record<string, unknown>;
  rows?: unknown;
  fields?: unknown;
  details?: unknown;
  groups?: unknown;
  sections?: unknown;
  items?: unknown;
  children?: unknown;
  values?: unknown;
  options?: unknown;
  content?: unknown;
  value?: unknown;
  text?: unknown;
  [key: string]: unknown;
};

export function renderAtlasSectionByLabelToMarkdown({
  entity,
  sourceType,
  data,
  labels,
  headingLevel = 2,
}: {
  entity: Record<string, unknown>;
  sourceType: ExportSourceType;
  data?: {
    Notes?: unknown[];
  };
  labels: string[];
  headingLevel?: number;
}): string {
  const content = entity.content;

  if (!isAtlasContent(content)) return "";

  const normalizedLabels = labels.map(normalizeText);

  const section = (content.sections ?? []).find((candidate) => {
    const label = normalizeText(candidate.label ?? candidate.title ?? "");
    const className = normalizeText(
      [
        candidate.className,
        candidate.wrapper?.className,
      ]
        .filter(Boolean)
        .join(" "),
    );

    return normalizedLabels.some(
      (expected) => label === expected || className.includes(expected),
    );
  });

  if (!section) return "";

  return renderAtlasSectionToMarkdown({
    section,
    entity,
    sourceType,
    data,
    headingLevel,
  });
}

export function renderEntityDescriptionBodyToMarkdown({
  entity,
  sourceType,
  data,
}: {
  entity: Record<string, unknown>;
  sourceType: ExportSourceType;
  data?: {
    Notes?: unknown[];
  };
}): string {
  const body = renderEntityDescriptionBlock(entity, sourceType, data).trim();

  return body || createDescriptionFallback(entity, sourceType);
}

export function renderAtlasNoteBodyToMarkdown(
  entity: Record<string, unknown>,
): string {
  const content = entity.content;

  if (!isAtlasContent(content)) {
    return renderLegacyNoteBody(entity);
  }

  const bodySection = findNoteBodySection(content);

  if (!bodySection) {
    return renderLegacyNoteBody(entity);
  }

  const renderedBlocks = (bodySection.blocks ?? [])
    .map((block) => renderNoteBodyBlock(block, entity))
    .filter(Boolean);

  const body = renderedBlocks.join("\n\n").trim();

  return body || renderLegacyNoteBody(entity);
}

export function renderAtlasNoteEditorNotesToMarkdown(
  entity: Record<string, unknown>,
): string {
  const content = entity.content;

  if (!isAtlasContent(content)) return "";

  const editorNotesSection = findEditorNotesSection(content);

  if (!editorNotesSection) return "";

  const renderedBlocks = (editorNotesSection.blocks ?? [])
    .map((block) => renderEditorNotesBlock(block, entity))
    .filter(Boolean);

  return renderedBlocks.join("\n\n").trim();
}


function renderAtlasSectionToMarkdown({
  section,
  entity,
  sourceType,
  data,
  headingLevel,
}: {
  section: AtlasExportSection;
  entity: Record<string, unknown>;
  sourceType: ExportSourceType;
  data?: {
    Notes?: unknown[];
  };
  headingLevel: number;
}): string {
  const title = section.label?.trim() || section.title?.trim() || "";
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];

  const renderedBlocks = blocks
    .map((block) =>
      renderGenericAtlasBlockToMarkdown({
        block,
        entity,
        sourceType,
        data,
      }),
    )
    .filter(Boolean);

  if (renderedBlocks.length === 0) return "";

  return [title ? markdownHeading(headingLevel, title) : "", ...renderedBlocks]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function renderGenericAtlasBlockToMarkdown({
  block,
  entity,
  sourceType,
  data,
}: {
  block: AtlasExportBlock;
  entity: Record<string, unknown>;
  sourceType: ExportSourceType;
  data?: {
    Notes?: unknown[];
  };
}): string {
  if (isDescriptionBlock(block)) {
    return renderEntityDescriptionBlock(entity, sourceType, data);
  }

  const richText = renderPotentialRichTextBlock(block);

  if (richText) return richText;

  const rows = renderPotentialRowsBlock(block, entity);

  if (rows) return rows;

  const groups = renderPotentialGroupsBlock(block, entity);

  if (groups) return groups;

  const list = renderPotentialListBlock(block, entity);

  if (list) return list;

  const boundValue = renderPotentialBoundBlock(block, entity);

  if (boundValue) return boundValue;

  return renderUnknownAtlasBlock(block, entity);
}

function renderPotentialRichTextBlock(block: AtlasExportBlock): string {
  const value = getFirstPresentValue([
    block.props?.json,
    block.props?.richText,
    block.props?.markdown,
    block.props?.html,
    block.props?.content,
    block.props?.value,
    block.props?.text,
    block.content,
    block.value,
    block.text,
  ]);

  return normalizeBodyToMarkdown(value);
}

function renderPotentialRowsBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  const rawRows = getFirstPresentValue([
    block.props?.rows,
    block.props?.fields,
    block.props?.details,
    block.rows,
    block.fields,
    block.details,
  ]);

  return renderPotentialRowsValue(rawRows, entity);
}

function renderPotentialGroupsBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  const rawGroups = getFirstPresentValue([
    block.props?.groups,
    block.props?.sections,
    block.groups,
    block.sections,
  ]);

  if (!Array.isArray(rawGroups)) return "";

  const renderedGroups = rawGroups
    .map((group) => renderAtlasGroup(group, entity))
    .filter(Boolean);

  return renderedGroups.join("\n\n").trim();
}

function renderPotentialListBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  const rawItems = getFirstPresentValue([
    block.props?.items,
    block.props?.children,
    block.props?.values,
    block.props?.options,
    block.items,
    block.children,
    block.values,
    block.options,
  ]);

  return renderPotentialListValue(rawItems, entity);
}

function renderPotentialBoundBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  const path =
    block.binding?.path ?? block.binding?.entityPath ?? block.binding?.valuePath;

  if (!path) return "";

  const value = readPath(entity, path);

  return renderBoundValueToMarkdown({
    label: block.label,
    value,
  });
}

function renderUnknownAtlasBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  const props = block.props;

  if (!props || typeof props !== "object") return "";

  return renderUnknownAtlasValue(props, entity, {
    skipKeys: new Set([
      "label",
      "emptyText",
      "className",
      "variant",
      "gridSpan",
    ]),
  }).trim();
}

function findNoteBodySection(
  content: AtlasExportContent,
): AtlasExportSection | null {
  const sections = Array.isArray(content.sections) ? content.sections : [];

  return (
    sections.find((section) => isNoteBodySection(section)) ??
    sections.find((section) =>
      (section.blocks ?? []).some((block) => isDescriptionBlock(block)),
    ) ??
    null
  );
}

function isNoteBodySection(section: AtlasExportSection): boolean {
  const label = normalizeText(section.label ?? section.title ?? "");
  const className = normalizeText(
    [
      section.className,
      section.wrapper?.className,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return (
    label === "note body" ||
    label === "imported note" ||
    className.includes("note legend") ||
    className.includes("note body")
  );
}

function findEditorNotesSection(
  content: AtlasExportContent,
): AtlasExportSection | null {
  const sections = Array.isArray(content.sections) ? content.sections : [];

  return sections.find((section) => isEditorNotesSection(section)) ?? null;
}

function isEditorNotesSection(section: AtlasExportSection): boolean {
  const label = normalizeText(section.label ?? section.title ?? "");
  const className = normalizeText(
    [
      section.className,
      section.wrapper?.className,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return label === "editor notes" || className.includes("editor notes");
}

function renderNoteBodyBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  if (isDescriptionBlock(block)) {
    return normalizeBodyToMarkdown(
      readString(entity, "legend") ||
      readString(entity, "description") ||
      readString(entity, "body"),
    );
  }

  if (isRichTextBlock(block)) {
    return normalizeBodyToMarkdown(getRichTextBlockValue(block));
  }

  const boundPath = block.binding?.path ?? block.binding?.entityPath;

  if (boundPath) {
    return normalizeBodyToMarkdown(readPath(entity, boundPath));
  }

  return "";
}

function renderEditorNotesBlock(
  block: AtlasExportBlock,
  entity: Record<string, unknown>,
): string {
  if (isRichTextBlock(block)) {
    return normalizeEditorNotesBody(getRichTextBlockValue(block));
  }

  const boundPath = block.binding?.path ?? block.binding?.entityPath;

  if (boundPath) {
    return normalizeEditorNotesBody(readPath(entity, boundPath));
  }

  return "";
}

function normalizeEditorNotesBody(value: unknown): string {
  const markdown = normalizeBodyToMarkdown(value);

  if (!markdown) return "";

  // Prevent exporting the default placeholder as real content.
  if (normalizeText(markdown) === "add your notes here") return "";

  return markdown;
}

function renderEntityDescriptionBlock(
  entity: Record<string, unknown>,
  sourceType: ExportSourceType,
  data?: {
    Notes?: unknown[];
  },
): string {
  if (sourceType === "note") {
    return normalizeBodyToMarkdown(
      readString(entity, "legend") ||
      readString(entity, "description") ||
      readString(entity, "body"),
    );
  }

  const directDescription =
    readString(entity, "description") ||
    readString(entity, "legend") ||
    readString(entity, "body");

  if (directDescription) {
    return normalizeBodyToMarkdown(directDescription);
  }

  const matchingNoteDescription = findMatchingNoteDescription({
    entity,
    sourceType,
    notes: data?.Notes,
  });

  return normalizeBodyToMarkdown(
    matchingNoteDescription || createDescriptionFallback(entity, sourceType),
  );
}

function findMatchingNoteDescription({
  entity,
  sourceType,
  notes,
}: {
  entity: Record<string, unknown>;
  sourceType: ExportSourceType;
  notes?: unknown[];
}): string {
  if (!Array.isArray(notes)) return "";

  const entityName = normalizeText(
    readString(entity, "name") ||
    readString(entity, "nameFull") ||
    readString(entity, "title"),
  );

  if (!entityName) return "";

  const expectedType = normalizeText(sourceType);

  const matchingNote = notes.find((note) => {
    if (!note || typeof note !== "object") return false;

    const noteRecord = note as Record<string, unknown>;

    const noteName = normalizeText(
      readString(noteRecord, "name") || readString(noteRecord, "title"),
    );

    const noteType = normalizeText(readString(noteRecord, "type"));

    return noteName === entityName && noteType === expectedType;
  });

  if (!matchingNote || typeof matchingNote !== "object") return "";

  const noteRecord = matchingNote as Record<string, unknown>;

  return (
    readString(noteRecord, "legend") ||
    readString(noteRecord, "description") ||
    readString(noteRecord, "body")
  );
}

function createDescriptionFallback(
  entity: Record<string, unknown>,
  sourceType: ExportSourceType,
): string {
  const name =
    readString(entity, "name") ||
    readString(entity, "nameFull") ||
    readString(entity, "title") ||
    "This";

  const article = startsWithVowelSound(sourceType) ? "an" : "a";

  return `${name} is ${article} ${sourceType}.`;
}

function startsWithVowelSound(value: string): boolean {
  return /^[aeiou]/i.test(value.trim());
}

function renderLegacyNoteBody(entity: Record<string, unknown>): string {
  return normalizeBodyToMarkdown(
    readString(entity, "legend") ||
    readString(entity, "description") ||
    readString(entity, "body"),
  );
}

function isDescriptionBlock(block: AtlasExportBlock): boolean {
  return (
    block.type === "description" ||
    block.editor?.editorType === "description" ||
    block.binding?.resolver === "generic.description"
  );
}

function isRichTextBlock(block: AtlasExportBlock): boolean {
  return (
    block.type === "richText" ||
    block.type === "richTextBlock" ||
    block.editor?.editorType === "richText"
  );
}

function getRichTextBlockValue(block: AtlasExportBlock): unknown {
  return (
    block.props?.json ??
    block.props?.richText ??
    block.props?.markdown ??
    block.props?.html ??
    block.props?.content ??
    block.props?.value ??
    block.props?.text ??
    block.content ??
    block.value ??
    block.text
  );
}

function getFirstPresentValue(values: unknown[]): unknown {
  return values.find((value) => !isEmptyExportValue(value));
}

function normalizeRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (row): row is Record<string, unknown> => !!row && typeof row === "object",
  );
}

function getRowLabel(row: Record<string, unknown>): string {
  const value = row.label ?? row.name ?? row.title ?? row.path ?? row.value;

  return typeof value === "string" ? value.trim() : "";
}

function getAtlasRowValue(
  row: Record<string, unknown>,
  entity: Record<string, unknown>,
): unknown {
  const valueMode = String(row.valueMode ?? "");

  if (valueMode === "entity" && typeof row.value === "string") {
    return readPath(entity, row.value);
  }

  if (valueMode === "static") {
    return row.value;
  }

  if (typeof row.path === "string") {
    return readPath(entity, row.path);
  }

  if (typeof row.entityPath === "string") {
    return readPath(entity, row.entityPath);
  }

  if (typeof row.valuePath === "string") {
    return readPath(entity, row.valuePath);
  }

  if (typeof row.value === "string" && valueMode === "path") {
    return readPath(entity, row.value);
  }

  return row.value;
}

function renderAtlasGroup(
  group: unknown,
  entity: Record<string, unknown>,
): string {
  if (!group || typeof group !== "object") return "";

  const record = group as Record<string, unknown>;

  const name =
    readString(record, "name") ||
    readString(record, "label") ||
    readString(record, "title");

  const rawRows = getFirstPresentValue([
    record.rows,
    record.fields,
    record.details,
  ]);

  const rows = renderPotentialRowsValue(rawRows, entity);

  const rawChildren = getFirstPresentValue([
    record.children,
    record.items,
    record.values,
  ]);

  const children = renderPotentialListValue(rawChildren, entity);

  const rawContent = getFirstPresentValue([
    record.json,
    record.richText,
    record.markdown,
    record.html,
    record.content,
    record.text,
    record.value,
  ]);

  const content = normalizeBodyToMarkdown(rawContent);

  const body = [content, rows, children].filter(Boolean).join("\n\n").trim();

  if (!name) return body;

  if (!body) return `### ${name}`;

  return [`### ${name}`, body].join("\n\n");
}

function renderPotentialRowsValue(
  value: unknown,
  entity: Record<string, unknown>,
): string {
  const rows = normalizeRows(value);

  if (rows.length === 0) return "";

  const tableRows: string[][] = rows
    .map((row) => {
      const label = getRowLabel(row);
      const rowValue = getAtlasRowValue(row, entity);

      if (!label || isEmptyExportValue(rowValue)) return null;

      const formatted = formatExportValue(rowValue);

      if (!formatted) return null;

      return [label, formatted];
    })
    .filter((row): row is string[] => Array.isArray(row));

  if (tableRows.length === 0) return "";

  return markdownTable(["Field", "Value"], tableRows);
}

function renderPotentialListValue(
  value: unknown,
  entity: Record<string, unknown>,
): string {
  if (!Array.isArray(value)) return "";

  const items = value
    .map((item) => formatAtlasListItem(item, entity))
    .filter(Boolean);

  if (items.length === 0) return "";

  return markdownList(items);
}

function formatAtlasListItem(
  value: unknown,
  entity: Record<string, unknown>,
): string {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatAtlasListItem(item, entity))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    const direct =
      readString(record, "name") ||
      readString(record, "Name") ||
      readString(record, "nameFull") ||
      readString(record, "title") ||
      readString(record, "label") ||
      readString(record, "text");

    if (direct) return direct;

    if (typeof record.path === "string") {
      return formatExportValue(readPath(entity, record.path));
    }

    if (typeof record.entityPath === "string") {
      return formatExportValue(readPath(entity, record.entityPath));
    }

    return formatExportObject(record);
  }

  return String(value);
}

function renderUnknownAtlasValue(
  value: unknown,
  entity: Record<string, unknown>,
  options?: {
    skipKeys?: Set<string>;
  },
): string {
  if (isEmptyExportValue(value)) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return normalizeBodyToMarkdown(value);
  }

  if (Array.isArray(value)) {
    const items = value
      .map((item) => renderUnknownAtlasValue(item, entity, options))
      .filter(Boolean);

    if (items.length === 0) return "";

    return markdownList(items);
  }

  if (typeof value !== "object") return "";

  const record = value as Record<string, unknown>;

  const richText = normalizeBodyToMarkdown(
    getFirstPresentValue([
      record.json,
      record.richText,
      record.markdown,
      record.html,
      record.content,
      record.text,
      record.value,
    ]),
  );

  if (richText) return richText;

  const rows = renderPotentialRowsValue(
    getFirstPresentValue([
      record.rows,
      record.fields,
      record.details,
    ]),
    entity,
  );

  if (rows) return rows;

  const groups = getFirstPresentValue([
    record.groups,
    record.sections,
  ]);

  if (Array.isArray(groups)) {
    const renderedGroups = groups
      .map((group) => renderAtlasGroup(group, entity))
      .filter(Boolean);

    if (renderedGroups.length > 0) {
      return renderedGroups.join("\n\n");
    }
  }

  const children = renderPotentialListValue(
    getFirstPresentValue([
      record.children,
      record.items,
      record.values,
      record.options,
    ]),
    entity,
  );

  if (children) return children;

  const entries = Object.entries(record)
    .filter(([key, entryValue]) => {
      if (options?.skipKeys?.has(key)) return false;
      if (isAtlasMetadataKey(key)) return false;
      return !isEmptyExportValue(entryValue);
    })
    .map(([key, entryValue]) => {
      const rendered = renderUnknownAtlasValue(entryValue, entity, options);

      if (!rendered) return "";

      return `**${formatObjectKey(key)}:** ${rendered}`;
    })
    .filter(Boolean);

  return entries.join("\n");
}

function isAtlasMetadataKey(key: string): boolean {
  return [
    "id",
    "_id",
    "kind",
    "type",
    "dataMode",
    "binding",
    "editor",
    "props",
    "wrapper",
    "className",
    "gridSpan",
    "variant",
    "removable",
    "reorderable",
    "editable",
    "collapsed",
  ].includes(key);
}

function renderBoundValueToMarkdown({
  label,
  value,
}: {
  label?: string;
  value: unknown;
}): string {
  if (isEmptyExportValue(value)) return "";

  const formatted = formatExportValue(value);

  if (!formatted) return "";

  const safeLabel = label?.trim();

  if (!safeLabel) return formatted;

  if (formatted.includes("\n")) {
    return [`**${safeLabel}:**`, formatted].join("\n\n");
  }

  return `**${safeLabel}:** ${formatted}`;
}

function isEmptyExportValue(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;

  return false;
}

function formatExportValue(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "string") {
    return normalizeBodyToMarkdown(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const items = value
      .map(formatExportListItem)
      .map((item) => item.trim())
      .filter(Boolean);

    return markdownList(items);
  }

  if (typeof value === "object") {
    return formatExportObject(value as Record<string, unknown>);
  }

  return String(value);
}

function formatExportListItem(value: unknown): string {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    return formatExportObject(value as Record<string, unknown>);
  }

  return "";
}

function formatExportObject(value: Record<string, unknown>): string {
  const preferred =
    readString(value, "name") ||
    readString(value, "Name") ||
    readString(value, "nameFull") ||
    readString(value, "title") ||
    readString(value, "label");

  if (preferred) return preferred;

  const entries = Object.entries(value)
    .filter(([, entryValue]) => !isEmptyExportValue(entryValue))
    .slice(0, 6)
    .map(
      ([key, entryValue]) =>
        `${formatObjectKey(key)}: ${formatSimpleValue(entryValue)}`,
    )
    .filter(Boolean);

  return entries.join(", ");
}

function formatSimpleValue(value: unknown): string {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatExportListItem).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    return (
      readString(value as Record<string, unknown>, "name") ||
      readString(value as Record<string, unknown>, "Name") ||
      readString(value as Record<string, unknown>, "title") ||
      "[object]"
    );
  }

  return String(value);
}

function formatObjectKey(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeBodyToMarkdown(value: unknown): string {
  if (typeof value === "string") {
    return normalizeStringBodyToMarkdown(value);
  }

  if (isRichTextDoc(value)) {
    return renderRichTextJsonToMarkdown(value);
  }

  return "";
}

function normalizeStringBodyToMarkdown(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) return "";

  const parsedJson = tryParseRichTextJson(trimmed);

  if (parsedJson) {
    return renderRichTextJsonToMarkdown(parsedJson);
  }

  if (looksLikeHtml(trimmed)) {
    return htmlToMarkdown(trimmed);
  }

  return trimmed;
}

function tryParseRichTextJson(value: string): unknown | null {
  if (!value.startsWith("{") && !value.startsWith("[")) return null;

  try {
    const parsed = JSON.parse(value);

    if (!parsed || typeof parsed !== "object") return null;

    return parsed;
  } catch {
    return null;
  }
}

function looksLikeHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function htmlToMarkdown(html: string): string {
  if (typeof DOMParser === "undefined") {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<[^>]+>/g, "")
      .trim();
  }

  const document = new DOMParser().parseFromString(html, "text/html");

  return renderDomChildrenToMarkdown(document.body).trim();
}

function renderDomChildrenToMarkdown(parent: ParentNode): string {
  return Array.from(parent.childNodes)
    .map((node) => renderDomNodeToMarkdown(node))
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderDomNodeToMarkdown(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();
  const inner = renderDomChildrenToMarkdown(element);

  switch (tagName) {
    case "h1":
      return `${markdownHeading(1, inner)}\n\n`;
    case "h2":
      return `${markdownHeading(2, inner)}\n\n`;
    case "h3":
      return `${markdownHeading(3, inner)}\n\n`;
    case "h4":
      return `${markdownHeading(4, inner)}\n\n`;
    case "h5":
      return `${markdownHeading(5, inner)}\n\n`;
    case "h6":
      return `${markdownHeading(6, inner)}\n\n`;

    case "p":
    case "div":
      return inner ? `${inner}\n\n` : "";

    case "br":
      return "\n";

    case "strong":
    case "b":
      return inner ? `**${inner}**` : "";

    case "em":
    case "i":
      return inner ? `_${inner}_` : "";

    case "ul":
      return renderListElement(element, false);

    case "ol":
      return renderListElement(element, true);

    case "li":
      return inner;

    case "a": {
      const href = element.getAttribute("href");
      if (!href) return inner;
      return `[${inner || href}](${href})`;
    }

    default:
      return inner;
  }
}

function renderListElement(element: Element, ordered: boolean): string {
  const items = Array.from(element.children).filter(
    (child) => child.tagName.toLowerCase() === "li",
  );

  const lines = items.map((item, index) => {
    const text = renderDomChildrenToMarkdown(item).replace(/\n+/g, " ").trim();

    return ordered ? `${index + 1}. ${text}` : `- ${text}`;
  });

  return `${lines.join("\n")}\n\n`;
}

function isAtlasContent(value: unknown): value is AtlasExportContent {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as AtlasExportContent).sections)
  );
}

function isRichTextDoc(value: unknown): boolean {
  return !!value && typeof value === "object";
}

function renderRichTextJsonToMarkdown(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .map((node) => renderRichTextNodeToMarkdown(node))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }

  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  const nodes = Array.isArray(record.content)
    ? record.content
    : Array.isArray(record.children)
      ? record.children
      : [];

  return nodes
    .map((node) => renderRichTextNodeToMarkdown(node))
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function renderRichTextNodeToMarkdown(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const node = value as Record<string, unknown>;
  const type = String(node.type ?? node.kind ?? "");
  const text = typeof node.text === "string" ? node.text : "";
  const children = Array.isArray(node.content)
    ? node.content
    : Array.isArray(node.children)
      ? node.children
      : [];

  if (text) return applyRichTextMarks(text, node.marks);

  const renderedChildren = children
    .map((child) => renderRichTextNodeToMarkdown(child))
    .filter(Boolean)
    .join("");

  switch (type) {
    case "heading":
    case "header": {
      const level = getRichTextHeadingLevel(node);

      return markdownHeading(level, renderedChildren);
    }

    case "paragraph":
      return renderedChildren;

    case "bulletList":
    case "bullet_list":
      return children
        .map((child) => `- ${renderRichTextNodeToMarkdown(child)}`)
        .join("\n");

    case "orderedList":
    case "ordered_list":
      return children
        .map(
          (child, index) =>
            `${index + 1}. ${renderRichTextNodeToMarkdown(child)}`,
        )
        .join("\n");

    case "listItem":
    case "list_item":
      return renderedChildren;

    case "hardBreak":
    case "hard_break":
      return "\n";

    default:
      return renderedChildren;
  }
}

function getRichTextHeadingLevel(node: Record<string, unknown>): number {
  if (typeof node.level === "number") return node.level;

  if (
    typeof node.attrs === "object" &&
    node.attrs &&
    typeof (node.attrs as Record<string, unknown>).level === "number"
  ) {
    return (node.attrs as Record<string, unknown>).level as number;
  }

  return 2;
}

function applyRichTextMarks(text: string, marks: unknown): string {
  if (!Array.isArray(marks) || marks.length === 0) return text;

  return marks.reduce((current, mark) => {
    if (!mark || typeof mark !== "object") return current;

    const markType = String((mark as Record<string, unknown>).type ?? "");

    switch (markType) {
      case "bold":
      case "strong":
        return `**${current}**`;
      case "italic":
      case "em":
        return `_${current}_`;
      case "code":
        return `\`${current}\``;
      case "strike":
      case "strikeThrough":
        return `~~${current}~~`;
      case "link": {
        const attrs = (mark as Record<string, unknown>).attrs;
        const href =
          typeof attrs === "object" && attrs
            ? String((attrs as Record<string, unknown>).href ?? "")
            : "";

        return href ? `[${current}](${href})` : current;
      }
      default:
        return current;
    }
  }, text);
}

function normalizeText(value: string): string {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function renderUnhandledAtlasSectionsToMarkdown({
  entity,
  sourceType,
  data,
  handledSectionLabels,
  handledSectionClassNames = [],
  headingLevel = 2,
}: {
  entity: Record<string, unknown>;
  sourceType: ExportSourceType;
  data?: {
    Notes?: unknown[];
  };
  handledSectionLabels: string[];
  handledSectionClassNames?: string[];
  headingLevel?: number;
}): string {
  const content = entity.content;

  if (!isAtlasContent(content)) return "";

  const handledLabels = new Set(handledSectionLabels.map(normalizeText));
  const handledClasses = handledSectionClassNames.map(normalizeText);

  const renderedSections = (content.sections ?? [])
    .filter((section) => {
      const label = normalizeText(section.label ?? section.title ?? "");
      const className = normalizeText(
        [
          section.className,
          section.wrapper?.className,
        ]
          .filter(Boolean)
          .join(" "),
      );

      if (!label && !className) return false;

      if (handledLabels.has(label)) return false;

      if (
        handledClasses.some(
          (handledClass) =>
            handledClass &&
            (className === handledClass ||
              className.includes(handledClass)),
        )
      ) {
        return false;
      }

      if (isAlwaysSkippedAtlasSection(label, className)) return false;

      return true;
    })
    .map((section) =>
      renderAtlasSectionToMarkdown({
        section,
        entity,
        sourceType,
        data,
        headingLevel,
      }),
    )
    .filter(Boolean);

  return renderedSections.join("\n\n").trim();
}

function isAlwaysSkippedAtlasSection(label: string, className: string): boolean {
  return (
    label === "header" ||
    label === "tags" ||
    className.includes("header") ||
    className.includes("tags")
  );
}
