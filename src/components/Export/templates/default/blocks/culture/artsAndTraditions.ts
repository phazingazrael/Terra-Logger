import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasSectionByLabelToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";
import { markdownHeading, markdownTable, readPath } from "../../../../builder/markdownUtils";

const fallbackBlock = createMustacheMarkdownBlock({
  id: "default.culture.artsAndTraditions.fallback",
  template: `## Arts & Traditions
- _No arts or traditions listed_`,
});

export const defaultCultureArtsAndTraditionsBlock: MarkdownBlock = {
  id: "default.culture.artsAndTraditions",

  render(context) {
    const atlasSection = renderAtlasSectionByLabelToMarkdown({
      entity: context.entity,
      sourceType: "culture",
      data: context.data,
      labels: [
        "arts & traditions",
        "arts and traditions",
        "arts traditions",
      ],
      headingLevel: 2,
    });

    if (atlasSection) return atlasSection;

    const knownFields = renderKnownCultureArtsAndTraditions(context.entity);

    return knownFields || fallbackBlock.render(context);
  },
};

function renderKnownCultureArtsAndTraditions(
  entity: Record<string, unknown>,
): string {
  const rows: string[][] = [
    ["Arts", formatValue(readPath(entity, "arts"))],
    ["Music", formatValue(readPath(entity, "music"))],
    ["Dance", formatValue(readPath(entity, "dance"))],
    ["Cuisine", formatValue(readPath(entity, "cuisine"))],
    ["Clothing", formatValue(readPath(entity, "clothing"))],
    ["Architecture", formatValue(readPath(entity, "architecture"))],
    ["Traditions", formatValue(readPath(entity, "traditions"))],
  ].filter(([, value]) => value.trim());

  if (rows.length === 0) return "";

  return [
    markdownHeading(2, "Arts & Traditions"),
    markdownTable(["Field", "Value"], rows),
  ].join("\n\n");
}

function formatValue(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value.map(formatValue).filter(Boolean).join(", ");
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return (
      formatValue(record.name) ||
      formatValue(record.Name) ||
      formatValue(record.title) ||
      ""
    );
  }

  return String(value);
}
