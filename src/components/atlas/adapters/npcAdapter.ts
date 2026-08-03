import type { AtlasAdapter, AtlasBlock, AtlasContent, AtlasSection } from "../../../definitions/Atlas";
import type { TLNPC } from "../../../definitions/TerraLogger";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import {
  chipListBlock,
  createContentShell,
  detailsListBlock,
  entityChipListBlock,
  entitySection,
  npcCurrentLocationBlock,
  npcHistoryTimelineBlock,
  npcRelationshipGraphBlock,
  richTextBlock,
  sectionPreset,
} from "../core/presets";

function entityDetails(rows: Array<{
  label: string;
  value: string;
  emptyText?: string;
  hideWhenEqualTo?: string;
}>) {
  return detailsListBlock(rows.map((row) => ({
    ...row,
    valueMode: "entity" as const,
    hideWhenEmpty: true,
  })));
}

const systemSectionOptions = {
  editor: {
    editable: false,
    removable: false,
    reorderable: true,
    collapsed: false,
    lockedReason: "This section is backed by structured NPC data.",
  },
} as const;

function currentLocationSection(): AtlasSection {
  return entitySection(
    "Current Location",
    "section npc-current-location",
    [npcCurrentLocationBlock()],
    systemSectionOptions,
  );
}

function relationshipGraphSection(): AtlasSection {
  return entitySection(
    "Relationship Graph",
    "section npc-relationship-graph",
    [npcRelationshipGraphBlock()],
    systemSectionOptions,
  );
}

function historySection(): AtlasSection {
  return entitySection(
    "History",
    "section npc-history",
    [npcHistoryTimelineBlock()],
    systemSectionOptions,
  );
}

function groupsSection(entity?: TLNPC): AtlasSection {
  const groups: string[] = [];
  const seenGroupNames = new Set<string>();

  for (const group of entity?.groups ?? []) {
    const name = group.name.trim();
    if (group.id.startsWith("generated:") || !name || seenGroupNames.has(name)) continue;
    seenGroupNames.add(name);
    groups.push(name);
  }

  return sectionPreset(
    "Groups & Organizations",
    "section npc-groups-organizations",
    [chipListBlock(groups, "Groups & Organizations")],
  );
}

function createNPCContent(entity: TLNPC): AtlasContent {
  return createContentShell({
    sourceType: "npc",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.fullName || entity.name,
    layout: "content-grid",
    className: "content-grid",
    sections: [
      entitySection("Profile", "section npc-profile",
        [entityDetails([
          { label: "Name", value: "name" },
          { label: "Full Name", value: "fullName", hideWhenEqualTo: "name" },
          { label: "Nickname", value: "nickName" },
          { label: "Pronunciation", value: "pronounced" },
          { label: "Age", value: "age" },
          { label: "Gender", value: "gender.name" },
          { label: "Sexuality", value: "sexuality" },
          { label: "Alignment", value: "alignment" },
          { label: "Condition", value: "condition" },
        ]),
        entityChipListBlock("Aliases", "aliases"), entityChipListBlock("Pronouns", "pronouns")]
      ),
      entitySection("Overview", "section npc-overview", [entityDetails([
        { label: "Race", value: "ancestry.name" },
        { label: "Heritage", value: "heritage" },
        { label: "Profession", value: "profession.name" },
        { label: "Current Residence", value: "currentLocation.name" },
        { label: "Religions", value: "religions" },
        { label: "Organizations", value: "groups" },
      ])]),
      entitySection("Appearance", "section npc-appearance", [entityDetails([
        { label: "Build", value: "appearance.build" },
        { label: "Skin Tone", value: "appearance.skinTone" },
        { label: "Complexion", value: "appearance.complexion" },
        { label: "Eye Shape", value: "appearance.eyeShape" },
        { label: "Eye Color", value: "appearance.eyeColor" },
        { label: "Hair Style", value: "appearance.hairStyle" },
        { label: "Hair Color", value: "appearance.hairColor" },
        { label: "Facial Hair", value: "appearance.facialHair" },
        { label: "Descriptors", value: "appearance.descriptors" },
      ])]),
      entitySection("Personality", "section npc-personality", [entityDetails([
        { label: "Demeanor", value: "personality.demeanor" },
        { label: "Activities", value: "personality.activities" },
      ])]),
      entitySection("Background", "section npc-background", [entityDetails([{ label: "Background", value: "background" }])]),
      entitySection("Aspirations & Motivations", "section npc-aspirations", [entityDetails([{ label: "Aspirations & Motivations", value: "aspirationsMotivations" }])]),
      entitySection("Public Perception", "section npc-public-perception", [entityDetails([{ label: "Public Perception", value: "publicPerception" }])]),
      entitySection("Hidden Details", "section npc-hidden-details", [entityDetails([{ label: "Hidden Details", value: "hiddenDetails" }])]),
      groupsSection(entity),
      sectionPreset("Notes", "section npc-notes", [richTextBlock("Add NPC notes, reminders, secrets, and references here.")]),
      entitySection("Tags", "section tags", [entityChipListBlock("Tags", "tags")]),
      currentLocationSection(),
      relationshipGraphSection(),
      historySection(),
    ],
  });
}

