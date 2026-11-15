import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { readString } from "../../../../builder/markdownUtils";
import { getNoteCategory } from "../../../../../atlas/adapters/noteAdapter";
import type { TLNote } from "../../../../../../definitions/TerraLogger";

export const defaultFrontmatterBlock: MarkdownBlock = {
  id: "default.frontmatter",

  render({ entity, sourceType }) {
    const name =
      readString(entity, "name") ||
      readString(entity, "nameFull") ||
      readString(entity, "title");

    const id = readString(entity, "_id") || readString(entity, "id");
    const category = sourceType === "note" ? getNoteCategory(entity as TLNote) : undefined;
    const isTravelNote = category?.id === "journey" ||
      category?.id === "route" || category?.id.startsWith("route:");



    const lines = [
      "---",
      `type: ${sourceType}`,
      isTravelNote && category ? `note_type: ${quoteYamlString(category.label)}` : "",
      isTravelNote ? `source_note_id: ${quoteYamlString(readString(entity, "id"))}` : "",
      name ? `name: ${quoteYamlString(name)}` : "",
      id ? `terra_id: ${quoteYamlString(id)}` : "",
      "---",
    ].filter(Boolean);

    return lines.join("\n");
  },
};

function quoteYamlString(value: string): string {
  return JSON.stringify(value);
}
