import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderEntityDescriptionToMarkdown } from "../../../../builder/atlasContentMarkdown";

export const defaultCultureDescriptionBlock: MarkdownBlock = {
  id: "default.culture.description",

  render(context) {
    return renderEntityDescriptionToMarkdown({
      entity: context.entity,
      sourceType: "culture",
      data: context.data,
    });
  },
};
