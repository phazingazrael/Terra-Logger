import { readString } from "../../../../builder/markdownUtils";
import { createBotiNoteTemplateBlock } from "./frontmatter";

export const botiNoteMilitaryBlock = createBotiNoteTemplateBlock({
  id: "boti.note.military",
  banner: "[[Military-Banner.jpg]]",
  type: "Military",

  extraFields(entity) {
    return [
      { key: "Allegiance", value: readString(entity, "Allegiance") },
      { key: "Commander", value: readString(entity, "Commander") },
      { key: "Status", value: readString(entity, "Status") },
      { key: "LastSeen", value: readString(entity, "LastSeen") },
    ];
  },

  body: [
    "> [!infobox]",
    "> # `=this.Name`",
    "> ###### Info",
    ">  |",
    "> ---|---|",
    "> **Type** | `=this.Type` |",
    "> **Allegiance** | `=this.Allegiance` |",
    "> **Commander** | `=this.Commander` |",
    "> **Status** | `=this.Status` |",
    "> **Last Seen** | `=this.LastSeen` |",
    "",
    "# **`=this.Name`**",
    "",
    "> [!military]- `=this.Name` Details",
    "> `=this.Content`",
  ],
});
