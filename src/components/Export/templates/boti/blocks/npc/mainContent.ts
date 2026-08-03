import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasSectionByLabelToMarkdown } from "../../../../builder/atlasContentMarkdown";
const callout = (title: string, body: string) => `> [!note]- ${title}\n${(body.trim() || "Placeholder").split("\n").map((line) => `> ${line}`).join("\n")}`;
export const botiNPCMainContentBlock: MarkdownBlock = { id: "boti.npc.mainContent", render: ({ entity, data }) => {
  const section = (label: string) => renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: [label] }).replace(/^##+\s+.*$/m, "").trim();
  const relationships = Array.isArray(entity.relationships) ? entity.relationships.map((r) => { const row = r as Record<string, unknown>; return `- **${String(row.roleTitle ?? row.relationshipType ?? "Relationship")}** — [[${String(row.relatedEntityId ?? "Unknown")}]]`; }).join("\n") : "";
  return [
    callout("Overview", section("Overview")),
    callout("Background", section("Background") || String(entity.background ?? "")),
    callout("Aspirations & Motivations", section("Aspirations & Motivations") || String(entity.aspirationsMotivations ?? "")),
    callout("Relationships & Acquaintances", section("Relationships & Acquaintances") || relationships),
    callout("Public Perception", section("Public Perception") || String(entity.publicPerception ?? "")),
    callout("Hidden Details", section("Hidden Details") || String(entity.hiddenDetails ?? "")),
    callout("Notes", section("Notes")),
  ].join("\n\n");
}};
