import { createBotiNoteTemplateBlock } from "./frontmatter";

export const botiNoteCountryBlock = createBotiNoteTemplateBlock({
  id: "boti.note.country",
  banner: "[[Country-Banner.png|-100]]",
  type: "Country",
  body: [
    "# `=this.Name` Details",
    "",
    "`=this.Content`",
  ],
});
