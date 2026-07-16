import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasNoteEditorNotesToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { markdownHeading } from "../../../../builder/markdownUtils";

const PLACEHOLDER_EDITOR_NOTES = new Set([
  "add your notes here.",
]);

export const defaultEditorNotesBlock: MarkdownBlock = {
  id: "default.note.editorNotes",

  render({ entity }) {
    const editorNotes = renderAtlasNoteEditorNotesToMarkdown(entity).trim();

    if (!editorNotes) return "";

    if (PLACEHOLDER_EDITOR_NOTES.has(editorNotes.toLowerCase())) {
      return "";
    }

    return [markdownHeading(2, "Editor Notes"), editorNotes].join("\n\n");
  },
};
