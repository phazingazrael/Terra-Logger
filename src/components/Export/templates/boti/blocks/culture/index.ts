import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiCultureFrontmatterBlock } from "./frontmatter";
import { botiCultureInfoboxBlock } from "./infobox";
import { botiCultureMainContentBlock } from "./mainContent";

export function getBotiCultureBlocks(): MarkdownBlock[] {
	return [
		botiCultureFrontmatterBlock,
		botiCultureInfoboxBlock,
		botiCultureMainContentBlock,
	];
}
