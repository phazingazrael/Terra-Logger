import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import type { TLMapEra } from "../../../definitions/History";
import { clear, computedBlock, createContentShell, descriptionBlock, entitySection, richTextBlock, sectionPreset } from "../core/presets";
import { commonBlockPresets, commonSectionPresets } from "./shared";

function createEraContent(era: TLMapEra): AtlasContent {
  return createContentShell({
    sourceType: "era", entityId: era.id, mapId: era.mapId, title: era.name,
    sections: [
      entitySection("Header", "section header", [computedBlock("eraHeader", "Era", "era.header")], { ...clear, wrapper: { ...clear.wrapper, gridSpan: "full" } }),
      entitySection("Overview", "section description", [descriptionBlock("Era description")], { wrapper: { gridSpan: "full" } }),
      entitySection("Chronology", "section era-chronology", [computedBlock("eraChronology", "Chronology", "era.chronology")]),
      sectionPreset("Notable Events", "section notable-events", [richTextBlock("")]),
      sectionPreset("Notes", "section editor-notes", [richTextBlock("")]),
    ],
  });
}

export const eraAdapter: AtlasAdapter<"era"> = {
  sourceType: "era", label: "Era", defaultLayout: "content-grid",
  resizableSectionClasses: ["era-chronology", "notable-events", "editor-notes", "freeform", "details"],
  getEntityId: (era) => era.id,
  getEntityTitle: (era) => era.name,
  createDefaultContent: createEraContent,
  sectionPresets: commonSectionPresets<"era">(),
  blockPresets: commonBlockPresets<"era">(),
};
