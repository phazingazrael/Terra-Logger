import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultMapMilitaryOverviewBlock = createMustacheMarkdownBlock({
  id: "default.map.militaryOverview",
  template: `## Military Overview
The country maintains multiple types of military forces, each adapted to rural or urban environments with different crew and power levels.

| Icon | Unit Type | Rural Presence | Urban Presence | Crew | Power | Category | Separate? |
|------|-----------|----------------|----------------|------|-------|---------|-----------|
{{#settings.options.militaryTypes}}
| {{icon}} | {{name}} | {{rural}} | {{urban}} | {{crew}} | {{power}} | {{type}} | {{#separate}}Yes{{/separate}}{{^separate}}No{{/separate}} |
{{/settings.options.militaryTypes}}`,
});
