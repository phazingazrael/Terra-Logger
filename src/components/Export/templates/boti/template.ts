import type {
	ExportSourceType,
	MarkdownBlock,
	MarkdownDocumentTemplate,
} from "../../builder/exportTypes";
import { getBotiCityBlocks } from "./blocks/city";
import { getBotiCountryBlocks } from "./blocks/country";
import { getBotiCultureBlocks } from "./blocks/culture";
import { getBotiMapBlocks } from "./blocks/map";
import { getBotiNoteBlocks } from "./blocks/note";
import { getBotiReligionBlocks } from "./blocks/religion";

export const botiTemplate: MarkdownDocumentTemplate = {
	id: "boti",
	label: "Bag of Tips Inspired",

	getBlocks(sourceType: ExportSourceType): MarkdownBlock[] {
		switch (sourceType) {
			case "city":
				return getBotiCityBlocks();
			case "country":
				return getBotiCountryBlocks();
			case "culture":
				return getBotiCultureBlocks();
			case "map":
				return getBotiMapBlocks();
			case "note":
				return getBotiNoteBlocks();
			case "religion":
				return getBotiReligionBlocks();
			default:
				return [];
		}
	},
};