function normalizedTitle(value: string): string {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

function hasClass(section: AtlasSection, className: string): boolean {
  return (section.wrapper.className ?? "").split(/\s+/).includes(className);
}

function hasBlock(content: AtlasContent, type: string): boolean {
  return content.sections.some((section) => section.blocks.some((block) => block.type === type));
}

const profileRows = [
  { label: "Name", value: "name", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Full Name", value: "fullName", valueMode: "entity" as const, hideWhenEmpty: true, hideWhenEqualTo: "name" },
  { label: "Nickname", value: "nickName", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Pronunciation", value: "pronounced", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Age", value: "age", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Gender", value: "gender.name", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Sexuality", value: "sexuality", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Alignment", value: "alignment", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Condition", value: "condition", valueMode: "entity" as const, hideWhenEmpty: true },
];

const overviewRows = [
  { label: "Race", value: "ancestry.name", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Heritage", value: "heritage", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Profession", value: "profession.name", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Current Residence", value: "currentLocation.name", valueMode: "entity" as const, hideWhenEmpty: true },
  { label: "Religions", value: "religions", valueMode: "entity" as const, hideWhenEmpty: true },
];


const identityRowPaths = new Set([
  ...profileRows.map((row) => row.value),
  ...overviewRows.map((row) => row.value),
  "currentLocation.name",
  "groups",
]);

function normalizeIdentityDetailsBlock(
  block: AtlasBlock,
  requiredRows: typeof profileRows | typeof overviewRows,
): AtlasBlock {
  if (block.type !== "detailsList" || !Array.isArray(block.props.rows)) return block;

  const customRows = block.props.rows.filter((row) => {
    if (!row || typeof row !== "object") return true;
    const detail = row as { value?: unknown };
    return typeof detail.value !== "string" || !identityRowPaths.has(detail.value);
  });

  return {
    ...block,
    props: {
      ...block.props,
      rows: [...requiredRows, ...customRows],
    },
  };
}

function isGroupsSection(section: AtlasSection): boolean {
  if (hasClass(section, "npc-groups-organizations")) return true;
  const title = normalizedTitle(section.title);
  return title === "groups" || title === "groups and organizations" || title === "organizations";
}

function normalizeIdentitySection(section: AtlasSection): AtlasSection {
  if (hasClass(section, "npc-profile")) {
    return {
      ...section,
      blocks: section.blocks.map((block) =>
        normalizeIdentityDetailsBlock(block, profileRows),
      ),
    };
  }

  if (hasClass(section, "npc-overview")) {
    return {
      ...section,
      blocks: section.blocks.map((block) =>
        normalizeIdentityDetailsBlock(block, overviewRows),
      ),
    };
  }

  return section;
}

/**
 * Ensures all structured NPC presentation features live inside the Atlas document.
 * Existing NPC content is enriched at render/edit time and persisted on the next save.
 */
export function ensureNPCAtlasSystemSections(content: AtlasContent, entity?: TLNPC): AtlasContent {
  if (content.source.type !== "npc") return content;
  const next = content;
  const sections = next.sections.reduce<AtlasSection[]>((result, section) => {
    if (hasClass(section, "npc-relationships")) return result;

    const title = normalizedTitle(section.title);
    if (title === "relationships and acquaintances" || title === "relationships") {
      return result;
    }

    result.push(normalizeIdentitySection(section));
    return result;
  }, []);

  const filteredContent = { ...next, sections };
  if (!sections.some(isGroupsSection)) sections.push(groupsSection(entity));
  if (!hasBlock(filteredContent, "npc-current-location")) sections.push(currentLocationSection());
  if (!hasBlock(filteredContent, "npc-relationship-graph")) sections.push(relationshipGraphSection());
  if (!hasBlock(filteredContent, "npc-history-timeline")) sections.push(historySection());

  return { ...next, sections };
}

export const npcAdapter: AtlasAdapter<"npc"> = {
  sourceType: "npc",
  label: "NPC",
  defaultLayout: "content-grid",
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.fullName || entity.name,
  createDefaultContent: createNPCContent,
  sectionPresets: [
    ...commonSectionPresets<"npc">(),
    { id: "npc-groups-organizations-section", label: "Groups & Organizations", description: "Editable NPC memberships such as guilds, academies, factions, and other organizations.", create: () => groupsSection() },
    { id: "npc-current-location-section", label: "Current Location", description: "Structured current-location link backed by the NPC entity.", create: () => currentLocationSection() },
    { id: "npc-relationship-graph-section", label: "Relationship Graph", description: "Compact relationship graph backed by structured NPC relationships.", create: () => relationshipGraphSection() },
    { id: "npc-history-section", label: "History", description: "Compact history timeline backed by structured NPC history entries.", create: () => historySection() },
  ],
  blockPresets: [
    ...commonBlockPresets<"npc">(),
    { id: "npc-current-location-block", label: "Current Location", description: "Render the NPC's structured current location.", create: () => npcCurrentLocationBlock() },
    { id: "npc-relationship-graph-block", label: "Relationship Graph", description: "Render the compact structured relationship graph.", create: () => npcRelationshipGraphBlock() },
    { id: "npc-history-timeline-block", label: "History Timeline", description: "Render the compact structured NPC history timeline.", create: () => npcHistoryTimelineBlock() },
  ],
};
