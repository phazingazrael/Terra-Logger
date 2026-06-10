import type { AtlasBlockPreset, AtlasSectionPreset, AtlasSourceType } from "../../../definitions/Atlas";
import { detailsListBlock, richTextBlock, sectionPreset } from "../core/presets";

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
			description: "Editable prose stored as a JSON string.",
			create: () => richTextBlock(""),
		},
		{
			id: "details-list-block",
			label: "Details List",
			description: "Editable label/value rows.",
			create: () => detailsListBlock([{ label: "Label", value: "Value" }]),
		},
	];
}
