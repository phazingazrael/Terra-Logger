import { renderDevelopmentSummary } from "./eraMarkdown";
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

  const development = renderDevelopmentSummary(context);
  if (development) renderedBlocks.push(development);
  return `${renderedBlocks.join("\n\n")}\n`;
}
