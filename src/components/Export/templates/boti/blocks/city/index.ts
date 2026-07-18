import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiCityFrontmatterBlock } from "./frontmatter";
import { botiCityInfoboxBlock } from "./infobox";
import { botiCityMainContentBlock } from "./mainContent";

export function getBotiCityBlocks(): MarkdownBlock[] {
	return [
		botiCityFrontmatterBlock,
		botiCityInfoboxBlock,
		botiCityMainContentBlock,
	];
}
