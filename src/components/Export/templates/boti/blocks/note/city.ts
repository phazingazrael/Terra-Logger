import { createBotiNoteTemplateBlock } from "./frontmatter";

export const botiNoteCityBlock = createBotiNoteTemplateBlock({
  id: "boti.note.city",
  banner: "[[City-Banner.jpg|150]]",
  type: "City",
  body: [
    "# `=this.Name` Description",
    "",
    "`=this.Content`",
  ],
});
