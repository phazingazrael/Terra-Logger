import { renderBotiInfobox } from "../../../../builder/atlasContentMarkdown";
import type { MarkdownBlock } from "../../../../builder/exportTypes";

export const botiNPCInfoboxBlock: MarkdownBlock = {
  id: "boti.npc.infobox",
  render: renderBotiInfobox,
};
