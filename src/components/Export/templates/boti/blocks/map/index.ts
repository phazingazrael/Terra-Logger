import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiMapAzgaarInfoBlock } from "./azgaarInfo";
import { botiMapFrontmatterBlock } from "./frontmatter";
import { botiMapInfoboxBlock } from "./infobox";
import { botiMapMainContentBlock } from "./mainContent";
import { botiMapMilitaryTypesBlock } from "./militaryTypes";
import { botiMapOptionsBlock } from "./options";

export function getBotiMapBlocks(): MarkdownBlock[] {
	return [
		botiMapFrontmatterBlock,
		botiMapInfoboxBlock,
		botiMapMainContentBlock,
		botiMapAzgaarInfoBlock,
		botiMapOptionsBlock,
		botiMapMilitaryTypesBlock,
	];
}
