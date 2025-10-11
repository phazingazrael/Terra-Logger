import afmgcss from "../../assets/afmg.css?raw";
import type { RenderOptions } from "../../definitions/Export";

export const DEFAULT_RENDER_OPTIONS: Required<RenderOptions> = {
	mapInfoFilename: "map info.md", // default filename for main map info file
	filenameFields: {
		// which fields to use when generating filenames for each dataset
		Cities: ["name", "title", "id", "_id"],
		Countries: ["name", "nameFull", "id", "_id"],
		Cultures: ["name", "code", "id", "_id"],
		Notes: ["name", "id", "_id"],
		Religions: ["name", "code", "_id"],
	},
	extension: ".md", // default file extension for markdown files
	css: afmgcss,
	templateName: "default",
};

export const BOTI_BASE_ZIP = "expoRes/boti-assets/Vault.zip"; // ← public/ path to the base vault zip
