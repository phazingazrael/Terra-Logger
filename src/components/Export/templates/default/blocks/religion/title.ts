import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultReligionTitleBlock = createMustacheMarkdownBlock({
  id: "default.religion.title",
  template: `# {{name}}`,
});
