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

  const renderedBlocks = blocks.flatMap((block) => {
    const rendered = block.render(context).trim();
    return rendered ? [rendered] : [];
  });

  return `${renderedBlocks.join("\n\n")}\n`;
}
