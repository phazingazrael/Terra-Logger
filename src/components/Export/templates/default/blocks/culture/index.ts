import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { defaultCultureArtsAndTraditionsBlock } from "./artsAndTraditions";
import { defaultCultureCustomsAndSocietyBlock } from "./customsAndSociety";
import { defaultCultureDividerBlock } from "./divider";
import { defaultCultureIdentityBlock } from "./identity";
import { defaultCultureOriginsBlock } from "./origins";
import { defaultCultureOverviewBlock } from "./overview";
import { defaultCulturePopulationBlock } from "./population";
import { defaultCultureTagsBlock } from "./tags";
import { createDefaultTitleBlock } from "../universal/title";
import { createDefaultDescriptionBlock } from "../universal/description";
import { defaultFrontmatterBlock } from "../universal/frontmatter";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";


export function getDefaultCultureBlocks(): MarkdownBlock[] {
  return [
    defaultFrontmatterBlock,
    createDefaultTitleBlock("default.culture.title"),
    defaultCultureIdentityBlock,
    defaultCultureDividerBlock,
    createDefaultDescriptionBlock({
      id: "default.culture.description",
      sourceType: "culture",
    }),
    defaultCultureOverviewBlock,
    defaultCulturePopulationBlock,
    defaultCultureOriginsBlock,
    defaultCultureCustomsAndSocietyBlock,
    defaultCultureArtsAndTraditionsBlock,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.culture.customAtlasSections",
      sourceType: "culture",
      handledSectionLabels: [
        "Header",
        "Population",
        "Description",
        "Origins",
        "Customs & Society",
        "Arts & Traditions",
        "Tags",
      ],
      handledSectionClassNames: [
        "section header",
        "section population",
        "section description",
        "section origins",
        "section customs-society",
        "section arts-traditions",
        "section tags",
      ],
    }),
    defaultCultureTagsBlock,
  ];
}
