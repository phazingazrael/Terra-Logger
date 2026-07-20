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
      entitySection("Description", "section description", [descriptionBlock(),]),
      sectionPreset("Overview", "section overview", [richTextBlock("Add a general description of this culture, its traits, and identity."),]),
      sectionPreset("Traditions & Customs", "section traditions-customs", [richTextBlock("Add festivals, social norms, etiquette, rites of passage, and customs here."),]),
      sectionPreset("Arts & Expression", "section arts-expression", [richTextBlock("Add music, dance, theatre, visual arts, literature, and architecture here."),]),
      sectionPreset("Daily Life", "section daily-life", [richTextBlock("Add dress, cuisine, values, everyday practices, and taboos here."),]),
      sectionPreset("History & Origins", "section history-origins", [computedBlock("cultureOrigins", "Origins", "culture"), richTextBlock("Add myths, legends, key events, eras, and dynasties here."),]),
      sectionPreset("Demographics", "section demographics", [richTextBlock("Add population trends, composition, languages, diaspora, and demographics here."),]),
      sectionPreset("Belief Systems", "section belief-systems", [richTextBlock("Add pantheons, rituals, sacred sites, factions, cults, and religious practices here."),]),
      sectionPreset("Governance & Law", "section governance-law", [richTextBlock("Add power structures, rulers, laws, justice, and corruption details here."),]),
      sectionPreset("External Relations", "section external-relations", [richTextBlock("Add neighbors, spread, alliances, rivalries, and legacy here."),]),
      sectionPreset("Rumors", "section rumors", [richTextBlock("Add whispers, gossip, and popular tales here."),]),
      sectionPreset("Secrets", "section secrets", [richTextBlock("Add hidden truths, forbidden practices, and concealed history here."),]),
      sectionPreset("Lore", "section lore", [richTextBlock("Add oral histories, philosophies, and enduring legends here."),]),
      sectionPreset("Customs & Society", "section customs-society", [richTextBlock("Add customs, social institutions, and cultural notes here.")]),
      sectionPreset("Arts & Traditions", "section arts-traditions", [richTextBlock("Add art, language, dress, food, and tradition notes here.")]),
      sectionPreset("Notes", "section notes", [richTextBlock("Add notes, to-dos, and references here."),]),
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
