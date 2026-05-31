/**
 * Template utilities for Export module:
 * - Load template text via Vite's import.meta.glob()
 * - Resolve dynamic template paths
 * - Choose note-specific templates
 * - Fill missing template entries with defaults
 */

import type { PartialTemplates, TemplateMap } from "../../definitions/Export";
import type { TLNote } from "../../definitions/TerraLogger";

/**
 * Bundle markdown/text templates as raw strings.
 *
 * Vite 8 raw glob imports should use:
 * - query: "?raw"
 * - import: "default"
 * - eager: true
 *
 * That ensures the matched markdown files are treated as raw text assets rather
 * than parsed as JavaScript modules during build.
 */
const RAW_TEMPLATES = import.meta.glob<string>(
	[
		"./templates/**/*.{md,markdown,txt}",
		"/src/components/Export/templates/**/*.{md,markdown,txt}",
	],
	{
		query: "?raw",
		import: "default",
		eager: true,
	},
);

/**
 * Try to resolve a given requestPath to an entry inside RAW_TEMPLATES.
 * Works even if the user used "./" or "/src/" or "/templates/" prefixes.
 */
export function resolveRawFromGlob(requestPath: string): string | undefined {
	// normalize, strip ?raw and leading slashes
	const clean = String(requestPath).replace(/\?.*$/, "").replace(/\\/g, "/");

	// Try direct, relative, and "endsWith" matches so both "/templates/…" and "./templates/…" work.
	const candidates = new Set<string>();

	// a) as provided
	candidates.add(clean);
	// b) ensure it starts with "./" for the local glob
	candidates.add(clean.startsWith("/") ? `.${clean}` : clean);
	// c) just the tail after "/templates/"
	const tail = clean.split("/templates/")[1];
	if (tail) {
		candidates.add(`./templates/${tail}`);
		candidates.add(`/src/components/Export/templates/${tail}`);
	}

  // Exact match first
	for (const key of candidates) {
		if (RAW_TEMPLATES[key]) {
			return RAW_TEMPLATES[key];
		}
	}
  // Fallback: suffix match (useful if folder layout shifts)

	const suffix = (tail ?? clean).replace(/^\.?\//, "");
	const hit = Object.keys(RAW_TEMPLATES).find((key) => key.endsWith(suffix));
	return hit ? RAW_TEMPLATES[hit] : undefined;
}

/**
 * Load and resolve all templates from JSON (usually templates.json)
 * Returns a map of name -> template contents
 */
export async function resolveTemplateFilesFromJson(
	files: PartialTemplates,
): Promise<PartialTemplates> {
	const out: PartialTemplates = {};

	for (const key of Object.keys(files) as (keyof TemplateMap)[]) {
		const path = files[key];
		if (!path) {
			continue;
		}
    // 1) Resolve at build-time from RAW_TEMPLATES (preferred: no network)

		const raw = resolveRawFromGlob(path);
		if (typeof raw === "string") {
			out[key] = raw;
			continue;
		}

    // 2) Optional
		/**
		 * Last-resort dynamic raw import.
		 *
		 * Important:
		 * we append ?raw here too, otherwise a markdown file may be parsed as a
		 * source module instead of returned as text.
		 */
		try {
			const rawPath = path.includes("?") ? `${path}&raw` : `${path}?raw`;
			const mod = await import(/* @vite-ignore */ rawPath);
			const content = (mod as { default?: unknown }).default;

			if (typeof content === "string") {
				out[key] = content;
				continue;
			}
		} catch {
			// 3) No fetch fallback — we explicitly avoid runtime HTTP in production
			throw new Error(
				`Template not bundled: ${String(path)} — ensure it matches RAW_TEMPLATES glob.`,
			);
		}
	}

	return out;
}

/**
 * Returns a full template map, filling in defaults for missing templates.
 */
export function fillMissingTemplates(partial: PartialTemplates): TemplateMap {
	const defaults: TemplateMap = {
		Name: "# {{Name.name}}\n", // unused
		// The default template for the key "MapInfo".
		MapInfo: "# {{MapInfo.info.name}}\n",
		// The default template for the key "City".
		City: "# {{City.name}}\n",
		// The default template for the key "Country".
		Country: "# {{Country.name}}\n",
		// The default template for the key "Culture".
		Culture: "# {{Culture.name}}\n",
		// The default template for the key "Note".
		Note: "# {{Note.name}}\n{{Note.legend}}",
		// The default template for the key "Religion".
		Religion: "# {{Religion.name}}\n",
	};

	return { ...defaults, ...(partial as Record<string, string>) } as TemplateMap;
}

/**
 * Determine which note template key to use based on the note ID and tags.
 */
export function pickNoteTemplateKey(note: TLNote): string {
	const id = String(note?.id || "").toLowerCase();
	const root = id.match(/^[a-zA-Z]+/)?.[0] || "";

	if (["burg", "city"].includes(root)) return "Note-City";
	if (["country", "state", "statelabel"].includes(root)) return "Note-Country";
	if (["label"].includes(root)) return "Note-Label";
	if (["reg", "regiment", "mil", "military"].includes(root))
		return "Note-Military";
	if (["poi", "marker", "pin"].includes(root)) return "Note-POI";

  // optional: light tag-based fallback
	const tags = Array.isArray((note as { tags?: unknown }).tags)
		? ((note as { tags?: unknown[] }).tags ?? [])
		: [];

	const has = (text: string) =>
		tags.some((tag) =>
			String(
				(tag as { Type?: string; Name?: string })?.Type ??
					(tag as { Type?: string; Name?: string })?.Name ??
					"",
			)
				.toLowerCase()
				.includes(text),
		);

	if (has("city")) return "Note-City";
	if (has("country") || has("state")) return "Note-Country";
	if (has("label")) return "Note-Label";
	if (has("milit")) return "Note-Military";
	if (has("poi") || has("marker")) return "Note-POI";

	return "Note-Label";
}

/**
 * Resolve which Mustache template string to use for a note.
 */
export function resolveNoteTemplate(
	note: TLNote,
	templates: TemplateMap,
): string {
	const key = pickNoteTemplateKey(note);
	return templates[key] ?? templates.Note;
}
