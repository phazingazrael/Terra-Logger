import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiNPCFrontmatterBlock } from "./frontmatter";
import { botiNPCInfoboxBlock } from "./infobox";
import { botiNPCMainContentBlock } from "./mainContent";
export function getBotiNPCBlocks(): MarkdownBlock[] { return [botiNPCFrontmatterBlock, botiNPCInfoboxBlock, botiNPCMainContentBlock]; }
