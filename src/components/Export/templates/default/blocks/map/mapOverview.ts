import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultMapOverviewBlock = createMustacheMarkdownBlock({
  id: "default.map.mapOverview",
  template: `## Map Overview
- **Map ID:** {{id}}
- **Seed:** {{info.seed}}
- **Dimensions:** {{info.width}} × {{info.height}}
- **Version:** {{info.ver}}
- **Year:** {{settings.options.year}}
- **Era:** {{settings.options.era}} ({{settings.options.eraShort}})`,
});
