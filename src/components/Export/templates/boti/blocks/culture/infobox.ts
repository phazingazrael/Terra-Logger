import { renderBotiInfobox } from "../../../../builder/atlasContentMarkdown";
import type { MarkdownBlock } from "../../../../builder/exportTypes";

export const botiCultureInfoboxBlock: MarkdownBlock = {
  id: "boti.culture.infobox",
  render: renderBotiInfobox,
};
