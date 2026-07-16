import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { markdownHeading, readString } from "../../../../builder/markdownUtils";

export function createDefaultTitleBlock(id: string): MarkdownBlock {
  return {
    id,

    render({ entity, sourceType }) {
      const title =
        readString(entity, "name") ||
        readString(entity, "nameFull") ||
        readString(entity, "title") ||
        sourceType;

      return markdownHeading(1, title);
    },
  };
}
