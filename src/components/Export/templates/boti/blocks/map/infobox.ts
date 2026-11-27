import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { markdownTable, readString, singleLineText } from "../../../../builder/markdownUtils";

export const botiMapInfoboxBlock: MarkdownBlock = {
  id: "boti.map.infobox",
  render({ entity }) {
    const value = (path: string) => readString(entity, path) || "—";
    const aliases = Array.isArray(entity.aliases) ? entity.aliases.join(", ") : value("aliases");
    const rows = [
      ["Aliases", aliases], ["Type", "Map"],
      ["Width × Height", `${value("info.width")} × ${value("info.height")}`],
      ["Era (Year)", `${value("settings.options.era")} (${value("settings.options.year")})`],
      ["Version", value("info.ver")], ["Seed", value("info.seed")],
      ["Planet/Plane", readString(entity, "planetPlane") || value("PlanetPlane")],
    ];
    const body = [
      `# ${singleLineText(readString(entity, "settings.mapName") || value("info.name"))}`,
      `**Pronounced:** ${value("pronounced")}`,
      "![[PlaceholderImage.png]]", "###### Info",
      markdownTable(["", ""], rows.map(([label, item]) => [`**${label}**`, item])),
    ].join("\n\n");
    return `> [!infobox]\n${body.split("\n").map((line) => line ? `> ${line}` : "> ").join("\n")}`;
  },
};
