import type {
  AtlasBlock,
  AtlasContent,
  AtlasSection,
} from "../../../definitions/Atlas";
import { createAtlasId } from "../core/ids";
import {
  detailsListBlock,
  entityChipListBlock,
  richTextBlock,
  sectionPreset,
  splitListBlock,
} from "../core/presets";

export type LegacyJsonUiMigrationStrategy =
  | "replaceMatchingEditable"
  | "appendLegacySections";

export type LegacyJsonUiNode = {
  type?: string;
  sourceType?: string;
  props?: Record<string, unknown>;
  children?: LegacyJsonUiNode[];
  set?: string[];
};

export type MigrateLegacyJsonUiArgs = {
  defaultContent: AtlasContent;
  legacyContent: LegacyJsonUiNode;
  strategy?: LegacyJsonUiMigrationStrategy;
};

/**
 * These sections should remain owned by the new Atlas adapters/plugins.
 *
 * The converter is only meant to preserve old editable/static JsonUI content
 * that would otherwise be lost. It should not replace computed Atlas sections
 * such as headers, description resolvers, note bodies, tags, city lists, etc.
 */
const PROTECTED_SECTION_TITLES = new Set([
  "header",
  "description",
  "imported note",
  "note body",
  "metadata",
  "tags",
  "features",
  "cities",
  "map",
  "population",
  "membership",
  "military",
  "diplomacy",
]);

export function isLegacyJsonUiContent(
  value: unknown,
): value is LegacyJsonUiNode {
  if (!isRecord(value)) return false;

  return (
    value.type === "View" &&
    typeof value.sourceType === "string" &&
    Array.isArray(value.children)
  );
}

export function migrateLegacyJsonUiContent({
  defaultContent,
  legacyContent,
  strategy = "replaceMatchingEditable",
}: MigrateLegacyJsonUiArgs): AtlasContent {
  const legacySections = getChildren(legacyContent)
    .filter((child) => child.type === "Section")
    .map(convertLegacySection)
    .filter((section): section is AtlasSection => Boolean(section));

  const sections =
    strategy === "appendLegacySections"
      ? appendLegacySections(defaultContent.sections, legacySections)
      : replaceMatchingEditableSections(
        defaultContent.sections,
        legacySections,
      );

  return {
    ...defaultContent,
    meta: {
      ...defaultContent.meta,
      createdBy: "migration",
      updatedAt: new Date().toISOString(),
    },
    sections,
  };
}

function convertLegacySection(node: LegacyJsonUiNode): AtlasSection | null {
  const props = getProps(node);

  const title =
    extractSectionTitle(node) ||
    humanizeClassName(readString(props.className, "Legacy Section"));

  const className = readString(props.className, "section legacy-jsonui");
  const editable = props.edit === true;

  const blocks = getChildren(node)
    .flatMap((child) => convertLegacyChildToBlocks(child, title))
    .filter((block): block is AtlasBlock => Boolean(block));

  if (blocks.length === 0) return null;

  return sectionPreset(title, `${className} legacy-jsonui`, blocks, {
    presetId: "legacy-jsonui",
    editor: {
      editable,
      removable: true,
      reorderable: true,
      collapsed: false,
    },
  });
}

function convertLegacyChildToBlocks(
  node: LegacyJsonUiNode,
  sectionTitle: string,
): AtlasBlock[] {
  if (isSectionHeadingNode(node, sectionTitle)) {
    return [];
  }

  switch (node.type) {
    case "Typography":
    case "Text": {
      const text = extractText(node).trim();

      if (!text) return [];

      return [richTextBlock(text, "Legacy Text")];
    }

    case "List":
      return convertLegacyListToBlocks(node);

    case "DataList":
      return convertLegacyDataListToBlocks(node);

    case "SubList":
      return convertLegacySubListToBlocks(node);

    case "Icon":
      return [];

    default: {
      const childBlocks = getChildren(node).flatMap((child) =>
        convertLegacyChildToBlocks(child, sectionTitle),
      );

      if (childBlocks.length > 0) {
        return childBlocks;
      }

      const fallbackText = extractText(node).trim();

      if (!fallbackText) return [];

      return [richTextBlock(fallbackText, "Legacy Text")];
    }
  }
}

function convertLegacyListToBlocks(node: LegacyJsonUiNode): AtlasBlock[] {
  const props = getProps(node);

  const listType = readString(props.listtype, "");
  const listName = readString(props.listname, "");
  const listHeading = readString(props.listheading, "");

  const listItems = getChildren(node).filter(
    (child) => child.type === "ListItem",
  );

  if (listType === "Detail") {
    const rows = listItems
      .map((item) => {
        const itemProps = getProps(item);

        const label = cleanDetailLabel(
          readString(itemProps.label, ""),
        );

        const value =
          readString(itemProps.value, "") ||
          readString(itemProps.text, "") ||
          extractText(item);

        if (!label && !value) return null;

        return {
          label: label || "Detail",
          value,
          emptyText: "",
        };
      })
      .filter(
        (
          row,
        ): row is {
          label: string;
          value: string;
          emptyText: string;
        } => Boolean(row),
      );

    if (rows.length === 0) return [];

    return [
      detailsListBlock(
        rows,
        humanizeListName(listHeading || listName) || "Details",
      ),
    ];
  }

  const children = listItems
    .map((item) => {
      const itemProps = getProps(item);

      return (
        readString(itemProps.text, "") ||
        readString(itemProps.value, "") ||
        extractText(item)
      ).trim();
    })
    .filter(Boolean);

  if (children.length === 0) return [];

  return [
    splitListBlock(
      [
        {
          name:
            listHeading ||
            humanizeListName(listName) ||
            "Items",
          children,
        },
      ],
      humanizeListName(listName) || "List",
    ),
  ];
}

