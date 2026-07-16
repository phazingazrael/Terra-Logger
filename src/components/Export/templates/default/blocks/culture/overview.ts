import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCultureOverviewBlock = createMustacheMarkdownBlock({
  id: "default.culture.overview",
  template: `## Overview
- **Expansionism:** {{expansionism}}
- **Color (hex):** {{color}}`,
});
