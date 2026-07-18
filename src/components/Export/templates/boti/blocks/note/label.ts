import { createBotiNoteTemplateBlock } from "./frontmatter";

export const botiNoteLabelBlock = createBotiNoteTemplateBlock({
  id: "boti.note.label",
  banner: "[[Lore-Banner.jpg]]",
  type: "Label",
  body: [
    "# `=this.Name` Details",
    "`=this.Content`",
  ],
});
