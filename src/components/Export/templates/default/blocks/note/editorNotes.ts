import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasNoteEditorNotesToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { markdownHeading } from "../../../../builder/markdownUtils";

export const defaultEditorNotesBlock: MarkdownBlock = {
  id: "default.note.editorNotes",

  render({ entity }) {
    const editorNotes = renderAtlasNoteEditorNotesToMarkdown(entity).trim();

    if (!editorNotes) return "";

    if (editorNotes.toLowerCase() === "add your notes here.") {
      return "";
    }

    return [markdownHeading(2, "Editor Notes"), editorNotes].join("\n\n");
  },
};
