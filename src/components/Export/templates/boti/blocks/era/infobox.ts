import { renderBotiInfobox } from "../../../../builder/atlasContentMarkdown";
import type { MarkdownBlock } from "../../../../builder/exportTypes";

export const botiEraInfoboxBlock: MarkdownBlock = {
  id: "boti.era.infobox",
  render: renderBotiInfobox,
};
