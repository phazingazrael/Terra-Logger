import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasNoteBodyToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { readString } from "../../../../builder/markdownUtils";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";
import { getNoteCategory } from "../../../../../atlas/adapters/noteAdapter";
import type { TLNote } from "../../../../../../definitions/TerraLogger";

const noteDetailsTemplateBlock = createMustacheMarkdownBlock({
  id: "default.note.noteDetails.template",
  template: `## {{noteDetailsLabel}}
{{legend}}`,
});

export const defaultNoteDetailsBlock: MarkdownBlock = {
  id: "default.note.noteDetails",

  render(context) {
    const legend =
      renderAtlasNoteBodyToMarkdown(context.entity) ||
      readString(context.entity, "legend") ||
      readString(context.entity, "description");

    if (!legend) return "";

    const category = getNoteCategory(context.entity as TLNote);
    const isTravelNote = category.id === "journey" ||
      category.id === "route" || category.id.startsWith("route:");

    return noteDetailsTemplateBlock.render({
      ...context,
      entity: {
        ...context.entity,
        noteDetailsLabel: isTravelNote ? `${category.label} Details` : "Note Details",
        legend,
      },
    });
  },
};
