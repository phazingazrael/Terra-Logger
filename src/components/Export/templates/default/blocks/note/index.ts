import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";
import { defaultFrontmatterBlock } from "../universal/frontmatter";
import { createDefaultTagsBlock } from "../universal/tags";
import { createDefaultTitleBlock } from "../universal/title";
import { defaultEditorNotesBlock } from "./editorNotes";
import { defaultNoteDetailsBlock } from "./noteDetails";

export function getDefaultNoteBlocks(): MarkdownBlock[] {
  return [
    defaultFrontmatterBlock,
    createDefaultTitleBlock("default.note.title"),
    defaultNoteDetailsBlock,
    defaultEditorNotesBlock,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.note.customAtlasSections",
      sourceType: "note",
      handledSectionLabels: [
        "Header",
        "Note Body",
        "Note Details",
        "Description",
        "Editor Notes",
        "Tags",
      ],
      handledSectionClassNames: [
        "section header",
        "section note-legend",
        "section note-body",
        "section note-details",
        "section description",
        "section editor-notes",
        "section tags",
      ],
    }),
    createDefaultTagsBlock("default.note.tags"),
  ];
}
