import { resolveHistoryEra } from "../../HistoryGenerator/eras/model";
import { getNPCRelationshipLabel } from "../../NPC/relationships/registry";
import { parseDocument } from "htmlparser2";
import type { AtlasBlock, AtlasRenderContext, AtlasSection } from "../../../definitions/Atlas";
import { getNPCExportPortraitPath } from "../../NPC/portraits/export";
import { getBotiExportPath } from "../BotiUtils";
import { getBotiSectionCalloutType } from "../templateUtils";
import type { TLNPC, TLCity } from "../../../definitions/TerraLogger";
import { isAtlasContent as validateAtlasContent } from "../../atlas/core/validators";
import { cityBiome, countryBiomeComposition } from "../../atlas/core/geography";
import { detailsRowResolvers } from "../../atlas/render/detailsRowResolvers";
import { resolveGenericDescription } from "../../atlas/render/descriptionResolver";
import { renderEconomySection } from "./economyMarkdown";
import { renderDevelopmentalEraDates, renderEraEvents, renderEraTimeline } from "./eraMarkdown";
import type { ExportContext, ExportSourceType } from "./exportTypes";
import {
  formatTradeEntry,
  isEconomyTradePath,
  normalizeTradeEntries,
  resolveTradeGood,
} from "../../Util/economy";
import type { TLMapEconomy } from "../../../definitions/TerraLogger";
import {
  exportDocumentLink,
  exportIcon,
  renderReligionCenter,
  singleLineText,
  normalizeExportTags,
  markdownFieldValues,
  markdownSplitLists,
  markdownHeading,
  markdownList,
  markdownTable,
  readPath,
  readString,
} from "./markdownUtils";

