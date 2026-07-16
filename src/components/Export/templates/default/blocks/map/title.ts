import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultMapTitleBlock = createMustacheMarkdownBlock({
  id: "default.map.title",
  template: `# {{info.name}}
![[World Map.svg]]`,
});
