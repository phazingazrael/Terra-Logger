import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultReligionTagsBlock = createMustacheMarkdownBlock({
  id: "default.religion.tags",
  template: `## Cultural & Religious Tags
{{#tags}}
### {{Name}}
- **Type:** {{Type}}
- **Default Tag:** {{#Default}}Yes{{/Default}}{{^Default}}No{{/Default}}
- **Description:** {{Description}}
{{/tags}}`,
});
