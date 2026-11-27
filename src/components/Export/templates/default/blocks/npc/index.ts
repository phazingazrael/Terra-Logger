import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";
import { renderAtlasSectionByLabelToMarkdown, renderNPCHistory, renderNPCRelationships, renderNPCReferenceField } from "../../../../builder/atlasContentMarkdown";
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
function displayName(value: unknown): string {
  const name = typeof value === "string" ? value : String((value as { name?: unknown })?.name ?? "");
  return name || "—";
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
  id: "default.npc.profile", render: (context) => {
    const { entity } = context;
    return [
    "## Profile",
    `**Pronouns:** _${names(entity.pronouns)}_`,
    `**Pronounced:** _${stringValue(entity.pronounced)}_`,
    `**Race:** _${renderNPCReferenceField(context, "ancestry")}_`,
    `**Heritage:** _${stringValue(entity.heritage)}_`,
    `**Gender:** _${displayName(entity.gender)}_`,
    `**Age:** _${stringValue(entity.age)}_`,
    `**Sexuality:** _${stringValue(entity.sexuality)}_`,
    `**Alignment:** _${stringValue(entity.alignment)}_`,
    `**Condition:** _${stringValue(entity.condition)}_`,
    `**Aliases:** _${names(entity.aliases)}_`,
    `**Occupation:** _${renderNPCReferenceField(context, "profession")}_`,
    `**Location:** _${renderNPCReferenceField(context, "currentLocation")}_`,
  ].join("\n");
  }
};
const portrait: MarkdownBlock = {
  id: "default.npc.portrait", render: ({ entity, documentPath }) => {
    const npc = entity as unknown as TLNPC;
    return [`## Portrait`, `![${stringValue(entity.name, "NPC portrait")}](${getNPCExportPortraitPath(npc, documentPath)})`].join("\n\n");
  }
};
const relationships: MarkdownBlock = {
  id: "default.npc.relationships", render(context) {
    const body = renderNPCRelationships(context);
    return body ? `## Relationships & Acquaintances\n\n${body}` : "";
  },
};
const history: MarkdownBlock = {
  id: "default.npc.history", render(context) {
    const body = renderNPCHistory(context);
    return body ? `## History\n\n${body}` : "";
  },
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
  return [frontmatter, title, portrait, profile, authoredSections, relationships, history,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.npc.customAtlasSections", sourceType: "npc",
      handledSectionLabels: ["Header", "Profile", "Overview", "Background", "Aspirations & Motivations", "Relationships & Acquaintances", "Public Perception", "Hidden Details", "Notes", "Portrait", "History", "Tags"],
      handledSectionClassNames: ["section header", "section profile", "section overview", "section background", "section aspirations-motivations", "section relationships", "section public-perception", "section hidden-details", "section notes", "section portrait", "section history", "section tags"],
    })];
}
