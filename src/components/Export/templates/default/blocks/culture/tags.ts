import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCultureTagsBlock = createMustacheMarkdownBlock({
  id: "default.culture.tags",
  template: `## Tags
{{#tags}}
- **{{Name}}** ({{Type}}) {{#Default}}— _Default_{{/Default}}
  - {{Description}}
{{/tags}}
{{^tags}}
- _No tags_
{{/tags}}`,
});
