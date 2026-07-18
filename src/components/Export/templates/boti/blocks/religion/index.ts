import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiReligionFrontmatterBlock } from "./frontmatter";
import { botiReligionInfoboxBlock } from "./infobox";
import { botiReligionMainContentBlock } from "./mainContent";

export function getBotiReligionBlocks(): MarkdownBlock[] {
	return [
		botiReligionFrontmatterBlock,
		botiReligionInfoboxBlock,
		botiReligionMainContentBlock,
	];
}
