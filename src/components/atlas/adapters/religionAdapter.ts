import type { TLReligion } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { clear, computedBlock, createContentShell, detailsListBlock, entityChipListBlock, entitySection, richTextBlock, sectionPreset } from "../core/presets";

function createReligionContent(entity: TLReligion): AtlasContent {
  return createContentShell({
    sourceType: "religion",
    entityId: entity._id,
    mapId: undefined,
    title: entity.name,
    layout: "content-grid",
    className: "content-grid",
    sections: [
      entitySection("Header", "section header", [computedBlock("religionHeader", "header", "religion")], clear),
      entitySection("Membership", "section membership", [computedBlock("populationBlock", "Membership", "religion")], clear),
      sectionPreset("Overview", "section overview", [
        detailsListBlock([
          { label: "Type", value: "type", valueMode: "entity" },
          { label: "Form", value: "form", valueMode: "entity" },
          { label: "Primary Deity", value: "deity", valueMode: "entity" },
        ]),
        richTextBlock("Add a high-level summary of the faith and its core identity here."),
      ]),

      sectionPreset("Doctrine & Beliefs", "section doctrine-beliefs", [
        detailsListBlock([
          { label: "Deities / Domains", value: "[Deities, domains, tenets, prohibitions, and key rituals.]" },
          { label: "Tenets", value: "[Core teachings, obligations, and values.]" },
          { label: "Prohibitions", value: "[Taboos, sins, forbidden acts, and theological boundaries.]" },
          { label: "Key Rituals", value: "[Common ceremonies, rites, sacrifices, prayers, or observances.]" },
        ]),
        richTextBlock("Add doctrine and belief details here."),
      ]),
      sectionPreset("Holy Days & Observances", "section holy-days-observances", [
        richTextBlock("Add festivals, fasts, weekly rites, seasonal ceremonies, and observances here."),
      ]),
      sectionPreset("Organization & Sects", "section organization-sects", [
        richTextBlock("Add clergy ranks, orders, councils, schisms, and sects here."),
      ]),
      sectionPreset("Temples & Sacred Sites", "section temples-sacred-sites", [
        richTextBlock("Add major shrines, holy cities, pilgrimage routes, and sacred sites here."),
      ]),
      sectionPreset("Relics & Iconography", "section relics-iconography", [
        richTextBlock("Add sacred artifacts, symbols, colors, vestments, and iconography here."),
      ]),
      sectionPreset("Origins & Growth", "section origins-growth", [
        entityChipListBlock("Origins", "origins"),
        richTextBlock("Add founding myths, historical turning points, reforms, and growth here."),
      ]),
      sectionPreset("Spread & Influence", "section spread-influence", [
        richTextBlock("Add where it is practiced, allies, rivals, and cultural influence here."),
      ]),
      sectionPreset("Myths & Stories", "section myths-stories", [
        richTextBlock("Add creation tales, saintly legends, miracle accounts, and religious stories here."),
      ]),
      sectionPreset("Heresies & Whispered Claims", "section heresies-whispered-claims", [
        richTextBlock("Add controversial teachings, disputed miracles, hidden texts, and heresies here."),
      ]),
      sectionPreset("Secrets / GM Notes", "section secrets-gm-notes", [
        richTextBlock("Add hidden doctrines, concealed agendas, forbidden rites, and GM-only notes here."),
      ]),
      sectionPreset("Notes", "section notes", [
        richTextBlock("Add extra notes or references here."),
      ]),
      sectionPreset("Tags", "section tags", [
        computedBlock("largeTags", "Tags", "tags")
      ], clear),
    ],
  });
}

export const religionAdapter: AtlasAdapter<"religion"> = {
  sourceType: "religion",
  label: "Religion",
  defaultLayout: "content-grid",
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.name,
  createDefaultContent: createReligionContent,
  sectionPresets: commonSectionPresets<"religion">(),
  blockPresets: commonBlockPresets<"religion">(),
};
