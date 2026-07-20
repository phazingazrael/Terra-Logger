import type {
  AtlasBlock,
  AtlasContent,
  AtlasEntityBySource,
  AtlasSection,
  AtlasSourceType,
} from "../../../definitions/Atlas";
import { createDefaultAtlasContent } from "../adapters/registry";
import { isAtlasContent } from "../core/validators";

const ENRICHMENT_SECTION_TITLES: Record<AtlasSourceType, string[]> = {
  city: [
    "History",
    "Geography & Environment",
    "Economy & Trade",
    "Government & Power Structure",
    "Demographics & Society",
    "Military & Defense",
    "Transportation & Infrastructure",
    "Education & Knowledge",
    "Culture, Arts & Entertainment",
    "Sports & Competitive Games",
    "Magic & Technology",
    "Crime & Underworld",
    "Religion & Mythology",
    "Notable Locations & Landmarks",
    "Sister Cities & Relations",
    "Notable Figures & Legends",
    "Adventurers & Mercenary Work",
    "Notes",
    "Plot Hooks",
    "Hidden Details",
    "General Notes",
  ],
  country: [
    "History",
    "Geography & Environment",
    "Economy & Trade",
    "Government & Power Structure",
    "Politics & Relationships",
    "Demographics & Society",
    "Military & Defense",
    "Transportation & Infrastructure",
    "Education & Knowledge",
    "Culture, Arts & Entertainment",
    "Sports & Competitive Games",
    "Magic & Technology",
    "Crime & Underworld",
    "Religion & Mythology",
    "Notable Locations & Landmarks",
    "Notable Figures & Legends",
    "Adventurers & Mercenary Work",
    "Current Events",
    "Plot Hooks",
    "Hidden Details",
    "General Notes",
  ],
  culture: [
    "Overview",
    "Traditions & Customs",
    "Arts & Expression",
    "Daily Life",
    "History & Origins",
    "Demographics",
    "Belief Systems",
    "Governance & Law",
    "External Relations",
    "Notes",
    "Rumors",
    "Secrets",
    "Lore",
  ],
  religion: [
    "Overview",
    "Doctrine & Beliefs",
    "Holy Days & Observances",
    "Organization & Sects",
    "Temples & Sacred Sites",
    "Relics & Iconography",
    "Origins & Growth",
    "Spread & Influence",
    "Myths & Stories",
    "Heresies & Whispered Claims",
    "Secrets / GM Notes",
    "Notes",
  ],
  note: [],
};

const SECTION_TITLE_ALIASES: Partial<
  Record<AtlasSourceType, Record<string, string>>
> = {
  city: {
    "government and power": "government and power structure",
    "sister cities and other connections": "sister cities and relations",
  },
  country: {
    economy: "economy and trade",
    "political information": "government and power structure",
    "government and power": "government and power structure",
  },
  culture: {
    "customs and society": "traditions and customs",
    "arts and traditions": "arts and expression",
    origins: "history and origins",
  },
  religion: {
    "beliefs and practices": "doctrine and beliefs",
    "origins and mythology": "origins and growth",
  },
};

type EnsureAtlasContentResult<TSource extends AtlasSourceType> = {
  entity: AtlasEntityBySource[TSource];
  changed: boolean;
};

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function canonicalTitleKey(sourceType: AtlasSourceType, title: string): string {
  const normalized = normalizeTitle(title);
  return SECTION_TITLE_ALIASES[sourceType]?.[normalized] ?? normalized;
}

function targetTitleSet(sourceType: AtlasSourceType): Set<string> {
  return new Set(
    ENRICHMENT_SECTION_TITLES[sourceType].map((title) =>
      canonicalTitleKey(sourceType, title),
    ),
  );
}

function enrichableBlockKey(block: AtlasBlock): string | null {
  if (block.type === "richText") {
    return "richText";
  }

  if (block.type === "detailsList") {
    return `detailsList:${String(block.label ?? "Details")}`;
  }

  return null;
}

