import { npcAdapter } from "../../atlas/adapters/npcAdapter";
import { withExportTags } from "./markdownUtils";
import { renderBotiInfobox, renderSavedAtlasContent } from "./atlasContentMarkdown";
import { getNPCExportPortraitPath } from "../../NPC/portraits/export";
import { getBotiExportPath } from "../BotiUtils";
import type { TLNPC } from "../../../definitions/TerraLogger";
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
  // Reuse the viewer's default NPC sections without changing saved layouts or records.
  if (context.sourceType === "npc" && context.entity.content == null) {
    const content = npcAdapter.createDefaultContent(context.entity as unknown as TLNPC);
    context = { ...context, entity: { ...context.entity, content } };
  }
  const blocks = template.getBlocks(context.sourceType);

  const saved = renderSavedAtlasContent(context);
  if (saved !== null) {
    // Keep template metadata, but never render template body defaults over saved Atlas content.
    // Notes and developmental eras currently package their metadata and body in one block.
    const metadataBlock = blocks.find((block) => block.id.endsWith(".frontmatter")) ?? blocks[0];
    const metadata = metadataBlock?.render(context).match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/)?.[0].trim() ?? "";
    const title = `# ${String(context.entity.fullName || context.entity.name || "").replace(/[\r\n]/g, " ")}`;
    const infobox = template.id === "boti" ? renderBotiInfobox(context) : "";
    const assets: string[] = [];
    if (template.id !== "boti" && (context.sourceType === "city" || context.sourceType === "country") &&
      typeof context.entity.coaSVG === "string" && context.entity.coaSVG.trim() &&
      typeof context.entity.coaFilename === "string" && context.entity.coaFilename) {
      const root = "../".repeat((context.documentPath ?? "").split("/").length - 1);
      const path = (root + context.entity.coaFilename).split("/").map((part) =>
        part === ".." ? part : encodeURIComponent(part)).join("/");
      assets.push(`![Coat of arms](${path})`);
    }
    if (template.id !== "boti" && context.sourceType === "npc") {
      const npc = context.entity as unknown as TLNPC;
      const path = getNPCExportPortraitPath(npc, context.documentPath,
        context.templateId === "boti" ? getBotiExportPath : undefined);
      assets.push(`![Portrait](${path})`);
    }
    const markdown = withExportTags(`${[metadata, infobox, title, ...assets, saved, renderDevelopmentSummary(context)]
      .filter(Boolean).join("\n\n")}\n`, context.entity.tags);
    return template.id === "boti" ? finishBotiCallouts(markdown) : markdown;
  }

  const renderedBlocks = blocks.flatMap((block) => {
    const rendered = block.render(context).trim();
    return rendered ? [rendered] : [];
  });

  const development = renderDevelopmentSummary(context);
  if (development) renderedBlocks.push(development);
  const body = renderedBlocks.join("\n\n");
  const designed = template.id === "boti" && !/^[ \t]*>[ \t]*\[!infobox\b/mi.test(body)
    ? body.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, (metadata) =>
      `${metadata}\n\n${renderBotiInfobox(context)}\n\n`) : body;
  const markdown = withExportTags(`${designed}\n`, context.entity.tags);
  return template.id === "boti" ? finishBotiCallouts(markdown) : markdown;
}

/** Reorder only exported top-level callouts; quoted examples and nested callouts stay intact. */
function finishBotiCallouts(markdown: string): string {
  const closingTitles = new Set([
    "plot hooks", "hidden details", "general notes", "dm secrets", "secrets", "notes",
    "gm notes", "dm notes", "secrets / gm notes",
  ]);
  const lines = markdown.split(/\r?\n/);
  const chunks: Array<{ text: string; rank: number }> = [];
  let plain: string[] = [];
  let fence = "";
  const flush = () => {
    if (plain.length) chunks.push({ text: plain.join("\n"), rank: 0 });
    plain = [];
  };
  for (let index = 0; index < lines.length;) {
    const marker = lines[index].match(/^(`{3,}|~{3,})/);
    if (marker && (!fence || fence === marker[1][0])) fence = fence ? "" : marker[1][0];
    const callout = !fence && lines[index].match(/^>[ \t]*\[![^\]]+\][+-]?[ \t]*(.*)$/);
    if (!callout) { plain.push(lines[index++]); continue; }
    flush();
    const block = [lines[index++]];
    let quotedFence = "";
    while (index < lines.length) {
      const line = lines[index];
      if (line.trim() && !line.startsWith(">")) break;
      if (!quotedFence && /^>[ \t]*\[!/.test(line)) break;
      const marker = line.match(/^>[ \t]?(`{3,}|~{3,})/);
      if (marker && (!quotedFence || quotedFence === marker[1][0])) quotedFence = quotedFence ? "" : marker[1][0];
      block.push(line);
      index++;
    }
    while (block.length > 1 && !block[block.length - 1].trim()) block.pop();
    if (block.slice(1).every((line) => !line.trim() || /^>[ \t]*$/.test(line))) {
      block.splice(1, block.length - 1, "> ");
    }
    const title = callout[1].trim().toLowerCase().replace(/\s+/g, " ");
    chunks.push({ text: block.join("\n"), rank: title === "tags" ? 2 : closingTitles.has(title) ? 1 : 0 });
  }
  flush();
  const body = chunks.sort((left, right) => left.rank - right.rank)
    .map((chunk) => chunk.text.replace(/^\n+|\n+$/g, "")).filter(Boolean).join("\n\n");
  return `${body}\n`;
}
