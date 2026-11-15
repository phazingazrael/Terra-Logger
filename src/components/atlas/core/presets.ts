import { createAtlasId } from "./ids";
import { createRichTextJson } from "./richText";
import type { AtlasBlock, AtlasContent, AtlasLayoutPreset, AtlasSection, AtlasSourceType } from "../../../definitions/Atlas";
import { ATLAS_CONTENT_SCHEMA, ATLAS_CONTENT_VERSION } from "../../../definitions/Atlas";

export type DetailRow =
  | {
    label: string;
    value?: string;
    valueMode?: "static";
    fallbackResolver?: string;
    emptyText?: string;
    hideWhenEmpty?: boolean;
    hideWhenEqualTo?: string;
  }
  | {
    label: string;
    value: string;
    valueMode: "entity";
    emptyText?: string;
    hideWhenEmpty?: boolean;
    hideWhenEqualTo?: string;
  }
  | {
    label: string;
    valueMode: "computed";
    resolver: string;
    args?: Record<string, unknown>;
    emptyText?: string;
    hideWhenEmpty?: boolean;
    hideWhenEqualTo?: string;
  };

type SplitListGroup = { name: string; children: string[]; };

export type SectionPresetOptions = {
  presetId?: string;
  wrapper?: Partial<AtlasSection["wrapper"]>;
  editor?: Partial<AtlasSection["editor"]>;
};

export const clear: SectionPresetOptions = {
  wrapper: {
    variant: "clear",
  },
};


export function createContentShell(args: {
  sourceType: AtlasSourceType;
  entityId: string;
  mapId?: string;
  title: string;
  layout?: AtlasLayoutPreset;
  className?: string;
  sections: AtlasSection[];
}): AtlasContent {
  return {
    schema: ATLAS_CONTENT_SCHEMA,
    kind: "AtlasContent",
    version: ATLAS_CONTENT_VERSION,
    id: createAtlasId("content"),
    source: {
      type: args.sourceType,
      entityId: args.entityId,
      mapId: args.mapId,
    },
    meta: {
      title: args.title,
      createdBy: "map-loader",
    },
    layout: {
      preset: args.layout ?? "content-grid",
      className: args.className ?? "content-grid",
      density: "comfortable",
    },
    sections: args.sections,
  };
}

export function sectionPreset(
  title: string,
  className: string,
  blocks: AtlasBlock[],
  options: SectionPresetOptions = {},
): AtlasSection {
  return {
    id: createAtlasId("section"),
    kind: "section",
    title,
    presetId: options.presetId,
    wrapper: {
      className,
      gridSpan: "auto",
      variant: "default",
      ...options.wrapper,
    },
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      ...options.editor,
    },
    blocks,
  };
}

export function entitySection(
  title: string,
  className: string,
  blocks: AtlasBlock[],
  options: SectionPresetOptions = {},
): AtlasSection {
  return sectionPreset(title, className, blocks, {
    ...options,
    editor: {
      editable: false,
      removable: true,
      reorderable: true,
      collapsed: false,
      ...options.editor,
    },
  });
}

export function richTextBlock(text = "", label = "Rich Text"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "richText",
    label,
    dataMode: "static",
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      editorType: "richText",
    },
    props: { json: createRichTextJson(text) },
  };
}


export function npcCurrentLocationBlock(label = "Current Location"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "current-location",
    label,
    dataMode: "entity",
    binding: { entityPath: "currentLocation" },
    editor: {
      editable: false,
      removable: false,
      reorderable: true,
      editorType: "entity",
    },
    props: { emptyText: "No current location recorded." },
  };
}

export function npcRelationshipGraphBlock(label = "Relationship Graph"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "relationship-graph",
    label,
    dataMode: "computed",
    binding: { entityPath: "relationships" },
    editor: {
      editable: true,
      removable: false,
      reorderable: true,
      editorType: "relationship-list",
    },
    props: { emptyText: "No relationships recorded." },
  };
}

export function npcHistoryTimelineBlock(label = "History"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "history-timeline",
    label,
    dataMode: "entity",
    binding: { entityPath: "history" },
    editor: {
      editable: false,
      removable: false,
      reorderable: true,
      editorType: "entity",
    },
    props: { emptyText: "No history recorded." },
  };
}

export function headingBlock(text: string, level = 2): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "heading",
    label: "Heading",
    dataMode: "static",
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      editorType: "heading",
    },
    props: { text, level },
  };
}

export function descriptionBlock(label = "Description"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "description",
    label,
    dataMode: "computed",
    binding: {
      resolver: "generic.description",
    },
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      editorType: "description",
    },
    props: {
      label,
      emptyText: "No description available.",
    },
  };
}

export function detailsListBlock(rows: DetailRow[], label = "Details"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "detailsList",
    label,
    dataMode: "static",
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      editorType: "detailsList",
    },
    props: { rows },
  };
}

export function splitListBlock(
  groups: SplitListGroup[],
  label = "Split List",
): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "splitList",
    label,
    dataMode: "static",
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      editorType: "splitList",
    },
    props: { groups },
  };
}

export type EntitySplitListGroupBinding = {
  label: string;
  entityPath: string;
  emptyText?: string;
};