type AtlasExportData = {
  Notes?: unknown[];
  MapInfo?: { economy?: TLMapEconomy };
};

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
  data?: AtlasExportData;
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
  data?: AtlasExportData;
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

  const renderedBlocks = (bodySection.blocks ?? []).flatMap((block) => {
    const rendered = renderNoteBodyBlock(block, entity);
    return rendered ? [rendered] : [];
  });

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

  const renderedBlocks = (editorNotesSection.blocks ?? []).flatMap((block) => {
    const rendered = renderEditorNotesBlock(block, entity);
    return rendered ? [rendered] : [];
  });

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
  data?: AtlasExportData;
  headingLevel: number;
}): string {
  const economy = entity.economy;
  if ((sourceType === "city" || sourceType === "country") &&
    economy && typeof economy === "object" && !Array.isArray(economy)) {
    const source = economy as Record<string, unknown>;
    const goods = data?.MapInfo?.economy?.goods;

    // Format a copy so every bound export path sees the same catalog labels.
    // Stored references and the caller's entity remain unchanged.
    entity = {
      ...entity,
      economy: {
        ...source,
        imports: normalizeTradeEntries(source.imports).map((entry) =>
          formatTradeEntry(entry, resolveTradeGood(entry, goods))),
        exports: normalizeTradeEntries(source.exports).map((entry) =>
          formatTradeEntry(entry, resolveTradeGood(entry, goods))),
      },
    };
  }

  const title = section.label?.trim() || section.title?.trim() || "";
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];

  const renderedBlocks = blocks.flatMap((block) => {
    const rendered = renderGenericAtlasBlockToMarkdown({
      block,
      entity,
      sourceType,
      data,
    });

    return rendered ? [rendered] : [];
  });

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
  data?: AtlasExportData;
}): string {
  if (sourceType === "developmentalEra" &&
    (block.binding?.resolver === "developmentalEra.header" || block.binding?.resolver === "developmentalEra.placements")) return "";

  if (sourceType === "era" &&
    (block.binding?.resolver === "era.header" || block.binding?.resolver === "era.chronology" ||
      block.binding?.resolver === "era.events")) return "";

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

  const renderedGroups = rawGroups.flatMap((group) => {
    const rendered = renderAtlasGroup(group, entity);
    return rendered ? [rendered] : [];
  });

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

  const value = readAtlasEntityValue(entity, path);

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
  data?: AtlasExportData,
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

  if (sourceType === "era") return normalizeBodyToMarkdown(directDescription);

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

function readAtlasEntityValue(
  entity: Record<string, unknown>,
  path: string,
): unknown {
  const value = readPath(entity, path);
  return isEconomyTradePath(path)
    ? normalizeTradeEntries(value).map((entry) => formatTradeEntry(entry))
    : value;
}

function getAtlasRowValue(
  row: Record<string, unknown>,
  entity: Record<string, unknown>,
): unknown {
  const valueMode = String(row.valueMode ?? "");

  if (valueMode === "entity" && typeof row.value === "string") {
    return readAtlasEntityValue(entity, row.value);
  }

  if (valueMode === "static") {
    return row.value;
  }

  if (typeof row.path === "string") {
    return readAtlasEntityValue(entity, row.path);
  }

  if (typeof row.entityPath === "string") {
    return readAtlasEntityValue(entity, row.entityPath);
  }

  if (typeof row.valuePath === "string") {
    return readAtlasEntityValue(entity, row.valuePath);
  }

  if (typeof row.value === "string" && valueMode === "path") {
    return readAtlasEntityValue(entity, row.value);
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

  const rawChildren = typeof record.entityPath === "string" &&
    isEconomyTradePath(record.entityPath)
    ? readAtlasEntityValue(entity, record.entityPath)
    : getFirstPresentValue([
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

  const items = value.flatMap((item) => {
    const formatted = formatAtlasListItem(item, entity);
    return formatted ? [formatted] : [];
  });

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
      .flatMap((item) => {
        const formatted = formatAtlasListItem(item, entity);
        return formatted ? [formatted] : [];
      })
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
      return formatExportValue(readAtlasEntityValue(entity, record.path));
    }

    if (typeof record.entityPath === "string") {
      return formatExportValue(readAtlasEntityValue(entity, record.entityPath));
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
    const items = value.flatMap((item) => {
      const rendered = renderUnknownAtlasValue(item, entity, options);
      return rendered ? [rendered] : [];
    });

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
    const renderedGroups = groups.flatMap((group) => {
      const rendered = renderAtlasGroup(group, entity);
      return rendered ? [rendered] : [];
    });

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

  const entries: string[] = [];

  for (const [key, entryValue] of Object.entries(record)) {
    if (options?.skipKeys?.has(key)) continue;
    if (isAtlasMetadataKey(key)) continue;
    if (isEmptyExportValue(entryValue)) continue;

    const rendered = renderUnknownAtlasValue(entryValue, entity, options);
    if (!rendered) continue;

    entries.push(`**${formatObjectKey(key)}:** ${rendered}`);
  }

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
    const items: string[] = [];

    for (const itemValue of value) {
      const item = formatExportListItem(itemValue).trim();
      if (item) items.push(item);
    }

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
    .map(([key, entryValue]) =>
      `${formatObjectKey(key)}: ${formatSimpleValue(entryValue)}`,
    );

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
    return value
      .flatMap((item) => {
        const formatted = formatExportListItem(item);
        return formatted ? [formatted] : [];
      })
      .join(", ");
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

type ExportHtmlNode = ReturnType<typeof parseDocument>["children"][number];
type ExportHtmlElement = Extract<ExportHtmlNode, { attribs: Record<string, string> }>;

function htmlToMarkdown(html: string): string {
  // Use the same parser in the archive worker and browser; workers have no DOMParser.
  return renderHtmlChildrenToMarkdown(parseDocument(html).children)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderHtmlChildrenToMarkdown(children: ExportHtmlNode[]): string {
  // Preserve whitespace between inline siblings; trim only at block boundaries.
  return children.map(renderHtmlNodeToMarkdown).join("");
}

function wrapHtmlInline(text: string, opening: string, closing = opening): string {
  return text.replace(/^(\s*)([\s\S]*?)(\s*)$/, (_match, leading: string, body: string, trailing: string) =>
    body ? `${leading}${opening}${body}${closing}${trailing}` : text);
}

function renderHtmlNodeToMarkdown(node: ExportHtmlNode): string {
  if (node.type === "text") return node.data.replace(/\u00a0/g, " ");
  if (!("attribs" in node)) return "";

  const tagName = node.name.toLowerCase();
  if (["script", "style", "template"].includes(tagName)) return "";
  const inner = renderHtmlChildrenToMarkdown(node.children);

  switch (tagName) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return `${markdownHeading(Number(tagName[1]), inner)}\n\n`;

    case "p":
    case "div":
      return inner.trim() ? `${inner.trim()}\n\n` : "";

    case "br":
      return "\n";

    case "strong":
    case "b":
      return wrapHtmlInline(inner, "**");

    case "em":
    case "i":
      return wrapHtmlInline(inner, "_");

    case "ul":
      return renderHtmlList(node, false);

    case "ol":
      if ((node.attribs.class ?? "").split(/\s+/).includes("journey-segments")) {
        return `${node.children
          .filter((child): child is ExportHtmlElement => "attribs" in child && child.name === "li")
          .map((child) => renderHtmlChildrenToMarkdown(child.children).trim())
          .join("\n\n")}\n\n`;
      }
      return renderHtmlList(node, true);

    case "summary":
      return inner.trim() ? `**${inner.trim()}**\n\n` : "";

    case "details":
      return inner.trim() ? `${inner.trim()}\n\n` : "";

    case "span":
      return (node.attribs.class ?? "").split(/\s+/).includes("journey-segment-number")
        ? `**${inner.trim()}**\n\n` : inner;

    case "a": {
      const href = node.attribs.href?.trim();
      if (!href || /^(?:javascript|vbscript|data):/i.test(href.replace(/\s/g, ""))) return inner;
      const target = href.replace(/ /g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
      return wrapHtmlInline(inner || href, "[", `](${target})`);
    }

    default:
      return inner;
  }
}

function renderHtmlList(element: ExportHtmlElement, ordered: boolean): string {
  const items = element.children.filter(
    (child): child is ExportHtmlElement => "attribs" in child && child.name === "li",
  );
  const start = Number(element.attribs.start ?? 1);
  const first = Number.isSafeInteger(start) && start >= 1 ? start : 1;
  const lines = items.map((item, index) => {
    const text = renderHtmlChildrenToMarkdown(item.children).trim();
    const prefix = ordered ? `${first + index}. ` : "- ";
    return text.split("\n").map((line, lineIndex) =>
      lineIndex === 0 ? prefix + line : line ? " ".repeat(prefix.length) + line : "").join("\n");
  });

  return `\n${lines.join("\n")}\n\n`;
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
      .flatMap((node) => {
        const rendered = renderRichTextNodeToMarkdown(node);
        return rendered ? [rendered] : [];
      })
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
    .flatMap((node) => {
      const rendered = renderRichTextNodeToMarkdown(node);
      return rendered ? [rendered] : [];
    })
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
    .flatMap((child) => {
      const rendered = renderRichTextNodeToMarkdown(child);
      return rendered ? [rendered] : [];
    })
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
      case "underline":
        return `<u>${current}</u>`;
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
  data?: AtlasExportData;
  handledSectionLabels: string[];
  handledSectionClassNames?: string[];
  headingLevel?: number;
}): string {
  const content = entity.content;

  if (!isAtlasContent(content)) return "";

  const handledLabels = new Set(handledSectionLabels.map(normalizeText));
  const handledClasses = handledSectionClassNames.map(normalizeText);

  const renderedSections: string[] = [];

  for (const section of content.sections ?? []) {
    const label = normalizeText(section.label ?? section.title ?? "");
    const className = normalizeText(
      [section.className, section.wrapper?.className].filter(Boolean).join(" "),
    );

    if (!label && !className) continue;
    if (handledLabels.has(label)) continue;

    const handledClassMatch = handledClasses.some(
      (handledClass) =>
        handledClass &&
        (className === handledClass || className.includes(handledClass)),
    );
    if (handledClassMatch) continue;
    if (isAlwaysSkippedAtlasSection(label, className)) continue;

    const rendered = renderAtlasSectionToMarkdown({
      section,
      entity,
      sourceType,
      data,
      headingLevel,
    });
    if (rendered) renderedSections.push(rendered);
  }

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

/** Null means no saved document. An empty saved document remains empty. */
export function renderSavedAtlasContent(context: ExportContext): string | null {
  if (context.sourceType === "map" || context.entity.content == null) return null;
  const content = context.entity.content;
  if (!validateAtlasContent(content)) {
    throw new Error(`Cannot export invalid Atlas content for ${context.sourceType} ${context.entity._id}`);
  }
  const renderContext: AtlasRenderContext = {
    sourceType: context.sourceType,
    entity: context.entity as unknown as AtlasRenderContext["entity"],
    related: {
      cities: context.data.Cities, countries: context.data.Countries,
      cultures: context.data.Cultures, religions: context.data.Religions,
      notes: context.data.Notes, npcs: context.data.NPCs,
      eras: context.data.Eras, developmentalEras: context.data.DevelopmentalEras,
    },
    economy: context.data.MapInfo.economy,
    mapGeography: context.data.MapInfo,
  };
  return content.sections.filter((section) => context.templateId !== "boti" || !isInfoboxSection(section)).map((section) => {
    const body = section.blocks.map((block) => {
      try {
        return renderSavedAtlasBlock(block, { ...renderContext, section }, context);
      } catch (error) {
        throw Object.assign(new Error(
          `Atlas export failed for ${context.sourceType} ${context.entity._id}, section ${section.title} (${section.id}), block ${block.type} (${block.id}).`),
          { cause: error },
        );
      }
    }).filter(Boolean).join("\n\n");
    if (context.templateId === "default") {
      return [markdownHeading(2, section.title), body].filter(Boolean).join("\n\n");
    }
    return renderBotiSectionCallout(section.title, body, section.wrapper.className ?? "", context.sourceType);
  }).join("\n\n");
}

function atlasExportRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}

export function renderExportTagTable(value: unknown, boti = false): string {
  if (!Array.isArray(value)) return "";
  return markdownTable([...(boti ? [""] : []), "Name", "Type", "Default", "Description"], value.map((item) => {
    const tag = atlasExportRecord(item);
    const type = String(tag.Type ?? tag.type ?? "").replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ").trim();
    const isDefault = tag.Default ?? tag.default;
    return [
      ...(boti ? [normalizeExportTags([item]).map((name) => `#${name.toLocaleLowerCase()}`).join(" ")] : []),
      typeof item === "string" ? item : String(tag.Name ?? tag.name ?? ""),
      type,
      typeof isDefault === "boolean" ? isDefault ? "Yes" : "No" : "",
      normalizeBodyToMarkdown(tag.Description ?? tag.description),
    ];
  }));
}

function atlasExportValue(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value)
    ? value.toLocaleString("en-US", { maximumFractionDigits: 20 }) : "";
  if (Array.isArray(value)) return value.map(atlasExportValue).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const record = atlasExportRecord(value);
    const name = record.fullName ?? record.nameFull ?? record.name ?? record.Name;
    if (name !== undefined) return String(name);
    return Object.entries(record).map(([key, entry]) =>
      `${key}: ${atlasExportValue(entry)}`).join("; ");
  }
  return normalizeBodyToMarkdown(String(value));
}

function renderSavedAtlasBlock(
  block: AtlasBlock,
  renderContext: AtlasRenderContext,
  context: ExportContext,
): string {
  const { entity, data } = context;
  const props = block.props;
  const bound = () => {
    const path = block.binding?.entityPath;
    if (!path) return undefined;
    const value = readPath(entity, path);
    if (context.sourceType === "npc" && ["ancestry", "profession", "currentLocation"].includes(path.split(".")[0])) {
      return renderNPCReferenceField(context, path);
    }
    return isEconomyTradePath(path) ? normalizeTradeEntries(value).map((entry) =>
      ["goodId" in entry.good ? exportIcon(context, `good:${entry.good.goodId}`, resolveTradeGood(entry, data.MapInfo.economy?.goods)?.name ?? "Good") : "",
        formatTradeEntry(entry, resolveTradeGood(entry, data.MapInfo.economy?.goods))].filter(Boolean).join(" ")) : value;
  };
  const list = (value: unknown) => Array.isArray(value)
    ? markdownList(value.map(atlasExportValue)) : atlasExportValue(value);
  const rows = (values: Array<[string, unknown]>) =>
    markdownFieldValues(values.map(([label, value]) => [label, atlasExportValue(value)]));
  switch (block.type) {
    case "heading":
      return markdownHeading(Number(props.level ?? 3), String(props.text ?? ""));
    case "richText":
      return normalizeBodyToMarkdown(block.dataMode === "entity" ? bound() : props.json);
    case "description":
      return normalizeBodyToMarkdown(resolveGenericDescription(renderContext).value);
    case "detailsList": {
      const detailRows = (Array.isArray(props.rows) ? props.rows : []).flatMap((raw) => {
        const row = atlasExportRecord(raw);
        let value = row.value;
        if (row.valueMode === "entity") {
          value = context.sourceType === "npc" && ["ancestry", "profession", "currentLocation"].includes(String(row.value ?? "").split(".")[0])
            ? renderNPCReferenceField(context, String(row.value ?? ""))
            : readPath(entity, String(row.value ?? ""));
          if (row.value === "deity" && typeof value === "string") value = singleLineText(value);
        }
        else if (row.valueMode === "computed" || (value === undefined && row.fallbackResolver)) {
          const resolverName = String(row.resolver ?? row.fallbackResolver ?? "");
          const resolver = detailsRowResolvers[resolverName];
          if (!resolver) throw new Error(`Unsupported details resolver: ${resolverName}`);
          value = resolver(renderContext, atlasExportRecord(row.args));
        }
        const text = atlasExportValue(value);
        if (row.hideWhenEmpty && !text.trim()) return [];
        if (row.hideWhenEqualTo !== undefined &&
          text.trim().toLocaleLowerCase() === String(row.hideWhenEqualTo).trim().toLocaleLowerCase()) return [];
        return [[String(row.label ?? ""), text || String(row.emptyText ?? "")]];
      });
      if (context.templateId === "default") return markdownFieldValues(detailRows as Array<[string, unknown]>);
      if (/\bprofile\b/i.test(renderContext.section?.wrapper.className ?? "")) {
        return markdownTable(["", ""], detailRows.map(([label, value]) => [`**${label}**`, value]));
      }
      return markdownFieldValues(detailRows as Array<[string, unknown]>);
    }
    case "entityField":
      return atlasExportValue(bound());
    case "chipList":
      return list(props.chips);
    case "entityChipList":
      return block.binding?.entityPath === "tags" ? renderExportTagTable(bound(), context.templateId === "boti") : list(bound());
    case "largeTags":
      return renderExportTagTable(entity.tags, context.templateId === "boti");
    case "splitList": {
      const rawGroups = block.binding?.entityPath ? bound() : props.groups;
      const sourceGroups = Array.isArray(rawGroups) ? rawGroups : [];
      const columns = context.templateId === "boti" && (context.sourceType === "city" || context.sourceType === "country") &&
        sourceGroups.length === 2 && sourceGroups.every((raw) => {
          const group = atlasExportRecord(raw);
          const path = group.entityPath ?? group.path ?? group.childrenPath;
          return typeof path === "string" && isEconomyTradePath(path);
        });
      const groups = sourceGroups.map((raw) => {
        const group = atlasExportRecord(raw);
        const candidate = group.entityPath ?? group.path ?? group.childrenPath;
        const path = typeof candidate === "string" ? candidate : undefined;
        const value = path ? readPath(entity, path) : group.children;
        const items = path && isEconomyTradePath(path)
          ? normalizeTradeEntries(value).map((entry) =>
            ["goodId" in entry.good ? exportIcon(context, `good:${entry.good.goodId}`, resolveTradeGood(entry, data.MapInfo.economy?.goods)?.name ?? "Good") : "",
              formatTradeEntry(entry, resolveTradeGood(entry, data.MapInfo.economy?.goods))].filter(Boolean).join(" "))
          : value;
        return { label: String(group.label ?? group.name ?? ""),
          body: list(items) || String(group.emptyText ?? "") };
      });
      return markdownSplitLists(groups, columns);
    }
    case "noteLegend":
      return normalizeBodyToMarkdown(entity.legend);
    case "populationBlock":
    case "religionMembership": {
      const members = atlasExportRecord(entity.members);
      return rows([
        ["Urban", entity.urbanPop ?? members.urban ?? 0],
        ["Rural", entity.ruralPop ?? members.rural ?? 0],
      ]);
    }
    case "cityMapLink": {
      const href = readString(entity, "mapLink");
      return href ? `[${String(props.text ?? "View Map")}](${href.replace(/\s/g, "%20")})` : "";
    }
    case "economySummary":
      return renderEconomySection(context, { summaryOnly: true, section: renderContext.section });
    case "geographySummary":
      if (context.sourceType === "city") {
        const biome = cityBiome(entity as unknown as TLCity, data.MapInfo);
        return biome?.name ?? "Biome unavailable.";
      }
      return markdownTable(["Biome", "Land cells", "Coverage"],
        countryBiomeComposition(Number(entity.id), data.MapInfo).map((entry) => [
          entry.biome?.name ?? `Unknown biome #${entry.id}`,
          String(entry.count), `${entry.percent.toFixed(2)}%`,
        ]));
    case "relatedNPCList": {
      const roles = Array.isArray(props.roleTitles) ? props.roleTitles.map(String) : [];
      const types = Array.isArray(props.relationshipTypes) ? props.relationshipTypes.map(String) : [];
      return markdownList(data.NPCs.flatMap((npc) => {
        const matches = npc.relationships.filter((relationship) =>
          relationship.relatedEntityType === context.sourceType &&
          relationship.relatedEntityId === entity._id &&
          (!roles.length || roles.includes(relationship.roleTitle ?? "")) &&
          (!types.length || types.includes(relationship.relationshipType)));
        return matches.length ? [exportDocumentLink(context, "npc", npc._id, npc.fullName || npc.name) + matches.map((match) =>
          match.roleTitle ? ` — ${match.roleTitle}` : "").join("")] : [];
      }));
    }
    case "cultureOrigins": {
      const origins = Array.isArray(entity.origins) ? entity.origins : [];
      return rows([
        ["Cultural origins", data.Cultures.filter((culture) => origins.includes(culture.id)).map((culture) => culture.name)],
        ["Base culture", data.Cultures.find((culture) => culture.id === entity.base)?.name ?? "No base culture found"],
      ]);
    }
    case "countryDiplomacy": {
      const political = atlasExportRecord(entity.political);
      return markdownTable(["Country", "Relationship"],
        (Array.isArray(political.diplomacy) ? political.diplomacy : []).flatMap((raw) => {
          const relation = atlasExportRecord(raw);
          const country = data.Countries.find((item) => item.id === relation.id);
          return country && relation.status !== "-" && relation.status !== "x"
            ? [[country.name, String(relation.status ?? "")]] : [];
        }));
    }
    case "countryMilitary": {
      const political = atlasExportRecord(entity.political);
      return markdownTable(["Icon", "Unit", "Strength", "Composition"],
        (Array.isArray(political.military) ? political.military : []).map((raw) => {
          const unit = atlasExportRecord(raw);
          return [exportIcon(context, String(unit.icon ?? ""), String(unit.name ?? "Unit")), String(unit.name ?? ""), String(unit.a ?? ""),
            atlasExportValue(unit.u)];
        }));
    }
    case "current-location": {
      const location = atlasExportRecord(entity.currentLocation);
      const city = data.Cities.find((item) => item._id === location.id);
      return exportDocumentLink(context, "city", location.id, city?.name ?? String(location.name ?? ""));
    }
    case "relationship-list":
    case "relationship-graph":
      return renderNPCRelationships(context);
    case "history-timeline":
      return renderNPCHistory(context);
    case "eraTimeline":
      return renderEraEvents(context);
    case "eraChronology":
      return [rows([
        ["Era years", `${String(entity.firstYear)}–${String(entity.finalYear)} ${String(entity.shortName ?? "")}`],
        ["Duration", `${String(entity.length)} years`],
      ]), renderEraTimeline(context)].filter(Boolean).join("\n\n");
    case "developmentalEraPlacements":
      return renderDevelopmentalEraDates(context);
    case "cityHeader":
      return rows([
        ["Country", atlasExportRecord(entity.country).id === 0 ? "A neutral city" : atlasExportRecord(entity.country).name],
        ...(atlasExportRecord(entity.country).id === 0
          ? [["Local government", atlasExportRecord(entity.government).formName] as [string, unknown]] : []),
        ["Population", entity.population], ["Size", entity.size], ["Capital", entity.capital ? "Yes" : "No"],
      ]);
    case "countryHeader":
      return rows([
        ["Government", atlasExportRecord(entity.political).formName],
        ["Population", atlasExportRecord(entity.population).total],
        ["Urban population", atlasExportRecord(entity.population).urban],
        ["Rural population", atlasExportRecord(entity.population).rural],
      ]);
    case "cultureHeader":
      return rows([["Type", entity.type], ["Code", entity.code]]);
    case "religionHeader":
      return rows([["Type", entity.type], ["Form", entity.form], ["Code", entity.code],
        ["Primary deity", singleLineText(entity.deity)], ["Centre", renderReligionCenter(context)]]);
    case "eraHeader":
      return rows([["Short name", entity.shortName], ["Status", entity.status === "current" ? "Current" : "Previous Era"]]);
    case "developmentalEraHeader":
      return rows([["Development threshold", entity.level],
        ["Status", entity.active && Array.isArray(entity.placements) && entity.placements.length ? "Active" : "Inactive"]]);
    case "noteHeader":
      return "";
    default:
      throw new Error(`Unsupported Atlas block type: ${block.type}`);
  }
}

export function renderNPCReferenceField(context: ExportContext, path: string): string {
  const field = path.split(".")[0];
  if (!["ancestry", "profession", "currentLocation"].includes(field)) {
    return atlasExportValue(readPath(context.entity, path));
  }
  const reference = atlasExportRecord(context.entity[field]);
  const name = String(reference.name ?? "");
  if (!name) return "";
  if (field === "currentLocation") {
    const city = context.data.Cities.find((item) => item._id === reference.id);
    return exportDocumentLink(context, "city", reference.id, city?.name ?? name);
  }
  const id = String(reference.id ?? "").trim() || `name:${name.trim()}`;
  return exportDocumentLink(context, field === "ancestry" ? "race" : "occupation", id, name);
}

function npcRelationshipTarget(context: ExportContext, type: string, id: unknown) {
  const collections: Record<string, ReadonlyArray<{ _id: string; name: string; fullName?: string }>> = {
    city: context.data.Cities, country: context.data.Countries, culture: context.data.Cultures,
    religion: context.data.Religions, npc: context.data.NPCs,
  };
  return collections[type]?.find((item) => item._id === id);
}

export function renderNPCRelationships(context: ExportContext): string {
  const relationships = Array.isArray(context.entity.relationships) ? context.entity.relationships : [];
  return markdownList(relationships.map((raw) => {
    const relationship = atlasExportRecord(raw);
    const type = String(relationship.relatedEntityType ?? "");
    const target = npcRelationshipTarget(context, type, relationship.relatedEntityId);
    const name = target ? exportDocumentLink(context, type, target._id, type === "npc" ? target.fullName || target.name : target.name)
      : "Referenced entity unavailable";
    return `${getNPCRelationshipLabel(String(relationship.relationshipType ?? "relationship"))} — ${name}${relationship.roleTitle ? ` (${String(relationship.roleTitle)})` : ""}${relationship.primary ? " (Primary)" : ""}`;
  }));
}

function createNPCHistoryLinker(context: ExportContext): (text: string) => string {
  const names = new Map<string, { type: string; id: string } | null>();
  const add = (type: string, id: unknown) => {
    const target = npcRelationshipTarget(context, type, id);
    if (!target || !context.documentPaths?.[`${type}:${target._id}`]) return;
    for (const name of new Set([target.name, type === "npc" ? target.fullName : undefined].filter((value): value is string =>
      typeof value === "string" && value.length > 1))) {
      const previous = names.get(name);
      names.set(name, previous === null || (previous && (previous.id !== target._id || previous.type !== type))
        ? null : { type, id: target._id });
    }
  };
  add("city", atlasExportRecord(context.entity.currentLocation).id);
  for (const raw of Array.isArray(context.entity.relationships) ? context.entity.relationships : []) {
    const relationship = atlasExportRecord(raw);
    add(String(relationship.relatedEntityType ?? ""), relationship.relatedEntityId);
  }
  const labels = [...names].filter(([, target]) => target).map(([name]) => name)
    .sort((left, right) => right.length - left.length)
    .map((name) => Array.from(name, (character) => ".*+?^{}$()|[]\\".includes(character) ? `\\${character}` : character).join(""));
  if (!labels.length) return (text) => text;
  const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(${labels.join("|")})(?![\\p{L}\\p{N}_])`, "gu");
  // Preserve authored links, code and URLs instead of nesting generated links inside them.
  const protectedText = /(\x60{3}[\s\S]*?\x60{3}|\x60[^\x60]*\x60|\[\[[\s\S]*?\]\]|\[[^\]]*\]\([^)]*\)|https?:\/\/\S+)/g;
  return (text) => text.split(protectedText).map((part, index) => index % 2 ? part
    : part.replace(pattern, (name) => {
      const target = names.get(name);
      return target ? exportDocumentLink(context, target.type, target.id, name) : name;
    })).join("");
}

export function renderNPCHistory(context: ExportContext): string {
  const link = createNPCHistoryLinker(context);
  const eras = context.data.Eras.filter((era) => era.mapId === context.entity.mapId);
  const entries = (Array.isArray(context.entity.history) ? context.entity.history : []).map(atlasExportRecord);
  entries.sort((left, right) => {
    const year = (typeof left.year === "number" ? left.year : Number.MAX_SAFE_INTEGER) -
      (typeof right.year === "number" ? right.year : Number.MAX_SAFE_INTEGER);
    return year || String(left.createdAt ?? "").localeCompare(String(right.createdAt ?? ""));
  });
  return entries.map((entry) => {
    const era = atlasExportRecord(eras.length && typeof entry.year === "number"
      ? resolveHistoryEra(entry.year, eras) : entry.era);
    const date = era.year !== undefined ? `${String(era.year)} ${String(era.shortName ?? era.name ?? "")}`
      : entry.year === undefined ? "Undated" : String(entry.year);
    return [markdownHeading(3, link(String(entry.title ?? "Event"))), date,
      link(normalizeBodyToMarkdown(entry.description))].filter(Boolean).join("\n\n");
  }).join("\n\n");
}

function isInfoboxSection(section: AtlasSection): boolean {
  return /(?:^|\s)(?:header|profile)(?:\s|$)/i.test(section.wrapper.className ?? "") ||
    section.blocks.some((block) => block.type.endsWith("Header"));
}

/** Preserve the vault infobox layout while using current entity and Atlas values. */
export function renderBotiInfobox(context: ExportContext): string {
  if (context.sourceType === "map") return "";
  const { entity, data } = context;
  const value = (path: string) => atlasExportValue(readPath(entity, path));
  const population = (input: unknown) => {
    if (typeof input === "string" && !input.trim()) return "";
    const parsed = typeof input === "string" ? Number(input.replace(/,/g, "").trim()) : input;
    return typeof parsed === "number" && Number.isFinite(parsed) ? atlasExportValue(parsed) : atlasExportValue(input);
  };
  const pairs = (items: Array<[string, unknown]>) => markdownTable(["", ""],
    items.map(([label, item]) => [`**${label}**`, atlasExportValue(item) || "—"]));
  const groups: Array<[string, Array<[string, unknown]>]> = [];
  const leadership = (types: string[]) => data.NPCs.flatMap((npc) => {
    const matches = npc.relationships.filter((relationship) => relationship.relatedEntityType === context.sourceType &&
      relationship.relatedEntityId === entity._id && types.includes(relationship.relationshipType));
    return matches.length ? [exportDocumentLink(context, "npc", npc._id, npc.fullName || npc.name) +
      matches.map((match) => match.roleTitle ? ` — ${match.roleTitle}` : "").join("")] : [];
  }).join(", ");
  const content = validateAtlasContent(entity.content) ? entity.content : undefined;
  const identity = content?.sections.filter(isInfoboxSection) ?? [];
  const renderContext: AtlasRenderContext = {
    sourceType: context.sourceType, entity: entity as unknown as AtlasRenderContext["entity"],
    related: { cities: data.Cities, countries: data.Countries, cultures: data.Cultures,
      religions: data.Religions, notes: data.Notes, npcs: data.NPCs, eras: data.Eras, developmentalEras: data.DevelopmentalEras },
    economy: data.MapInfo.economy, mapGeography: data.MapInfo,
  };
  const profile = context.sourceType === "npc" ? identity.filter((section) => /\bprofile\b/i.test(section.wrapper.className ?? "")) : [];
  const extra = identity.filter((section) => !profile.includes(section)).flatMap((section) =>
    section.blocks.filter((block) => !["cityHeader", "countryHeader", "cultureHeader", "religionHeader", "eraHeader", "developmentalEraHeader", "noteHeader"].includes(block.type)).map((block) =>
      renderSavedAtlasBlock(block, { ...renderContext, section }, context))).filter(Boolean);
  const trade = (path: string) => normalizeTradeEntries(readPath(entity, path)).map((entry) =>
    formatTradeEntry(entry, resolveTradeGood(entry, data.MapInfo.economy?.goods))).join(", ");
  switch (context.sourceType) {
    case "city":
      groups.push(["Info", [["Aliases", entity.aliases], ["Type", entity.type], ["Capital", entity.capital ? "Yes" : "No"],
        ["Population", entity.population], ["Size", entity.size], ["Theme", entity.theme], ["Country", value("country.id") === "0" ? "A neutral city" : value("country.name")],
        ["Terrain", cityBiome(entity as unknown as TLCity, data.MapInfo)?.name ?? entity.terrain], ["Features", entity.features], ["Map Link", entity.mapLink]]],
        ["Politics", [["Rulers", leadership(["rules"]) || entity.rulers], ["Leaders", leadership(["leads", "leader"]) || entity.leaders], ["Government", value("government.formName") || value("country.govName")], ["Defenses", entity.defenses], ["Religions", entity.religions]]],
        ["Commerce", [["Imports", trade("economy.imports")], ["Exports", trade("economy.exports")]]]);
      break;
    case "country":
      groups.push(["Info", [["Aliases", entity.aliases], ["Theme", entity.theme], ["Planet", entity.planetPlane], ["Terrain", entity.terrain]]],
        ["Politics", [["Rulers", leadership(["rules"]) || entity.rulers], ["Leaders", leadership(["leads", "leader"]) || entity.leaders], ["Government", value("political.formName")], ["Religions", entity.religions]]],
        ["Population", [["Rural", value("population.rural")], ["Urban", value("population.urban")], ["Total", value("population.total")]]]);
      break;
    case "culture":
      groups.push(["Info", [["Aliases", entity.aliases], ["Type", entity.type], ["Code", entity.code], ["Region", entity.region], ["Theme", entity.theme],
        ["Language", entity.language], ["Ethnic Groups", entity.ethnicGroups], ["Urban Population", population(entity.urbanPop)], ["Rural Population", population(entity.ruralPop)]]],
        ["Belief & Governance", [["Religions", entity.religions], ["Government", entity.government], ["Technology Level", entity.technologyLevel], ["Notable Figures", entity.notableFigures]]]);
      break;
    case "religion":
      groups.push(["Info", [["Holy City / HQ", entity.headquarters || renderReligionCenter(context)], ["Symbols", entity.symbols], ["Code", entity.code],
        ["Deities", entity.deities || singleLineText(entity.deity)], ["Domains", entity.domains]]],
        ["Believers", [["Rural", value("members.rural")], ["Urban", value("members.urban")]]]);
      break;
    case "npc":
      if (!profile.length) groups.push(["Bio", [["Gender", value("gender.name")], ["Age", entity.age], ["Pronouns", entity.pronouns],
        ["Sexuality", entity.sexuality], ["Alignment", entity.alignment], ["Condition", entity.condition]]]);
      groups.push(["Info", [["Race", renderNPCReferenceField(context, "ancestry")], ["Heritage", entity.heritage], ["Aliases", entity.aliases],
        ["Occupation(s)", renderNPCReferenceField(context, "profession")], ["Group(s)", entity.groups], ["Religion(s)", entity.religions],
        ["Owned Location(s)", entity.ownedLocations], ["Current Location", renderNPCReferenceField(context, "currentLocation")]]]);
      break;
    case "era":
      groups.push(["Chronology", [["Abbreviation", entity.shortName], ["Status", entity.status === "current" ? "Current" : "Previous Era"],
        ["First Year", entity.firstYear], ["Present / Final Year", entity.finalYear], ["Years Elapsed / Duration", entity.length]]]);
      break;
    case "developmentalEra":
      groups.push(["Development", [["Threshold", entity.level], ["Status", entity.active && Array.isArray(entity.placements) && entity.placements.length ? "Active" : "Inactive"],
        ["Dated Placements", Array.isArray(entity.placements) ? entity.placements.length : 0]]]);
      break;
    default:
      groups.push(["Info", [["Type", entity.type], ["Name", entity.name]]]);
  }
  const parts = [`# ${singleLineText(entity.fullName || entity.name)}`];
  if (entity.pronounced) parts.push(`**Pronounced:** ${singleLineText(entity.pronounced)}`);
  if (context.sourceType === "npc") {
    parts.push(`![Portrait](${getNPCExportPortraitPath(entity as unknown as TLNPC, context.documentPath, getBotiExportPath)})`);
  } else if ((context.sourceType === "city" || context.sourceType === "country") && String(entity.coaSVG ?? "").trim() && entity.coaFilename) {
    parts.push(`!${exportDocumentLink({ ...context, documentPaths: { "asset:coa": String(entity.coaFilename) } }, "asset", "coa", "Coat of arms")}`);
  } else if (context.sourceType === "culture" || context.sourceType === "religion") parts.push("![[PlaceholderImage.png]]");
  if (profile.length) parts.push("###### Bio", ...profile.flatMap((section) => section.blocks.map((block) =>
    renderSavedAtlasBlock(block, { ...renderContext, section }, context))).filter(Boolean));
  for (const [title, items] of groups) parts.push(`###### ${title}`, pairs(items));
  if ((context.sourceType === "city" || context.sourceType === "country") && entity.description) {
    parts.push("###### Description", renderEntityDescriptionBodyToMarkdown(context));
  }
  if (extra.length) parts.push("###### Additional Details", ...extra);
  return `> [!infobox]\n${parts.join("\n\n").split("\n").map((line) => line ? `> ${line}` : ">").join("\n")}`;
}

export function renderBotiSectionCallout(title: string, body: string, className = "", sourceType?: ExportSourceType): string {
    const category = `${className} ${title}`;
    const categories: Array<[RegExp, string]> = [
      [/plot.hooks/i, "story"],
      [/secrets|hidden/i, "secrets"],
      [/overview|description/i, "overview"],
      [/notes|secrets|hidden/i, "notes"],
      [/history|chronology|dates|events|era-/i, "history"],
      [/government|political|laws/i, "government"],
      [/military|defen[cs]e|security/i, "military"],
      [/economy|trade|resources/i, "resources"],
      [/geography|environment|terrain|location/i, "regions"],
      [/religio|faith|belief|doctrine|deit|sacred|holy/i, "religion"],
      [/culture|customs|tradition|language/i, "culture"],
      [/education|knowledge/i, "education"],
      [/magic|supernatural/i, "magic"],
      [/technology|science/i, "technology"],
      [/population|membership|demographic/i, "demographics"],
      [/relationships|notable|elders|leaders/i, "npcs"],
      [/transport|travel|routes/i, "travel"],
      [/sports/i, "sports"],
      [/guild|faction|organization/i, "guilds"],
      [/aspiration|motivation|personality|appearance|background|profile/i, "characters"],
    ];
    const npcCategories: Array<[RegExp, string]> = [
      [/public.perception|rumou?rs/i, "rumors"], [/hidden|secrets/i, "secrets"],
      [/background/i, "story"], [/aspiration|motivation/i, "lore"],
      [/relationship|groups|organizations/i, "groups"],
    ];
    const npcType = sourceType === "npc" ? npcCategories.find(([pattern]) => pattern.test(category))?.[1] : undefined;
    const callout = getBotiSectionCalloutType(sourceType, title) ?? npcType ?? categories.find(([pattern]) => pattern.test(category))?.[1] ?? "lore";
    return `> [!${callout}]- ${title.replace(/[\r\n]/g, " ")}\n${body.split("\n").map((line) => line ? `> ${line}` : ">").join("\n")}`;
}