function convertLegacyDataListToBlocks(
  node: LegacyJsonUiNode,
): AtlasBlock[] {
  const props = getProps(node);

  const listType = readString(props.listtype, "");
  const listName = readString(props.listname, "");

  if (listType === "Chips" && listName) {
    return [entityChipListBlock(humanizeListName(listName), listName)];
  }

  const chips = readStringArray(props.chips);

  if (chips.length > 0) {
    return [
      splitListBlock(
        [
          {
            name: humanizeListName(listName) || "Items",
            children: chips,
          },
        ],
        humanizeListName(listName) || "List",
      ),
    ];
  }

  return [];
}

function convertLegacySubListToBlocks(
  node: LegacyJsonUiNode,
): AtlasBlock[] {
  return getChildren(node).flatMap((child) =>
    convertLegacyChildToBlocks(child, ""),
  );
}

function replaceMatchingEditableSections(
  defaultSections: AtlasSection[],
  legacySections: AtlasSection[],
): AtlasSection[] {
  const nextSections = [...defaultSections];

  for (const legacySection of legacySections) {
    const legacyKey = normalizeTitle(legacySection.title);

    if (PROTECTED_SECTION_TITLES.has(legacyKey)) {
      continue;
    }

    const matchingIndex = nextSections.findIndex((section) => {
      const sameTitle =
        normalizeTitle(section.title) === legacyKey;

      const sameClass =
        normalizeClassName(section.wrapper.className) ===
        normalizeClassName(legacySection.wrapper.className);

      return sameTitle || sameClass;
    });

    if (matchingIndex >= 0) {
      const currentSection = nextSections[matchingIndex];

      nextSections[matchingIndex] = {
        ...legacySection,
        id: currentSection.id,
        wrapper: {
          ...legacySection.wrapper,
          gridSpan: currentSection.wrapper.gridSpan,
          variant: currentSection.wrapper.variant,
        },
      };

      continue;
    }

    nextSections.push(makeAppendedLegacySection(legacySection));
  }

  return nextSections;
}

function appendLegacySections(
  defaultSections: AtlasSection[],
  legacySections: AtlasSection[],
): AtlasSection[] {
  return [
    ...defaultSections,
    ...legacySections
      .filter(
        (section) =>
          !PROTECTED_SECTION_TITLES.has(
            normalizeTitle(section.title),
          ),
      )
      .map(makeAppendedLegacySection),
  ];
}

function makeAppendedLegacySection(
  section: AtlasSection,
): AtlasSection {
  return {
    ...section,
    id: createAtlasId("section"),
    title: section.title.startsWith("Legacy:")
      ? section.title
      : `Legacy: ${section.title}`,
    wrapper: {
      ...section.wrapper,
      className: `${section.wrapper.className ?? ""
        } legacy-jsonui-appended`.trim(),
    },
  };
}

function extractSectionTitle(section: LegacyJsonUiNode): string {
  for (const child of getChildren(section)) {
    if (child.type !== "Typography") continue;

    const text = extractText(child).trim();

    if (text) return text;
  }

  return "";
}

function isSectionHeadingNode(
  node: LegacyJsonUiNode,
  sectionTitle: string,
): boolean {
  if (node.type !== "Typography") return false;

  const props = getProps(node);
  const component = readString(props.component, "");
  const variant = readString(props.variant, "");
  const text = extractText(node).trim();

  const looksLikeHeading =
    component === "h1" ||
    component === "h2" ||
    variant === "h1" ||
    variant === "h2" ||
    variant === "h3";

  return (
    looksLikeHeading &&
    normalizeTitle(text) === normalizeTitle(sectionTitle)
  );
}

function extractText(node: LegacyJsonUiNode): string {
  const props = getProps(node);

  const ownText =
    readString(props.text, "") ||
    readString(props.children, "") ||
    readString(props.value, "");

  const childText = getChildren(node)
    .map((child) => extractText(child))
    .filter(Boolean)
    .join("\n");

  return [ownText, childText].filter(Boolean).join("\n");
}

function getChildren(node: LegacyJsonUiNode): LegacyJsonUiNode[] {
  return Array.isArray(node.children) ? node.children : [];
}

function getProps(node: LegacyJsonUiNode): Record<string, unknown> {
  return isRecord(node.props) ? node.props : {};
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (isRecord(item)) {
        return (
          readString(item.name, "") ||
          readString(item.label, "") ||
          readString(item.text, "") ||
          readString(item.value, "")
        );
      }

      return "";
    })
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanDetailLabel(value: string): string {
  return value.trim().replace(/:+$/, "");
}

function normalizeTitle(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeClassName(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .toLowerCase()
    .replace(/\blegacy-jsonui\b/g, "")
    .replace(/\blegacy-jsonui-appended\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function humanizeListName(value: string): string {
  if (!value) return "";

  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function humanizeClassName(value: string): string {
  const cleaned = value
    .replace(/\bsection\b/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Legacy Section";
}
