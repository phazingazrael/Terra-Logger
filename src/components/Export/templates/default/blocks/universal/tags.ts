import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { markdownHeading, markdownList } from "../../../../builder/markdownUtils";

type ExportTag = {
  Name?: string;
  name?: string;
  Type?: string;
  type?: string;
};

export function createDefaultTagsBlock(id: string): MarkdownBlock {
  return {
    id,

    render({ entity }) {
      const tags = Array.isArray(entity.tags)
        ? (entity.tags as ExportTag[])
        : [];

      const lines = tags
        .map((tag) => {
          const name = tag.Name?.trim() || tag.name?.trim();
          const type = tag.Type?.trim() || tag.type?.trim();

          if (!name) return "";

          return type ? `${name} — ${formatTagTypeLabel(type)}` : name;
        })
        .filter(Boolean);

      if (lines.length === 0) return "";

      return [markdownHeading(2, "Tags"), markdownList(lines)].join("\n\n");
    },
  };
}

function formatTagTypeLabel(value: string): string {
  return value
    .trim()
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}
