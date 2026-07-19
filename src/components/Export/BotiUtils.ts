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
  zipName: string | undefined,
  templateName: string,
  mapName: string,
  now = new Date(),
): string {
  const timestamp = formatExportTimestamp(now);
  const safeMapName = sanitizeFilenamePart(mapName || "Terra Logger Export");

  if (isBotiTemplate(templateName)) {
    return `${safeMapName} Vault ${timestamp}.zip`;
  }

  const explicitName = String(zipName ?? "").trim();

  if (explicitName) {
    return explicitName.endsWith(".zip") ? explicitName : `${explicitName}.zip`;
  }

  return `${safeMapName} ${timestamp}.zip`;
}

function formatExportTimestamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(
    date.getSeconds(),
  )}`;
}

function sanitizeFilenamePart(value: string): string {
  return value
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);

      if (code >= 0 && code <= 31) return "-";

      return isInvalidFilenameChar(char) ? "-" : char;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function isInvalidFilenameChar(char: string): boolean {
  return (
    char === "<" ||
    char === ">" ||
    char === ":" ||
    char === '"' ||
    char === "/" ||
    char === "\\" ||
    char === "|" ||
    char === "?" ||
    char === "*"
  );
}

export function isBotiTemplate(value: unknown): boolean {
  const normalized = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return (
    normalized === "boti" ||
    normalized === "bag of tips inspired" ||
    normalized.includes("bag of tips")
  );
}
