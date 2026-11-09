import type { AtlasContent, AtlasSection } from "../../../definitions/Atlas";
import { economySummary } from "./presets";

export function ensureEconomySummary(content: AtlasContent): AtlasContent {
  if (content.source.type !== "city" && content.source.type !== "country") return content;
  if (content.sections.some((section) => section.blocks.some((block) => block.type === "economySummary"))) {
    return content;
  }
  const target = content.sections.find((section) => {
    const title = section.title.toLowerCase().replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ").trim();
    const classes = (section.wrapper.className ?? "").split(/\s+/);
    return title === "economy" || title === "economy and trade" ||
      classes.includes("economy") || classes.includes("economy-trade");
  });
  if (!target) return content;
  const summary = { ...economySummary(), id: `${target.id}-economy-summary` };
  const index = target.blocks.findIndex((block) => block.type === "richText");
  const blocks = [...target.blocks];
  blocks.splice(index < 0 ? blocks.length : index, 0, summary);
  return {
    ...content,
    sections: content.sections.map((section) => section === target ? { ...section, blocks } : section),
  };
}

export function findEconomyTradeBlock(section?: AtlasSection) {
  return section?.blocks.find((block) => {
    if (block.type !== "splitList" || block.dataMode !== "entity" || !Array.isArray(block.props.groups)) return false;
    const paths = block.props.groups.map((group) => group && typeof group === "object"
      ? (group as { entityPath?: string }).entityPath : undefined);
    return paths.includes("economy.imports") && paths.includes("economy.exports");
  });
}
