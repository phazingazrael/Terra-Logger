import type {
  ExportSourceType,
  MarkdownBlock,
  MarkdownDocumentTemplate,
} from "./exportTypes";
import { markdownHeading, readString } from "./markdownUtils";
import { defaultTemplate } from "../templates/default/template";

const placeholderTitleBlock: MarkdownBlock = {
  id: "placeholder.title",

  render({ entity, sourceType }) {
    const title =
      readString(entity, "name") ||
      readString(entity, "nameFull") ||
      readString(entity, "info.name") ||
      readString(entity, "title") ||
      sourceType;

    return markdownHeading(1, title);
  },
};

const placeholderBodyBlock: MarkdownBlock = {
  id: "placeholder.body",

  render({ templateId, sourceType }) {
    return [
      "> [!warning] Markdown builder template is scaffolded but not fully migrated yet.",
      `> Template: ${templateId}`,
      `> Source type: ${sourceType}`,
    ].join("\n");
  },
};

function scaffoldBlocks(_sourceType: ExportSourceType): MarkdownBlock[] {
  return [placeholderTitleBlock, placeholderBodyBlock];
}

export const botiMarkdownTemplate: MarkdownDocumentTemplate = {
  id: "boti",
  label: "Bag of Tips Inspired",
  getBlocks: scaffoldBlocks,
};

const markdownDocumentTemplates: MarkdownDocumentTemplate[] = [
  defaultTemplate,
  botiMarkdownTemplate,
];

export function getMarkdownDocumentTemplates(): MarkdownDocumentTemplate[] {
  return markdownDocumentTemplates;
}

export function getMarkdownDocumentTemplate(
  labelOrId: string,
): MarkdownDocumentTemplate {
  return (
    markdownDocumentTemplates.find(
      (template) =>
        template.id === labelOrId ||
        template.label === labelOrId,
    ) ?? defaultTemplate
  );
}
