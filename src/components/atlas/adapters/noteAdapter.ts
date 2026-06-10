import type { TLNote } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { clear, computedBlock, createContentShell, entitySection, richTextBlock, sectionPreset } from "../core/presets";

function createNoteContent(entity: TLNote): AtlasContent {
  return createContentShell({
    sourceType: "note",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.name,
    layout: "stack",
    className: "content-stack",
    sections: [
      entitySection("Imported Note", "section note-legend", [computedBlock("noteLegend", "Note Body", "note.legend")]),
      sectionPreset("Editor Notes", "section editor-notes", [richTextBlock("Add your notes here.")]),
      sectionPreset("Tags", "section tags", [computedBlock("largeTags", "Tags", "tags")], clear),
      // entitySection("Metadata", "section metadata", [
      //   entityFieldBlock("Type", "type"),
      //   entityFieldBlock("Original ID", "id"),
      // ]),
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
