import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiEraFrontmatterBlock } from "./frontmatter";
import { botiEraInfoboxBlock } from "./infobox";
import { botiEraMainContentBlock } from "./mainContent";

export function getBotiEraBlocks(): MarkdownBlock[] {
  return [botiEraFrontmatterBlock, botiEraInfoboxBlock, botiEraMainContentBlock];
}
