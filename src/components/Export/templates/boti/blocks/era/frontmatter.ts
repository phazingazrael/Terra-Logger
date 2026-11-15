import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { readString } from "../../../../builder/markdownUtils";

export const botiEraFrontmatterBlock: MarkdownBlock = {
  id: "boti.era.frontmatter",
  render: ({ entity }) => [
    "---",
    'BANNER: "[[Lore-Banner.jpg]]"',
    "NoteIcon: Lore",
    `Name: ${JSON.stringify(readString(entity, "name"))}`,
    "Type: Era",
    `ShortName: ${JSON.stringify(readString(entity, "shortName"))}`,
    `Status: ${JSON.stringify(readString(entity, "status"))}`,
    `FirstYear: ${entity.firstYear}`,
    `FinalYear: ${entity.finalYear}`,
    `Length: ${entity.length}`,
    "tags: []",
    "---",
  ].join("\n"),
};
