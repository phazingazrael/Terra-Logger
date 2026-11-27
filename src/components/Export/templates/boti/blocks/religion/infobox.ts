import { renderBotiInfobox } from "../../../../builder/atlasContentMarkdown";
import type { MarkdownBlock } from "../../../../builder/exportTypes";

export const botiReligionInfoboxBlock: MarkdownBlock = {
  id: "boti.religion.infobox",
  render: renderBotiInfobox,
};
