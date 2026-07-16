import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasSectionByLabelToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const fallbackBlock = createMustacheMarkdownBlock({
  id: "default.religion.beliefsAndPractices.fallback",
  template: `## Beliefs & Practices
- _No beliefs or practices listed_`,
});

export const defaultReligionBeliefsAndPracticesBlock: MarkdownBlock = {
  id: "default.religion.beliefsAndPractices",

  render(context) {
    const atlasSection = renderAtlasSectionByLabelToMarkdown({
      entity: context.entity,
      sourceType: "religion",
      data: context.data,
      labels: [
        "beliefs & practices",
        "beliefs and practices",
        "beliefs practices",
      ],
      headingLevel: 2,
    });

    return atlasSection || fallbackBlock.render(context);
  },
};
