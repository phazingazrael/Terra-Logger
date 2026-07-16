import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCultureIdentityBlock = createMustacheMarkdownBlock({
  id: "default.culture.identity",
  template: `**Type:** {{type}}
**ID:** {{id}}`,
});
