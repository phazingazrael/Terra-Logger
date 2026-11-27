import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { markdownHeading } from "../../../../builder/markdownUtils";
import { renderExportTagTable } from "../../../../builder/atlasContentMarkdown";

export function createDefaultTagsBlock(id: string): MarkdownBlock {
  return {
    id,
    render({ entity }) {
      const table = renderExportTagTable(entity.tags);
      return table ? [markdownHeading(2, "Tags"), table].join("\n\n") : "";
    },
  };
}
