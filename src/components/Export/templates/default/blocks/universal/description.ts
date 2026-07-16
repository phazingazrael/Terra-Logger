import type {
  ExportSourceType,
  MarkdownBlock,
} from "../../../../builder/exportTypes";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";
import { renderEntityDescriptionBodyToMarkdown } from "../../../../builder/atlasContentMarkdown";

export function createDefaultDescriptionBlock({
  id,
  sourceType,
}: {
  id: string;
  sourceType: ExportSourceType;
}): MarkdownBlock {
  const fallbackBlock = createMustacheMarkdownBlock({
    id: `${id}.template`,
    template: `## Description
{{description}}`,
  });

  return {
    id,

    render(context) {
      const description = renderEntityDescriptionBodyToMarkdown({
        entity: context.entity,
        sourceType,
        data: context.data,
      });

      return fallbackBlock.render({
        ...context,
        entity: {
          ...context.entity,
          description,
        },
      });
    },
  };
}
