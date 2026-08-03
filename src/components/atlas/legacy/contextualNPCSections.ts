import type { AtlasContent, AtlasSection, AtlasSourceType } from "../../../definitions/Atlas";
import { computedBlock, entitySection } from "../core/presets";

type ContextualNPCSection = {
  title: string;
  className: string;
  aliases?: readonly string[];
  roleTitles: string[];
  relationshipTypes?: string[];
  emptyText: string;
};

type LeaderDetailsMigration = {
  sourceType: "country" | "city";
  legacySectionTitles: readonly string[];
  targetSectionTitle: string;
  rowLabels: readonly string[];
  canonicalRowLabel: string;
  resolver: string;
  emptyText: string;
};

const definitions: Partial<Record<AtlasSourceType, ContextualNPCSection[]>> = {
  city: [
    { title: "Notable NPCs", className: "section notable-npcs", roleTitles: ["Notable NPC"], emptyText: "No notable NPCs." },
  ],
  religion: [{ title: "Religious Leaders", className: "section religious-leaders", roleTitles: ["Religious Leader"], emptyText: "No religious leaders." }],
  culture: [{ title: "Cultural Elders", className: "section cultural-elders", roleTitles: ["Cultural Elder"], emptyText: "No cultural elders." }],
};

const leaderDetailsMigrations: LeaderDetailsMigration[] = [
  {
    sourceType: "country",
    legacySectionTitles: ["Current Rulers"],
    targetSectionTitle: "Government & Power Structure",
    rowLabels: ["Current Rulers", "Current Ruler(s)"],
    canonicalRowLabel: "Current Rulers",
    resolver: "country.currentRulers",
    emptyText: "No current rulers recorded.",
  },
  {
    sourceType: "city",
    legacySectionTitles: ["Current Leaders", "Current Rulers"],
    targetSectionTitle: "Government & Power Structure",
    rowLabels: ["Current Leaders", "Current Rulers", "Current Ruler(s)"],
    canonicalRowLabel: "Current Ruler(s)",
    resolver: "city.currentRulers",
    emptyText: "No current city leaders recorded.",
  },
];

function normalizeTitle(value: string): string {
  return value.trim().toLowerCase();
}

function sectionMatches(section: AtlasSection, definition: ContextualNPCSection): boolean {
  const titles = [definition.title, ...(definition.aliases ?? [])].map(normalizeTitle);
  return titles.includes(normalizeTitle(section.title));
}

function normalizedSection(section: AtlasSection, definition: ContextualNPCSection): AtlasSection {
  return {
    ...section,
    title: definition.title,
    wrapper: { ...section.wrapper, className: definition.className },
    blocks: section.blocks.map((block) => block.type === "relatedNPCList"
      ? {
          ...block,
          label: definition.title,
          props: {
            ...block.props,
            roleTitles: definition.roleTitles,
            relationshipTypes: definition.relationshipTypes ?? [],
            emptyText: definition.emptyText,
          },
        }
      : block),
  };
}

function isGeneratedLeaderSection(section: AtlasSection, migration: LeaderDetailsMigration): boolean {
  const isLegacyTitle = migration.legacySectionTitles.some((title) => normalizeTitle(title) === normalizeTitle(section.title));
  if (!isLegacyTitle) return false;

  return section.blocks.some((block) => block.type === "relatedNPCList") ||
    ["section current-rulers", "section current-leaders"].includes(section.wrapper.className ?? "");
}

function migrateLeaderDetails(content: AtlasContent): AtlasContent {
  const migration = leaderDetailsMigrations.find((entry) => entry.sourceType === content.source.type);
  if (!migration) return content;

  const targetTitle = normalizeTitle(migration.targetSectionTitle);
  const rowLabels = new Set(migration.rowLabels.map(normalizeTitle));
  let targetUpdated = false;

  const sections = content.sections.reduce<AtlasSection[]>((result, section) => {
    if (isGeneratedLeaderSection(section, migration)) return result;

    const migratedSection = (() => {
      if (normalizeTitle(section.title) !== targetTitle) return section;

      let sectionUpdated = false;
      const blocks = section.blocks.map((block) => {
        if (block.type !== "detailsList" || !Array.isArray(block.props.rows)) return block;

        let matchedRow = false;
        let blockUpdated = false;
        const rows = block.props.rows.map((value) => {
          if (!value || typeof value !== "object") return value;
          const row = value as { label?: unknown };
          if (typeof row.label !== "string" || !rowLabels.has(normalizeTitle(row.label))) return value;
          matchedRow = true;
          const current = value as {
            label?: unknown;
            value?: unknown;
            valueMode?: unknown;
            resolver?: unknown;
            emptyText?: unknown;
          };
          const alreadyMigrated =
            current.label === migration.canonicalRowLabel &&
            current.valueMode === "computed" &&
            current.resolver === migration.resolver &&
            current.emptyText === migration.emptyText &&
            current.value === undefined;
          if (alreadyMigrated) return value;

          targetUpdated = true;
          blockUpdated = true;
          const { value: _legacyValue, ...rest } = current;
          return {
            ...rest,
            label: migration.canonicalRowLabel,
            valueMode: "computed",
            resolver: migration.resolver,
            emptyText: migration.emptyText,
          };
        });

        if (!matchedRow) {
          targetUpdated = true;
          blockUpdated = true;
          rows.splice(1, 0, {
            label: migration.canonicalRowLabel,
            valueMode: "computed",
            resolver: migration.resolver,
            emptyText: migration.emptyText,
          });
        }

        if (!blockUpdated) return block;
        sectionUpdated = true;
        return { ...block, props: { ...block.props, rows } };
      });

      return sectionUpdated ? { ...section, blocks } : section;
    })();

    result.push(migratedSection);
    return result;
  }, []);

  const changed = sections.length !== content.sections.length || targetUpdated || sections.some((section, index) => section !== content.sections[index]);
  return changed ? { ...content, sections } : content;
}

export function ensureContextualNPCSections(content: AtlasContent): AtlasContent {
  const migratedContent = migrateLeaderDetails(content);
  const required = definitions[migratedContent.source.type] ?? [];
  if (required.length === 0) return migratedContent;

  const matched = new Set<ContextualNPCSection>();
  const sections = migratedContent.sections.map((section) => {
    const definition = required.find((item) => sectionMatches(section, item));
    if (!definition) return section;
    matched.add(definition);
    return normalizedSection(section, definition);
  });

  const additions: AtlasSection[] = [];

  for (const item of required) {
    if (matched.has(item)) continue;
    additions.push(
      entitySection(item.title, item.className, [
        computedBlock("relatedNPCList", item.title, "npc.relationships", {
          roleTitles: item.roleTitles,
          relationshipTypes: item.relationshipTypes ?? [],
          emptyText: item.emptyText,
        }),
      ]),
    );
  }

  return additions.length > 0 || sections.some((section, index) => section !== migratedContent.sections[index])
    ? { ...migratedContent, sections: [...sections, ...additions] }
    : migratedContent;
}
