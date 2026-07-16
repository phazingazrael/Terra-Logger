import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultReligionOriginsBlock = createMustacheMarkdownBlock({
  id: "default.religion.origins",
  template: `## Origins
{{#origins}}
{{origin}}
{{/origins}}`,
});
