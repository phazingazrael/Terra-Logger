import type { ExportContext, MarkdownBlock } from "../../../../builder/exportTypes";
import type { TLNote } from "../../../../../../definitions/TerraLogger";
import { pickNoteTemplateKey } from "../../../../templateUtils";
import { botiNoteCityBlock } from "./city";
import { botiNoteCountryBlock } from "./country";
import { botiNoteLabelBlock } from "./label";
import { botiNoteMilitaryBlock } from "./military";
import { botiNotePoiBlock } from "./poi";

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
