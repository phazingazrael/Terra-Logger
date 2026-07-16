import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCulturePopulationBlock = createMustacheMarkdownBlock({
  id: "default.culture.population",
  template: `## Population
- **Urban Population:** {{urbanPop}}
- **Rural Population:** {{ruralPop}}`,
});
