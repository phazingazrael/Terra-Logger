import type { MapInf } from "../../../../../../definitions/TerraLogger";
import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { exportIcon, markdownTable } from "../../../../builder/markdownUtils";

export const botiMapMilitaryTypesBlock: MarkdownBlock = {
  id: "boti.map.militaryTypes",
  render(context) {
    const units = (context.entity as unknown as MapInf).settings?.options?.militaryTypes ?? [];
    return ["## Military Types", markdownTable(
      ["Icon", "Unit Type", "Rural Presence", "Urban Presence", "Crew", "Power", "Category", "Separate?"],
      units.map((unit) => [
        exportIcon(context, unit.icon, unit.name) || unit.icon, unit.name,
        String(unit.rural), String(unit.urban), String(unit.crew), String(unit.power),
        unit.type, unit.separate ? "Yes" : "No",
      ]),
    )].filter(Boolean).join("\n\n");
  },
};
