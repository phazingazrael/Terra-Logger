import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasSectionByLabelToMarkdown, renderBotiSectionCallout, renderNPCRelationships } from "../../../../builder/atlasContentMarkdown";

export const botiNPCMainContentBlock: MarkdownBlock = {
  id: "boti.npc.mainContent",
  render(context) {
    const { entity, data } = context;
    const section = (label: string) => renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: [label] }).replace(/^##+\s+.*$/m, "").trim();
    return [
      `# ${String(entity.fullName ?? entity.name ?? "Unnamed NPC")}`,
      ...[
        ["Overview", section("Overview")],
        ["Background", section("Background") || String(entity.background ?? "")],
        ["Aspirations & Motivations", section("Aspirations & Motivations") || String(entity.aspirationsMotivations ?? "")],
        ["Relationships & Acquaintances", section("Relationships & Acquaintances") || renderNPCRelationships(context)],
        ["Public Perception", section("Public Perception") || String(entity.publicPerception ?? "")],
        ["Hidden Details", section("Hidden Details") || String(entity.hiddenDetails ?? "")],
        ["Notes", section("Notes")],
      ].map(([title, body]) => renderBotiSectionCallout(title, body, "", "npc")),
    ].join("\n\n");
  },
};