function enrichSectionFromBlueprint(
  existingSection: AtlasSection,
  blueprintSection: AtlasSection,
): { section: AtlasSection; changed: boolean } {
  let changed = false;

  const existingBlockKeys = new Set(
    existingSection.blocks
      .map((block) => enrichableBlockKey(block))
      .filter((key): key is string => Boolean(key)),
  );

  const blocksToAppend = blueprintSection.blocks.filter((block) => {
    const blockKey = enrichableBlockKey(block);

    if (!blockKey) {
      return false;
    }

    return !existingBlockKeys.has(blockKey);
  });

  if (blocksToAppend.length > 0) {
    changed = true;
  }

  const shouldRename = existingSection.title !== blueprintSection.title;

  if (shouldRename) {
    changed = true;
  }

  if (!changed) {
    return { section: existingSection, changed: false };
  }

  return {
    section: {
      ...existingSection,
      title: blueprintSection.title,
      blocks: [...existingSection.blocks, ...blocksToAppend],
    },
    changed: true,
  };
}

export function enrichAtlasContent<TSource extends AtlasSourceType>(args: {
  sourceType: TSource;
  entity: AtlasEntityBySource[TSource];
  content: AtlasContent;
}): AtlasContent {
  const targets = targetTitleSet(args.sourceType);

  if (targets.size === 0) {
    return args.content;
  }

  const defaultContent = createDefaultAtlasContent(args.sourceType, args.entity);
  const blueprintSections = defaultContent.sections.filter((section) =>
    targets.has(canonicalTitleKey(args.sourceType, section.title)),
  );

  if (blueprintSections.length === 0) {
    return args.content;
  }

  let changed = false;
  const nextSections = [...args.content.sections];

  const existingIndexByTitleKey = new Map<string, number>();

  nextSections.forEach((section, index) => {
    const key = canonicalTitleKey(args.sourceType, section.title);

    if (!existingIndexByTitleKey.has(key)) {
      existingIndexByTitleKey.set(key, index);
    }
  });

  for (const blueprintSection of blueprintSections) {
    const key = canonicalTitleKey(args.sourceType, blueprintSection.title);
    const existingIndex = existingIndexByTitleKey.get(key);

    if (existingIndex == null) {
      nextSections.push(blueprintSection);
      existingIndexByTitleKey.set(key, nextSections.length - 1);
      changed = true;
      continue;
    }

    const existingSection = nextSections[existingIndex];

    if (!existingSection) {
      continue;
    }

    const enriched = enrichSectionFromBlueprint(
      existingSection,
      blueprintSection,
    );

    if (enriched.changed) {
      nextSections[existingIndex] = enriched.section;
      changed = true;
    }
  }

  if (!changed) {
    return args.content;
  }

  return {
    ...args.content,
    meta: {
      ...args.content.meta,
      updatedAt: new Date().toISOString(),
    },
    sections: nextSections,
  };
}

export function ensureAtlasContentForEntity<TSource extends AtlasSourceType>(
  sourceType: TSource,
  entity: AtlasEntityBySource[TSource],
): EnsureAtlasContentResult<TSource> {
  const currentContent = entity.content;

  if (isAtlasContent(currentContent)) {
    const enrichedContent = enrichAtlasContent({
      sourceType,
      entity,
      content: currentContent,
    });

    if (enrichedContent === currentContent) {
      return { entity, changed: false };
    }

    return {
      entity: {
        ...entity,
        content: enrichedContent,
      },
      changed: true,
    };
  }

  const defaultContent = createDefaultAtlasContent(sourceType, entity);

  return {
    entity: {
      ...entity,
      content: {
        ...defaultContent,
        meta: {
          ...defaultContent.meta,
          createdBy: "migration",
          updatedAt: new Date().toISOString(),
        },
      },
    },
    changed: true,
  };
}
