import type { AtlasContent } from "../../../definitions/Atlas";
import { geographySummary } from "./presets";

const geographyDefaults: Record<string, { placeholder: string; resolver: string; emptyText: string }> = {
  "Climate & Atmosphere": {
    placeholder: "[Earth-like, toxic, magical storms, artificial climate, etc.]",
    resolver: "geography.climate",
    emptyText: "No biome-based climate description is available.",
  },
  "Topography & Terrain": {
    placeholder: "[Floating islands, underground caverns, space stations, etc.]",
    resolver: "geography.terrain",
    emptyText: "No biome-based terrain description is available.",
  },
};

export function ensureGeographySummary(content: AtlasContent): AtlasContent {
  if (content.source.type !== "city" && content.source.type !== "country") return content;
  const target = content.sections.find((section) =>
    (section.wrapper.className ?? "").split(/\s+/).includes("geography-environment") ||
    /^geography\s*(?:&|and)\s*environment$/i.test(section.title.trim()));
  if (!target) return content;
  const blocks = target.blocks.map((block) => {
    if (block.type !== "detailsList" || !Array.isArray(block.props.rows)) return block;
    const originalRows = block.props.rows;
    const rows = originalRows.map((value: unknown) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return value;
      const row = value as Record<string, unknown>;
      if ((row.valueMode !== undefined && row.valueMode !== "static") || row.fallbackResolver) return value;
      const defaults = typeof row.label === "string" ? geographyDefaults[row.label] : undefined;
      // Only replace the exact template placeholders; authored text and explicit blanks survive.
      if (!defaults || row.value !== defaults.placeholder) return value;
      return { ...row, value: undefined, fallbackResolver: defaults.resolver, emptyText: defaults.emptyText };
    });
    return rows.every((row, index) => row === originalRows[index])
      ? block : { ...block, props: { ...block.props, rows } };
  });
  if (!content.sections.some((section) => section.blocks.some((block) => block.type === "geographySummary"))) {
    blocks.unshift({ ...geographySummary(), id: `${target.id}-geography-summary` });
  }
  if (blocks.length === target.blocks.length && blocks.every((block, index) => block === target.blocks[index])) return content;
  return {
    ...content,
    sections: content.sections.map((section) => section !== target ? section : { ...section, blocks }),
  };
}
