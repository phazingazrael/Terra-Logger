import type { ExportContext, MarkdownBlock } from "../../../../builder/exportTypes";
import { pickNoteTemplateKey } from "../../../../templateUtils";
import { botiNoteCityBlock } from "./city";
import { botiNoteCountryBlock } from "./country";
import { botiNoteLabelBlock } from "./label";
import { botiNoteMilitaryBlock } from "./military";
import { botiNotePoiBlock } from "./poi";

type PickNoteTemplateArg = Parameters<typeof pickNoteTemplateKey>[0];

const noteBlockGroups: Record<string, MarkdownBlock[]> = {
  "Note-City": [botiNoteCityBlock],
  "Note-Country": [botiNoteCountryBlock],
  "Note-Label": [botiNoteLabelBlock],
  "Note-Military": [botiNoteMilitaryBlock],
  "Note-POI": [botiNotePoiBlock],
};

const fallbackNoteBlocks = botiNoteLabelBlock;

const botiNoteBlock: MarkdownBlock = {
  id: "boti.note.dynamic",

  render(context: ExportContext) {
    const templateKey = pickNoteTemplateKey(
      context.entity as PickNoteTemplateArg,
    );

    const blocks = noteBlockGroups[templateKey] ?? fallbackNoteBlocks;

    return blocks
      .map((block) => block.render(context).trim())
      .filter(Boolean)
      .join("\n\n");
  },
};

export function getBotiNoteBlocks(): MarkdownBlock[] {
  return [botiNoteBlock];
}
