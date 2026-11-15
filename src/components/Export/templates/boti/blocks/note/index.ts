import type { ExportContext, MarkdownBlock } from "../../../../builder/exportTypes";
import type { TLNote } from "../../../../../../definitions/TerraLogger";
import { pickNoteTemplateKey } from "../../../../templateUtils";
import { botiNoteCityBlock } from "./city";
import { botiNoteCountryBlock } from "./country";
import { botiNoteLabelBlock } from "./label";
import { botiNoteMilitaryBlock } from "./military";
import { botiNotePoiBlock } from "./poi";
import { renderBotiNoteFrontmatter } from "./frontmatter";
import { getDefaultNoteBlocks } from "../../../default/blocks/note";
import { getNoteCategory } from "../../../../../atlas/adapters/noteAdapter";
import { renderAtlasNoteBodyToMarkdown } from "../../../../builder/atlasContentMarkdown";

const noteBlockGroups: Record<string, MarkdownBlock[]> = {
  "Note-City": [botiNoteCityBlock],
  "Note-Country": [botiNoteCountryBlock],
  "Note-Label": [botiNoteLabelBlock],
  "Note-Military": [botiNoteMilitaryBlock],
  "Note-POI": [botiNotePoiBlock],
};

const fallbackNoteBlocks: MarkdownBlock[] = [botiNoteLabelBlock];

const botiNoteBlock: MarkdownBlock = {
  id: "boti.note.dynamic",

  render(context: ExportContext) {
    const templateKey = pickNoteTemplateKey(
      context.entity as TLNote,
    );

    if ([
      "Note-Journey", "Note-Road", "Note-Trail", "Note-SeaRoute", "Note-Route",
    ].includes(templateKey)) {
      const note = context.entity as TLNote;
      const category = getNoteCategory(note);
      return [
        renderBotiNoteFrontmatter({
          entity: {
            ...context.entity,
            legend: renderAtlasNoteBodyToMarkdown(context.entity),
          },
          banner: "[[Lore-Banner.jpg]]",
          type: category.label,
          extraFields: [
            { key: "SourceNoteId", value: note.id },
            { key: "RouteGroup", value: category.id.startsWith("route:") ? note.type : "" },
            { key: "Colour", value: note.importedTravel?.color ?? category.color },
          ],
        }),
        ...getDefaultNoteBlocks().slice(1).map((block) => block.render(context)),
      ].filter((part) => part.trim()).join("\n\n");
    }

    const blocks = noteBlockGroups[templateKey] ?? fallbackNoteBlocks;

    return blocks
      .flatMap((block) => {
        const rendered = block.render(context).trim();
        return rendered ? [rendered] : [];
      })
      .join("\n\n");
  },
};

export function getBotiNoteBlocks(): MarkdownBlock[] {
  return [botiNoteBlock];
}
