import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCultureOriginsBlock = createMustacheMarkdownBlock({
  id: "default.culture.origins",
  template: `## Origins
{{#origins}}
- {{.}}
{{/origins}}
{{^origins}}
- _No origins listed_
{{/origins}}`,
});
