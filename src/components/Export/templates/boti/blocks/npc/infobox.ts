import type { MarkdownBlock } from "../../../../builder/exportTypes";

import { getNPCExportPortraitPath } from "../../../../../NPC/portraits/export";

import type { TLNPC } from "../../../../../../definitions/TerraLogger";

const name = (value: unknown) => typeof value === "string" ? value : String((value as { name?: unknown })?.name ?? "—");

export const botiNPCInfoboxBlock: MarkdownBlock = {
  id: "boti.npc.infobox", render: ({ entity }) => {
    const image = getNPCExportPortraitPath(entity as unknown as TLNPC);
    return [
      `# ${String(entity.fullName ?? entity.name ?? "Unnamed NPC")}`,
      `> [!infobox]`,
      `> # ${String(entity.fullName ?? entity.name ?? "Unnamed NPC")}`,
      `> ![Portrait](${image})`,
      `> ## Bio`,
      `> | | |`, `> |---|---|`,
      `> | **Race** | ${name(entity.ancestry)} |`, `> | **Heritage** | ${String(entity.heritage ?? "—")} |`,
      `> | **Gender** | ${name(entity.gender)} |`, `> | **Age** | ${String(entity.age ?? "—")} |`,
      `> | **Pronouns** | ${Array.isArray(entity.pronouns) ? entity.pronouns.join("/") : "—"} |`,
      `> | **Sexuality** | ${String(entity.sexuality ?? "—")} |`,
      `> ## Info`,
      `> | | |`, `> |---|---|`,
      `> | **Occupation** | ${name(entity.profession)} |`, `> | **Alignment** | ${String(entity.alignment ?? "—")} |`,
      `> | **Condition** | ${String(entity.condition ?? "—")} |`, `> | **Location** | ${name(entity.currentLocation)} |`,
    ].join("\n");
  }
};
