import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { readString } from "../../../../builder/markdownUtils";

export const defaultMapFrontmatterBlock: MarkdownBlock = {
  id: "default.map.frontmatter",

  render({ entity }) {
    const name =
      readString(entity, "info.name") ||
      readString(entity, "settings.mapName") ||
      readString(entity, "name") ||
      readString(entity, "title");

    const lines = [
      "---",
      "type: map",
      name ? `name: ${quoteYamlString(name)}` : "",
      "---",
    ].filter(Boolean);

    return lines.join("\n");
  },
};

function quoteYamlString(value: string): string {
  return JSON.stringify(value);
}
