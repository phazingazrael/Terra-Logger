import type { AtlasBlockPreset, AtlasSectionPreset, AtlasSourceType } from "../../../definitions/Atlas";
import {
  chipListBlock,
  detailsListBlock,
  headingBlock,
  richTextBlock,
  sectionPreset,
  splitListBlock,
} from "../core/presets";

export function commonSectionPresets<TSource extends AtlasSourceType>(): AtlasSectionPreset<TSource>[] {
  return [
    {
      id: "freeform-section",
      label: "Freeform Section",
      description: "A heading plus editable rich text.",
      create: () => sectionPreset("New Section", "section freeform", [richTextBlock("Add details here.")]),
    },
    {
      id: "details-section",
      label: "Details Section",
      description: "Editable label/value rows.",
      create: () => sectionPreset("Details", "section details", [detailsListBlock([{ label: "Label", value: "Value" }])]),
    },
  ];
}

export function commonBlockPresets<TSource extends AtlasSourceType>(): AtlasBlockPreset<TSource>[] {
  return [
    {
      id: "rich-text-block",
      label: "Rich Text",
      description: "Editable prose stored as rich text.",
      create: () => richTextBlock(""),
    },
    {
      id: "heading-block",
      label: "Heading",
      description: "A static heading inside this section.",
      create: () => headingBlock("New Heading", 2),
    },
    {
      id: "details-list-block",
      label: "Details List",
      description: "Editable label/value rows.",
      create: () =>
        detailsListBlock([{ label: "Label", value: "Value", valueMode: "static" }]),
    },
    {
      id: "split-list-block",
      label: "Split List",
      description: "Multiple grouped lists.",
      create: () =>
        splitListBlock([
          {
            name: "List",
            children: ["New item"],
          },
        ]),
    },
    {
      id: "chip-list-block",
      label: "Chip List",
      description: "A simple list of chips/tags stored in the page content.",
      create: () => chipListBlock(["New item"]),
    }
  ];
}
