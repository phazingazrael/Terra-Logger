import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultMapClimateEnvironmentBlock = createMustacheMarkdownBlock({
  id: "default.map.climateEnvironment",
  template: `## Climate & Environment
- **Equator Temperature:** {{settings.options.temperatureEquator}}°F
- **North Pole Temperature:** {{settings.options.temperatureNorthPole}}°F
- **South Pole Temperature:** {{settings.options.temperatureSouthPole}}°F
- **Winds:** {{#settings.options.winds}}{{.}}°, {{/settings.options.winds}}
- **State Labels Mode:** {{settings.options.stateLabelsMode}}`,
});
