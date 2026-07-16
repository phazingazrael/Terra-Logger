import type {
  ExportSourceType,
  MarkdownBlock,
  MarkdownDocumentTemplate,
} from "../../builder/exportTypes";
import { getDefaultCultureBlocks } from "./blocks/culture";
import { getDefaultReligionBlocks } from "./blocks/religion";
import { defaultFrontmatterBlock } from "./blocks/universal/frontmatter";
import { createDefaultTitleBlock } from "./blocks/universal/title";
import { getDefaultNoteBlocks } from "./blocks/note";
import { getDefaultCityBlocks } from "./blocks/city";
import { getDefaultCountryBlocks } from "./blocks/country";
import { getDefaultMapBlocks } from "./blocks/map";

export const defaultTemplate: MarkdownDocumentTemplate = {
  id: "default",
  label: "Default",

  getBlocks(sourceType: ExportSourceType): MarkdownBlock[] {
    switch (sourceType) {
      case "city":
        return getDefaultCityBlocks();
      case "country":
        return getDefaultCountryBlocks();
      case "culture":
        return getDefaultCultureBlocks();
      case "note":
        return getDefaultNoteBlocks();
      case "religion":
        return getDefaultReligionBlocks();
      case "map":
        return getDefaultMapBlocks();


      default:
        return [
          defaultFrontmatterBlock,
          createDefaultTitleBlock("Title"),
        ];
    }
  },
};
