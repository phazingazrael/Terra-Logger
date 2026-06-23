import { createAtlasId } from "./ids";
import { createRichTextJson } from "./richText";
import type { AtlasBlock, AtlasContent, AtlasLayoutPreset, AtlasSection, AtlasSourceType } from "../../../definitions/Atlas";
import { ATLAS_CONTENT_SCHEMA, ATLAS_CONTENT_VERSION } from "../../../definitions/Atlas";

export type DetailRow =
  | {
    label: string;
    value: string;
    valueMode?: "static";
    emptyText?: string;
  }
  | {
    label: string;
    value: string;
    valueMode: "entity";
    emptyText?: string;
  }
  | {
    label: string;
    valueMode: "computed";
    resolver: string;
    args?: Record<string, unknown>;
    emptyText?: string;
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

export function entityRichTextBlock(
  label: string,
  entityPath: string,
  emptyText = `No ${label.toLowerCase()} listed.`,
): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "richText",
    label,
    dataMode: "entity",
    binding: {
      entityPath,
    },
    editor: {
      editable: false,
      removable: true,
      reorderable: true,
      editorType: "entity",
    },
    props: {
      label,
      emptyText,
      valueFormat: "auto",
    },
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

export function entityFieldBlock(label: string, entityPath: string): AtlasBlock {
  return {
    id: createAtlasId("block"),
    kind: "block",
    type: "entityField",
    label,
    dataMode: "entity",
    binding: { entityPath },
    editor: {
      editable: false,
      removable: true,
      reorderable: true,
      editorType: "entity",
    },
    props: { label },
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
