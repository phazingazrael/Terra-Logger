import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasSectionByLabelToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const fallbackBlock = createMustacheMarkdownBlock({
  id: "default.religion.originsAndMythology.fallback",
  template: `## Origins & Mythology
- _No origins or mythology listed_`,
});

export const defaultReligionOriginsAndMythologyBlock: MarkdownBlock = {
  id: "default.religion.originsAndMythology",

  render(context) {
    const atlasSection = renderAtlasSectionByLabelToMarkdown({
      entity: context.entity,
      sourceType: "religion",
      data: context.data,
      labels: [
        "origins & mythology",
        "origins and mythology",
        "origins mythology",
      ],
      headingLevel: 2,
    });

    return atlasSection || fallbackBlock.render(context);
  },
};
