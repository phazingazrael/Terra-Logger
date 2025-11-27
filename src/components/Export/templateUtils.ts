// components/Export/templateUtils.ts
/**
 * Template utilities for Export module:
 * - Load template text via Vite's import.meta.glob()
 * - Resolve dynamic template paths
 * - Choose note-specific templates
 * - Fill missing template entries with defaults
 */

import type { PartialTemplates, TemplateMap } from "../../definitions/Export";
import type { TLNote } from "../../definitions/TerraLogger";

// Eagerly bundle every markdown under this component's templates folder.
// Adjust the glob roots if your templates live elsewhere as well.
const RAW_TEMPLATES: Record<string, string> = import.meta.glob(
	[
		"./templates/**/*.{md,markdown,txt}",
		"/src/**/templates/**/*.{md,markdown,txt}", // safety net if you import via absolute project path
	],
	{ as: "raw", eager: true },
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
	for (const k of candidates) {
		if (RAW_TEMPLATES[k]) return RAW_TEMPLATES[k];
	}
	// Fallback: suffix match (useful if folder layout shifts)
	const suffix = (tail ?? clean).replace(/^\.?\//, "");
	const hit = Object.keys(RAW_TEMPLATES).find((k) => k.endsWith(suffix));
	return hit ? RAW_TEMPLATES[hit] : undefined;
}

/**
 * Load and resolve all templates from JSON (usually templates.json)
 * Returns a map of name → template contents
 */
export async function resolveTemplateFilesFromJson(
	files: PartialTemplates,
): Promise<PartialTemplates> {
	const out: PartialTemplates = {};
	for (const k of Object.keys(files) as (keyof TemplateMap)[]) {
		const p = files[k];
		if (!p) continue;

		// 1) Resolve at build-time from RAW_TEMPLATES (preferred: no network)
		const raw = resolveRawFromGlob(p);
		if (typeof raw === "string") {
			out[k] = raw;
			continue;
		}

		// 2) Optional: LAST-RESORT dynamic import for dev oddities
		try {
			// @vite-ignore because p is dynamic; works only if the path is still importable
			const mod = await import(/* @vite-ignore */ p);
			// biome-ignore lint/suspicious/noExplicitAny: because
			const content = (mod as any)?.default ?? (mod as any);
			if (typeof content === "string") {
				out[k] = content;
			}
		} catch {
			// 3) No fetch fallback — we explicitly avoid runtime HTTP in production
			throw new Error(
				`Template not bundled: ${String(p)} — ensure it matches RAW_TEMPLATES glob.`,
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
	const tags = Array.isArray((note as any).tags) ? (note as any).tags : [];
	const has = (s: string) =>
		tags.some((t: any) =>
			String(t?.Type ?? t?.Name ?? "")
				.toLowerCase()
				.includes(s),
		);
	if (has("city")) return "Note-City";
	if (has("country") || has("state")) return "Note-Country";
	if (has("label")) return "Note-Label";
	if (has("milit")) return "Note-Military";
	if (has("poi") || has("marker")) return "Note-POI";

	return "Note-Label"; // fallback
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
