import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCultureTitleBlock = createMustacheMarkdownBlock({
  id: "default.culture.title",
  template: `# {{name}}`,
});
