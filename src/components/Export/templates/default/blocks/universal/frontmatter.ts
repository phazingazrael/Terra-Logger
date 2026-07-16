import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { readString } from "../../../../builder/markdownUtils";

export const defaultFrontmatterBlock: MarkdownBlock = {
  id: "default.frontmatter",

  render({ entity, sourceType }) {
    const name =
      readString(entity, "name") ||
      readString(entity, "nameFull") ||
      readString(entity, "title");

    const id = readString(entity, "_id") || readString(entity, "id");



    const lines = [
      "---",
      `type: ${sourceType}`,
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
