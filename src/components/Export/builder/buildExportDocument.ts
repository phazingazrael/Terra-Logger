import type {
  ExportContext,
  MarkdownDocumentTemplate,
} from "./exportTypes";

export function buildExportDocument({
  template,
  context,
}: {
  template: MarkdownDocumentTemplate;
  context: ExportContext;
}): string {
  const blocks = template.getBlocks(context.sourceType);

  const renderedBlocks = blocks
    .map((block) => block.render(context).trim())
    .filter(Boolean);

  return `${renderedBlocks.join("\n\n")}\n`;
}
