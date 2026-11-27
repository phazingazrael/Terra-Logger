import { renderBotiInfobox } from "../../../../builder/atlasContentMarkdown";
import type { MarkdownBlock } from "../../../../builder/exportTypes";

export const botiCountryInfoboxBlock: MarkdownBlock = {
  id: "boti.country.infobox",
  render: renderBotiInfobox,
};
