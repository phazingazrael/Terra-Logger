import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultReligionDescriptionBlock = createMustacheMarkdownBlock({
  id: "default.religion.description",
  template: `## Description
{{description}}`,
});
