import { renderBotiInfobox } from "../../../../builder/atlasContentMarkdown";
import type { MarkdownBlock } from "../../../../builder/exportTypes";

export const botiCityInfoboxBlock: MarkdownBlock = {
  id: "boti.city.infobox",
  render: renderBotiInfobox,
};
