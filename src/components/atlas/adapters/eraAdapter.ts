import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import type { TLMapEra } from "../../../definitions/History";
import { clear, computedBlock, createContentShell, descriptionBlock, entitySection, richTextBlock, sectionPreset } from "../core/presets";
import { commonBlockPresets, commonSectionPresets } from "./shared";

function createEraContent(era: TLMapEra): AtlasContent {
  return createContentShell({
    sourceType: "era", entityId: era._id, mapId: era.mapId, title: era.name,
    sections: [
      entitySection("Header", "section header", [computedBlock("eraHeader", "Era", "era.header")], { ...clear, wrapper: { ...clear.wrapper, gridSpan: "full" } }),
      entitySection("Overview", "section description", [descriptionBlock("Era description")], { wrapper: { gridSpan: "full" } }),
      entitySection("Chronology", "section era-chronology", [computedBlock("eraChronology", "Chronology", "era.chronology")]),
      sectionPreset("Notable Events", "section notable-events", [computedBlock("eraTimeline", "Notable Events", "era.events")]),
      sectionPreset("Notes", "section editor-notes", [richTextBlock("")]),
    ],
  });
}

// Add the timeline to existing event sections without discarding authored rich text.
export function ensureEraTimeline(content: AtlasContent): AtlasContent {
  if (content.sections.some((section) => section.blocks.some((block) => block.type === "eraTimeline"))) return content;
  const target = content.sections.find((section) => section.title.trim().toLowerCase() === "notable events" ||
    (section.wrapper.className ?? "").split(/\s+/).includes("notable-events"));
  if (!target) return content;
  return { ...content, sections: content.sections.map((section) => section === target
    ? { ...section, blocks: [computedBlock("eraTimeline", "Notable Events", "era.events"), ...section.blocks] } : section) };
}

export const eraAdapter: AtlasAdapter<"era"> = {
  sourceType: "era", label: "Era", defaultLayout: "content-grid",
  resizableSectionClasses: ["era-chronology", "notable-events", "editor-notes", "freeform", "details"],
  getEntityId: (era) => era._id,
  getEntityTitle: (era) => era.name,
  createDefaultContent: createEraContent,
  sectionPresets: [...commonSectionPresets<"era">(), {
    id: "era-notable-events", label: "Notable Events", description: "Manually ordered Era events and optional NPC history links.",
    create: () => sectionPreset("Notable Events", "section notable-events", [computedBlock("eraTimeline", "Notable Events", "era.events")]),
  }],
  blockPresets: [...commonBlockPresets<"era">(), {
    id: "era-timeline", label: "Era Timeline", description: "Editable, manually ordered notable events.",
    create: () => computedBlock("eraTimeline", "Notable Events", "era.events"),
  }],
};
