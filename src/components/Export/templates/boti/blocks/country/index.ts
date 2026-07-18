import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { botiCountryFrontmatterBlock } from "./frontmatter";
import { botiCountryInfoboxBlock } from "./infobox";
import { botiCountryMainContentBlock } from "./mainContent";

export function getBotiCountryBlocks(): MarkdownBlock[] {
  return [
    botiCountryFrontmatterBlock,
    botiCountryInfoboxBlock,
    botiCountryMainContentBlock,
  ];
}
