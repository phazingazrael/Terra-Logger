import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { eraBlockPlugins } from "./eraBlocks";
import { cityBlockPlugins } from "./cityBlocks";
import { countryBlockPlugins } from "./countryBlocks";
import { cultureBlockPlugins } from "./cultureBlocks";
import { genericBlockPlugins } from "./genericBlocks";
import { noteBlockPlugins } from "./noteBlocks";
import { npcBlockPlugins } from "./npcBlocks";
import { religionBlockPlugins } from "./religionBlocks";

export const atlasBlockPlugins: Record<string, AtlasBlockPlugin> = {
	...genericBlockPlugins,
	...eraBlockPlugins,
	...cityBlockPlugins,
	...countryBlockPlugins,
	...cultureBlockPlugins,
	...religionBlockPlugins,
	...noteBlockPlugins,
	...npcBlockPlugins,
};
