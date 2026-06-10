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
          { label: "Deity", value: "deity", valueMode: "entity" },
        ]),
        richTextBlock("Add additional details here."),
      ]),
      sectionPreset("Beliefs & Practices", "section beliefs-practices", [richTextBlock("Add beliefs and practices here.")]),
      sectionPreset("Origins & Mythology", "section origins-mythology", [
        entityChipListBlock("Origins", "origins"),
        richTextBlock("Add mythology and origin stories here."),
      ]),
      sectionPreset("Tags", "section tags", [computedBlock("largeTags", "Tags", "tags")], clear),
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
