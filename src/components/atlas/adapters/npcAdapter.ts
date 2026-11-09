import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import type { TLNPC } from "../../../definitions/TerraLogger";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import {
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

function createNPCContent(entity: TLNPC): AtlasContent {
  return createContentShell({
    sourceType: "npc",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.fullName || entity.name,
    layout: "content-grid",
    className: "content-grid",
    sections: [
      entitySection("Profile", "section profile",
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
      entitySection("Overview", "section overview", [entityDetails([
        { label: "Race", value: "ancestry.name" },
        { label: "Heritage", value: "heritage" },
        { label: "Profession", value: "profession.name" },
        { label: "Current Residence", value: "currentLocation.name" },
        { label: "Religions", value: "religions" },
        { label: "Organizations", value: "groups" },
      ])]),
      entitySection("Appearance", "section appearance", [entityDetails([
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
      entitySection("Personality", "section personality", [entityDetails([
        { label: "Demeanor", value: "personality.demeanor" },
        { label: "Activities", value: "personality.activities" },
      ])]),
      entitySection("Background", "section background", [entityDetails([{ label: "Background", value: "background" }])]),
      entitySection("Aspirations & Motivations", "section aspirations", [entityDetails([{ label: "Aspirations & Motivations", value: "aspirationsMotivations" }])]),
      entitySection("Public Perception", "section public-perception", [entityDetails([{ label: "Public Perception", value: "publicPerception" }])]),
      entitySection("Groups & Organizations", "section groups-organizations",
        [entityChipListBlock("Groups & Organizations", "groups")]),
      sectionPreset("Notes", "section notes", [richTextBlock("Add NPC notes, reminders, secrets, and references here.")]),
      entitySection("Current Location", "section current-location",
        [npcCurrentLocationBlock()], systemSectionOptions),
      entitySection("Relationship Graph", "section relationship-graph",
        [npcRelationshipGraphBlock()], systemSectionOptions),
      entitySection("History", "section history",
        [npcHistoryTimelineBlock()], systemSectionOptions),
      entitySection("Hidden Details", "section hidden-details", [entityDetails([{ label: "Hidden Details", value: "hiddenDetails" }])]),
      entitySection("Tags", "section tags", [entityChipListBlock("Tags", "tags")]),
    ],
  });
}

export const npcAdapter: AtlasAdapter<"npc"> = {
  sourceType: "npc",
  label: "NPC",
  defaultLayout: "content-grid",
  resizableSectionClasses: [
    "aspirations",
    "background",
    "groups-organizations",
    "history",
    "public-perception",
    "relationship-graph",
    "notes",
    "hidden-details",
    "freeform",
  ],
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.fullName || entity.name,
  createDefaultContent: createNPCContent,
  sectionPresets: [
    ...commonSectionPresets<"npc">(),
    {
      id: "groups-organizations-section",
      label: "Groups & Organizations",
      description: "Editable NPC memberships such as guilds, academies, factions, and other organizations.",
      create: () => entitySection("Groups & Organizations", "section groups-organizations",
        [entityChipListBlock("Groups & Organizations", "groups")]),
    },
    {
      id: "current-location-section",
      label: "Current Location",
      description: "Structured current-location link backed by the NPC entity.",
      create: () => entitySection("Current Location", "section current-location",
        [npcCurrentLocationBlock()], systemSectionOptions),
    },
    {
      id: "relationship-graph-section",
      label: "Relationship Graph",
      description: "Compact relationship graph backed by structured NPC relationships.",
      create: () => entitySection("Relationship Graph", "section relationship-graph",
        [npcRelationshipGraphBlock()], systemSectionOptions),
    },
    {
      id: "history-section",
      label: "History",
      description: "Compact history timeline backed by structured NPC history entries.",
      create: () => entitySection("History", "section history",
        [npcHistoryTimelineBlock()], systemSectionOptions),
    },
  ],
  blockPresets: [
    ...commonBlockPresets<"npc">(),
    { id: "current-location-block", label: "Current Location", description: "Render the NPC's structured current location.", create: () => npcCurrentLocationBlock() },
    { id: "relationship-graph-block", label: "Relationship Graph", description: "Render the compact structured relationship graph.", create: () => npcRelationshipGraphBlock() },
    { id: "history-timeline-block", label: "History Timeline", description: "Render the compact structured NPC history timeline.", create: () => npcHistoryTimelineBlock() },
  ],
};
