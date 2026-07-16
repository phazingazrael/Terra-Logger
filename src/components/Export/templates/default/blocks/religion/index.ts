import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { defaultReligionBeliefsAndPracticesBlock } from "./beliefsAndPractices";
import { defaultReligionDescriptionBlock } from "./description";
import { defaultReligionGeneralInformationBlock } from "./generalInformation";
import { defaultReligionMembersBlock } from "./members";
import { defaultReligionOriginsBlock } from "./origins";
import { defaultReligionOriginsAndMythologyBlock } from "./originsAndMythology";
import { defaultReligionTagsBlock } from "./tags";
import { createDefaultTitleBlock } from "../universal/title";
import { createDefaultDescriptionBlock } from "../universal/description";
import { defaultFrontmatterBlock } from "../universal/frontmatter";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";

export function getDefaultReligionBlocks(): MarkdownBlock[] {
  return [
    defaultFrontmatterBlock,
    createDefaultTitleBlock("default.religion.title"),
    defaultReligionGeneralInformationBlock,
    createDefaultDescriptionBlock({
      id: "default.religion.description",
      sourceType: "religion",
    }),
    defaultReligionDescriptionBlock,
    defaultReligionMembersBlock,
    defaultReligionOriginsBlock,
    defaultReligionBeliefsAndPracticesBlock,
    defaultReligionOriginsAndMythologyBlock,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.religion.customAtlasSections",
      sourceType: "religion",
      handledSectionLabels: [
        "Header",
        "Overview",
        "Membership",
        "Description",
        "Origins",
        "Beliefs & Practices",
        "Origins & Mythology",
        "Tags",
      ],
      handledSectionClassNames: [
        "section header",
        "section overview",
        "section membership",
        "section description",
        "section origins",
        "section beliefs-practices",
        "section origins-mythology",
        "section tags",
      ],
    }),
    defaultReligionTagsBlock,
  ];
}
