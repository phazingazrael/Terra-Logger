/**
 * BOTI-specific utilities:
 * - remapPathsForBOTI: move certain export paths into the BOTI vault folder structure
 * - botiNoteFolder: choose a folder for notes based on their id prefix
 * - makeZipName: create final zip filename (special case for BOTI template name)
 */

import type { FileSpec } from "../../definitions/Export";
import type { TLNote } from "../../definitions/TerraLogger";

/**
 * Remap a list of FileSpec.path values to the BOTI folder layout.
 * This is a pure function returning a new array.
 */
export function remapPathsForBOTI(files: FileSpec[]): FileSpec[] {
	return files.map((f) => {
		let p = f.path;

		// Move core collections into BOTI folders
		if (p.startsWith("cities/"))
			p = p.replace(/^cities\//, `World/06. Cities/`);
		else if (p.startsWith("countries/"))
			p = p.replace(/^countries\//, `World/04. Countries/`);
		else if (p.startsWith("notes/"))
			p = p.replace(/^notes\//, `World/16. Notes/`);
		else if (p.startsWith("cultures/"))
			p = p.replace(/^cultures\//, `World/12. Groups/Cultures/`);
		else if (p.startsWith("religions/"))
			p = p.replace(/^religions\//, `World/12. Groups/Religions/`);

		return { ...f, path: p };
	});
}

/**
 * Pick an appropriate BOTI folder for a note based on its id prefix.
 * Examples:
 *  - "reg123" -> World/16. Notes/Military/
 *  - "burg7"  -> World/16. Notes/City/
 * Fallback goes to World/16. Notes/Misc/
 */
export function botiNoteFolder(note: TLNote): string {
	const id = String(note?.id || "").toLowerCase();
	const root = id.match(/^[a-zA-Z]+/)?.[0] || "";
	const base = `World/16. Notes`;

	if (["reg", "regiment", "mil", "military"].includes(root))
		return `${base}/Military/`;
	if (["marker", "poi", "pin"].includes(root))
		return `${base}/Points of Interest/`;
	if (["burg", "city"].includes(root)) return `${base}/City/`;
	if (["country", "state", "statelabel"].includes(root))
		return `${base}/Country/`;
	if (["label"].includes(root)) return `${base}/Label/`;
	return `${base}/Misc/`; // fallback bucket
}

/**
 * Build the final zip filename.
 * Special-case: when tplName === "Bag of Tips Inspired", return "{mapName} Vault.zip"
 * Otherwise ensure the base name ends with .zip
 */
export function makeZipName(
	baseZipName: string,
	tplName: string,
	mapName: string,
) {
	if (tplName === "Bag of Tips Inspired") {
		return `${mapName} Vault.zip`;
	}
	return baseZipName.endsWith(".zip") ? baseZipName : `${baseZipName}.zip`;
}
