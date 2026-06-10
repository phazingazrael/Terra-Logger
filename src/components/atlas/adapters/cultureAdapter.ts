import type { TLCulture } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { computedBlock, createContentShell, clear, entitySection, richTextBlock, sectionPreset, descriptionBlock } from "../core/presets";

function createCultureContent(entity: TLCulture): AtlasContent {
  return createContentShell({
    sourceType: "culture",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.name,
    layout: "content-grid",
    className: "content-grid",
    sections: [
      entitySection("Header", "section header", [computedBlock("cultureHeader", "header", "culture")], clear),
      entitySection("Population", "section population", [computedBlock("populationBlock", "Population", "culture")], clear),
      entitySection("Description", "section description", [
        descriptionBlock(),
      ]),
      sectionPreset("Customs & Society", "section customs-society", [richTextBlock("Add customs, social institutions, and cultural notes here.")]),
      sectionPreset("Arts & Traditions", "section arts-traditions", [richTextBlock("Add art, language, dress, food, and tradition notes here.")]),
      sectionPreset("Origins", "section origins", [
        computedBlock("cultureOrigins", "Origins", "culture"),
      ]),
      sectionPreset("Tags", "section tags", [computedBlock("largeTags", "Tags", "culture.tags")], clear),
    ],
  });
}

export const cultureAdapter: AtlasAdapter<"culture"> = {
  sourceType: "culture",
  label: "Culture",
  defaultLayout: "content-grid",
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.name,
  createDefaultContent: createCultureContent,
  sectionPresets: commonSectionPresets<"culture">(),
  blockPresets: commonBlockPresets<"culture">(),
};
