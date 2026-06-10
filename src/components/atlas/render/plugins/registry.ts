import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { cityBlockPlugins } from "./cityBlocks";
import { countryBlockPlugins } from "./countryBlocks";
import { cultureBlockPlugins } from "./cultureBlocks";
import { genericBlockPlugins } from "./genericBlocks";
import { noteBlockPlugins } from "./noteBlocks";
import { religionBlockPlugins } from "./religionBlocks";

export const atlasBlockPlugins: Record<string, AtlasBlockPlugin> = {
	...genericBlockPlugins,
	...cityBlockPlugins,
	...countryBlockPlugins,
	...cultureBlockPlugins,
	...religionBlockPlugins,
	...noteBlockPlugins,
};
