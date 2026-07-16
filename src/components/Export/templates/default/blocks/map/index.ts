import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { defaultMapClimateEnvironmentBlock } from "./climateEnvironment";
import { defaultMapFrontmatterBlock } from "./frontmatter";
import { defaultMapGeneralMapSettingsBlock } from "./generalMapSettings";
import { defaultMapOverviewBlock } from "./mapOverview";
import { defaultMapMilitaryOverviewBlock } from "./militaryOverview";
import { defaultMapTitleBlock } from "./title";
import { defaultMapUrbanPopulationSettingsBlock } from "./urbanPopulationSettings";

export function getDefaultMapBlocks(): MarkdownBlock[] {
  return [
    defaultMapFrontmatterBlock,
    defaultMapTitleBlock,
    defaultMapOverviewBlock,
    defaultMapGeneralMapSettingsBlock,
    defaultMapClimateEnvironmentBlock,
    defaultMapMilitaryOverviewBlock,
    defaultMapUrbanPopulationSettingsBlock,
  ];
}
