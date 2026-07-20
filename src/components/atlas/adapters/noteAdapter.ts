import type { TLNote } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { clear, computedBlock, createContentShell, entitySection, richTextBlock, sectionPreset, descriptionBlock } from "../core/presets";

function createNoteContent(entity: TLNote): AtlasContent {
  return createContentShell({
    sourceType: "note",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.name,
    layout: "stack",
    className: "content-stack",
    sections: [
      sectionPreset("Header", "section header", [computedBlock("noteHeader", "header", "note")], clear),
      entitySection("Note Body", "section note-legend", [descriptionBlock("Note Body")]),
      sectionPreset("Editor Notes", "section editor-notes", [richTextBlock("Add your notes here.")]),
      sectionPreset("Tags", "section tags", [computedBlock("largeTags", "Tags", "tags")], clear),
    ],
  });
}

export const noteAdapter: AtlasAdapter<"note"> = {
  sourceType: "note",
  label: "Note",
  defaultLayout: "stack",
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.name,
  createDefaultContent: createNoteContent,
  sectionPresets: commonSectionPresets<"note">(),
  blockPresets: commonBlockPresets<"note">(),
};
