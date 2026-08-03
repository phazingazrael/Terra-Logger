import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";
import { renderAtlasSectionByLabelToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { getNPCExportPortraitPath } from "../../../../../NPC/portraits/export";
import type { TLNPC } from "../../../../../../definitions/TerraLogger";

function stringValue(value: unknown, fallback = "—"): string {
  const text = typeof value === "string" ? value.trim() : "";
  return text || fallback;
}
function names(value: unknown): string {
  if (!Array.isArray(value)) return "—";
  const result = value.flatMap((item) => {
    const name =
      typeof item === "string"
        ? item
        : String((item as { name?: unknown })?.name ?? "");

    return name ? [name] : [];
  });
  return result.length ? result.join(", ") : "—";
}
function wiki(value: unknown): string {
  const name = typeof value === "string" ? value : String((value as { name?: unknown })?.name ?? "");
  return name ? `[[${name}]]` : "—";
}

const frontmatter: MarkdownBlock = {
  id: "default.npc.frontmatter", render: ({ entity }) => {
    const tags = Array.isArray(entity.tags)
      ? entity.tags.flatMap((tag) => {
          const name =
            typeof tag === "string"
              ? tag
              : String((tag as { name?: unknown })?.name ?? "");

          return name ? [name] : [];
        })
      : [];
    return ["---", `type: npc`, `name: ${JSON.stringify(stringValue(entity.name, "Unnamed NPC"))}`, `aliases: ${JSON.stringify(Array.isArray(entity.aliases) ? entity.aliases : [])}`, `tags: ${JSON.stringify(tags)}`, "---"].join("\n");
  }
};
const title: MarkdownBlock = { id: "default.npc.title", render: ({ entity }) => `# ${stringValue(entity.fullName ?? entity.name, "Unnamed NPC")}` };
const profile: MarkdownBlock = {
  id: "default.npc.profile", render: ({ entity }) => [
    "## Profile",
    `| Field | Value |`, `|---|---|`,
    `| Pronouns | ${names(entity.pronouns)} |`,
    `| Pronounced | ${stringValue(entity.pronounced)} |`,
    `| Race | ${wiki(entity.ancestry)} |`,
    `| Heritage | ${stringValue(entity.heritage)} |`,
    `| Gender | ${wiki(entity.gender)} |`,
    `| Age | ${stringValue(entity.age)} |`,
    `| Sexuality | ${stringValue(entity.sexuality)} |`,
    `| Alignment | ${stringValue(entity.alignment)} |`,
    `| Condition | ${stringValue(entity.condition)} |`,
    `| Aliases | ${names(entity.aliases)} |`,
    `| Occupation | ${wiki(entity.profession)} |`,
    `| Location | ${wiki(entity.currentLocation)} |`,
  ].join("\n")
};
const portrait: MarkdownBlock = {
  id: "default.npc.portrait", render: ({ entity }) => {
    const npc = entity as unknown as TLNPC;
    return [`## Portrait`, `![${stringValue(entity.name, "NPC portrait")}](${getNPCExportPortraitPath(npc)})`].join("\n\n");
  }
};
const relationships: MarkdownBlock = {
  id: "default.npc.relationships", render: ({ entity }) => {
    const rows = Array.isArray(entity.relationships) ? entity.relationships as Array<Record<string, unknown>> : [];
    if (!rows.length) return "";
    return ["## Relationships & Acquaintances", ...rows.map((r) => `- **${stringValue(r.roleTitle ?? r.relationshipType, "Relationship")}** — [[${stringValue(r.relatedEntityId, "Unknown")}]]${r.primary ? " *(Primary)*" : ""}`)].join("\n");
  }
};
const history: MarkdownBlock = {
  id: "default.npc.history", render: ({ entity }) => {
    const rows = Array.isArray(entity.history) ? entity.history as Array<Record<string, unknown>> : [];
    if (!rows.length) return "";
    return ["## History", ...rows.map((h) => `- ${typeof h.year === "number" ? `**${h.year}:** ` : ""}${stringValue(h.title, "Event")} — ${stringValue(h.description, "")}`)].join("\n");
  }
};
const authoredSections: MarkdownBlock = {
  id: "default.npc.authored", render: ({ entity, data }) => [
    renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: ["Overview"] }),
    renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: ["Background"] }),
    renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: ["Aspirations & Motivations"] }),
    renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: ["Public Perception"] }),
    renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: ["Hidden Details"] }),
    renderAtlasSectionByLabelToMarkdown({ entity, sourceType: "npc", data, labels: ["Notes"] }),
  ].filter(Boolean).join("\n\n")
};

export function getDefaultNPCBlocks(): MarkdownBlock[] {
  return [frontmatter, title, profile, portrait, authoredSections, relationships, history,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.npc.customAtlasSections", sourceType: "npc",
      handledSectionLabels: ["Header", "Profile", "Overview", "Background", "Aspirations & Motivations", "Relationships & Acquaintances", "Public Perception", "Hidden Details", "Notes", "Portrait", "History", "Tags"],
      handledSectionClassNames: ["section header", "section profile", "section overview", "section background", "section aspirations-motivations", "section relationships", "section public-perception", "section hidden-details", "section notes", "section portrait", "section history", "section tags"],
    })];
}
