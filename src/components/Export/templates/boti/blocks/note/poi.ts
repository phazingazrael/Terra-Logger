import { readString } from "../../../../builder/markdownUtils";
import { createBotiNoteTemplateBlock } from "./frontmatter";

export const botiNotePoiBlock = createBotiNoteTemplateBlock({
  id: "boti.note.poi",
  banner: "[[POI-Banner.jpg]]",
  type: "Point of Interest",
  noteIcon: "Note",

  extraFields(entity) {
    return [
      { key: "Category", value: readString(entity, "Category") },
      { key: "Significance", value: readString(entity, "Significance") },
      { key: "Hazard", value: readString(entity, "Hazard") },
      { key: "Access", value: readString(entity, "Access") },
      { key: "Owner", value: readString(entity, "Owner") },
      { key: "Condition", value: readString(entity, "Condition") },
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
    "> **Category** | `=this.Category` |",
    "> **Significance** | `=this.Significance` |",
    "> **Hazard** | `=this.Hazard` |",
    "> **Access** | `=this.Access` |",
    "> **Owner** | `=this.Owner` |",
    "> **Condition** | `=this.Condition` |",
    "> **Last Seen** | `=this.LastSeen` |",
    "",
    "# `=this.Name`",
    "",
    "> [!pois]- `=this.Name` Details",
    "> `=this.Content`",
  ],
});
