import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultMapUrbanPopulationSettingsBlock = createMustacheMarkdownBlock({
  id: "default.map.urbanPopulationSettings",
  template: `## Urban & Population Settings
- **Urbanization:** {{settings.urbanization}} (scale of 1-10)
- **Population Rate:** {{settings.populationRate}}
- **Urban Density:** {{settings.urbanDensity}}
- **Pin Notes Enabled:** {{#settings.options.pinNotes}}Yes{{/settings.options.pinNotes}}{{^settings.options.pinNotes}}No{{/settings.options.pinNotes}}`,
});
