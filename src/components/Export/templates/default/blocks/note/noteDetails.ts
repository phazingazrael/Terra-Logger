import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasNoteBodyToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { readString } from "../../../../builder/markdownUtils";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const noteDetailsTemplateBlock = createMustacheMarkdownBlock({
  id: "default.note.noteDetails.template",
  template: `## Note Details
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

    return noteDetailsTemplateBlock.render({
      ...context,
      entity: {
        ...context.entity,
        legend,
      },
    });
  },
};
