import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderAtlasSectionByLabelToMarkdown } from "../../../../builder/atlasContentMarkdown";
import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";
import { markdownHeading, markdownTable, readPath } from "../../../../builder/markdownUtils";

const fallbackBlock = createMustacheMarkdownBlock({
  id: "default.culture.customsAndSociety.fallback",
  template: `## Customs & Society
- _No customs or society details listed_`,
});

export const defaultCultureCustomsAndSocietyBlock: MarkdownBlock = {
  id: "default.culture.customsAndSociety",

  render(context) {
    const atlasSection = renderAtlasSectionByLabelToMarkdown({
      entity: context.entity,
      sourceType: "culture",
      data: context.data,
      labels: [
        "customs & society",
        "customs and society",
        "customs society",
      ],
      headingLevel: 2,
    });

    if (atlasSection) return atlasSection;

    const knownFields = renderKnownCultureCustomsAndSociety(context.entity);

    return knownFields || fallbackBlock.render(context);
  },
};

function renderKnownCultureCustomsAndSociety(
  entity: Record<string, unknown>,
): string {
  const rows: string[][] = [
    ["Customs", formatValue(readPath(entity, "customs"))],
    ["Values", formatValue(readPath(entity, "values"))],
    ["Social Norms", formatValue(readPath(entity, "socialNorms"))],
    ["Social Structure", formatValue(readPath(entity, "socialStructure"))],
    ["Languages", formatValue(readPath(entity, "languages"))],
  ].filter(([, value]) => value.trim());

  if (rows.length === 0) return "";

  return [
    markdownHeading(2, "Customs & Society"),
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
