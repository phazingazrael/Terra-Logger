import type {
  ExportSourceType,
  MarkdownBlock,
} from "../../../../builder/exportTypes";
import { renderUnhandledAtlasSectionsToMarkdown } from "../../../../builder/atlasContentMarkdown";

export function createDefaultCustomAtlasSectionsBlock({
  id,
  sourceType,
  handledSectionLabels,
  handledSectionClassNames = [],
}: {
  id: string;
  sourceType: ExportSourceType;
  handledSectionLabels: string[];
  handledSectionClassNames?: string[];
}): MarkdownBlock {
  return {
    id,

    render(context) {
      return renderUnhandledAtlasSectionsToMarkdown({
        entity: context.entity,
        sourceType,
        data: context.data,
        handledSectionLabels,
        handledSectionClassNames,
        headingLevel: 2,
      });
    },
  };
}