export function entitySplitListBlock(
  label: string,
  entityPathOrGroups: string | EntitySplitListGroupBinding[],
): AtlasBlock {
  if (typeof entityPathOrGroups === "string") {
    return {
      id: createAtlasId("block"),
      kind: "block",
      type: "splitList",
      label,
      dataMode: "entity",
      binding: {
        entityPath: entityPathOrGroups,
      },
      editor: {
        editable: false,
        removable: true,
        reorderable: true,
        editorType: "entity",
      },
      props: {
        label,
        emptyText: `No ${label.toLowerCase()} listed.`,
      },
    };
  }

  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "splitList",
    label,
    dataMode: "entity",
    editor: {
      editable: false,
      removable: true,
      reorderable: true,
      editorType: "entity",
    },
    props: {
      label,
      groups: entityPathOrGroups,
      emptyText: `No ${label.toLowerCase()} listed.`,
    },
  };
}

export function chipListBlock(chips: string[], label = "Chips"): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "chipList",
    label,
    dataMode: "static",
    editor: {
      editable: true,
      removable: true,
      reorderable: true,
      editorType: "chipList",
    },
    props: { chips },
  };
}


export function entityChipListBlock(label: string, entityPath: string): AtlasBlock {

  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "entityChipList",
    label,
    dataMode: "entity",
    binding: { entityPath },
    editor: {
      editable: false,
      removable: true,
      reorderable: true,
      editorType: "entity",
    },
    props: { label, emptyText: `No ${label.toLowerCase()} listed.` },
  };
}

export function geographySummary(): AtlasBlock {
  return computedBlock("geographySummary", "Biomes", "geography.summary");
}

export function economySummary(): AtlasBlock {
  return computedBlock("economySummary", "Economy Summary", "economy.summary");
}

export function computedBlock(type: string, label: string, resolver: string, props: Record<string, unknown> = {}): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type,
    label,
    dataMode: "computed",
    binding: { resolver },
    editor: {
      editable: false,
      removable: false,
      reorderable: true,
      editorType: "entity",
    },
    props,
  };
}

export function ensureEconomySummary(content: AtlasContent): AtlasContent {
  if (content.source.type !== "city" && content.source.type !== "country") return content;
  if (content.sections.some((section) => section.blocks.some((block) => block.type === "economySummary"))) {
    return content;
  }
  const target = content.sections.find((section) => {
    const title = section.title.toLowerCase().replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ").trim();
    const classes = (section.wrapper.className ?? "").split(/\s+/);
    return title === "economy" || title === "economy and trade" ||
      classes.includes("economy") || classes.includes("economy-trade");
  });
  if (!target) return content;
  const summary = { ...economySummary(), id: `${target.id}-economy-summary` };
  const index = target.blocks.findIndex((block) => block.type === "richText");
  const blocks = [...target.blocks];
  blocks.splice(index < 0 ? blocks.length : index, 0, summary);
  return {
    ...content,
    sections: content.sections.map((section) => section === target ? { ...section, blocks } : section),
  };
}

export function findEconomyTradeBlock(section?: AtlasSection) {
  return section?.blocks.find((block) => {
    if (block.type !== "splitList" || block.dataMode !== "entity" || !Array.isArray(block.props.groups)) return false;
    const paths = block.props.groups.map((group) => group && typeof group === "object"
      ? (group as { entityPath?: string }).entityPath : undefined);
    return paths.includes("economy.imports") && paths.includes("economy.exports");
  });
}

const geographyDefaults: Record<string, { placeholder: string; resolver: string; emptyText: string }> = {
  "Climate & Atmosphere": {
    placeholder: "[Earth-like, toxic, magical storms, artificial climate, etc.]",
    resolver: "geography.climate",
    emptyText: "No biome-based climate description is available.",
  },
  "Topography & Terrain": {
    placeholder: "[Floating islands, underground caverns, space stations, etc.]",
    resolver: "geography.terrain",
    emptyText: "No biome-based terrain description is available.",
  },
};

export function ensureGeographySummary(content: AtlasContent): AtlasContent {
  if (content.source.type !== "city" && content.source.type !== "country") return content;
  const target = content.sections.find((section) =>
    (section.wrapper.className ?? "").split(/\s+/).includes("geography-environment") ||
    /^geography\s*(?:&|and)\s*environment$/i.test(section.title.trim()));
  if (!target) return content;
  const blocks = target.blocks.map((block) => {
    if (block.type !== "detailsList" || !Array.isArray(block.props.rows)) return block;
    const originalRows = block.props.rows;
    const rows = originalRows.map((value: unknown) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return value;
      const row = value as Record<string, unknown>;
      if ((row.valueMode !== undefined && row.valueMode !== "static") || row.fallbackResolver) return value;
      const defaults = typeof row.label === "string" ? geographyDefaults[row.label] : undefined;
      // Only replace the exact template placeholders; authored text and explicit blanks survive.
      if (!defaults || row.value !== defaults.placeholder) return value;
      return { ...row, value: undefined, fallbackResolver: defaults.resolver, emptyText: defaults.emptyText };
    });
    return rows.every((row, index) => row === originalRows[index])
      ? block : { ...block, props: { ...block.props, rows } };
  });
  if (!content.sections.some((section) => section.blocks.some((block) => block.type === "geographySummary"))) {
    blocks.unshift({ ...geographySummary(), id: `${target.id}-geography-summary` });
  }
  if (blocks.length === target.blocks.length && blocks.every((block, index) => block === target.blocks[index])) return content;
  return {
    ...content,
    sections: content.sections.map((section) => section !== target ? section : { ...section, blocks }),
  };
}
