// components/Export/renderMarkdownFiles.ts
/**
 * Transforms DataSets into .md and .svg files using Mustache templates.
 */

import Mustache from "mustache";
import type {
	DataSets,
	FileSpec,
	RenderOptions,
	TemplateMap,
} from "../../definitions/Export";
import type { TLNote } from "../../definitions/TerraLogger";
import { DEFAULT_RENDER_OPTIONS } from "./Constants";
import { botiNoteFolder } from "./BotiUtils";
import { resolveNoteTemplate } from "./templateUtils";

// === 🔤 Filename + Slug Helpers ===

const slug = (s: unknown, fb: string) =>
	(String(s ?? "").trim() || fb)
		.normalize("NFKD")
		.replace(/\s+/g, "-")
		.replace(/[^a-zA-Z0-9._-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^\.+/, "")
		.slice(0, 120)
		.toLowerCase();

const filenameFrom = (
	// biome-ignore lint/suspicious/noExplicitAny: obj is an arbitrary object that may have any properties, so we can't give it a more specific type
	obj: Record<string, any>,
	fields: string[],
	fallback: string,
) => {
	for (const f of fields) {
		const v = obj?.[f];
		if (typeof v === "string" && v.trim()) {
			// if the value is a non-empty string, slugify it and return it
			return slug(v, fallback);
		}
		if (typeof v === "number") {
			// if the value is a number, slugify its string representation and return it
			return slug(String(v), fallback);
		}
	}
	// if no fields have a valid value, return the fallback string
	return slug("", fallback);
};

const withExt = (base: string, ext: string) => {
	if (base.endsWith(ext)) {
		// if the base string already ends with the extension, just return the
		// original base string
		return base;
	}
	// if the base string doesn't already end with the extension, append the
	// extension to the base string and return the result
	return `${base}${ext}`;
};

function toFullSvg(svg: string): string {
	const raw = (svg ?? "").trim();
	if (!raw) return "";

	// Wrap fragments
	const hasRoot = /<svg[\s>]/i.test(raw);
	const base = hasRoot ? raw : `<svg>${raw}</svg>`;

	// Parse and normalize
	const parser = new DOMParser();
	const doc = parser.parseFromString(base, "image/svg+xml");
	const root = doc.documentElement;

	// If parsing failed or root isn't <svg>, just return original
	if (!root || root.nodeName.toLowerCase() !== "svg") return raw;

	// Ensure namespaces
	if (!root.getAttribute("xmlns")) {
		root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	}
	const usesXlink =
		/\bxlink:/i.test(base) || !!doc.querySelector("[xlink\\:href]");
	if (usesXlink && !root.getAttribute("xmlns:xlink")) {
		root.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
	}

	let out = new XMLSerializer().serializeToString(doc);
	if (!/^\s*<\?xml/i.test(out)) {
		out = `<?xml version="1.0" encoding="UTF-8"?>\n${out}`;
	}
	return out;
}

function ctx(data: DataSets) {
	// shallow-copy the DataSets object to create a context object
	const context = { ...data };

	// return the context object
	return context;
}

export function renderMarkdownFiles(
	data: DataSets,
	templates: TemplateMap,
	options?: RenderOptions,
	exports?: string[],
): FileSpec[] {
	const opt = {
		...DEFAULT_RENDER_OPTIONS,
		...(options || {}),
	} as Required<RenderOptions>;
	const files: FileSpec[] = [];

	const global = ctx(data);

	if (exports?.includes("Map")) {
		const Parser = new DOMParser();

		const mapSvgDoc = Parser.parseFromString(data.MapInfo.SVG, "image/svg+xml");
		const firstElement = mapSvgDoc.querySelector("svg")?.firstElementChild;

		if (firstElement) {
			const newStyle = document.createElement("style");
			newStyle.setAttribute("type", "text/css");
			newStyle.innerHTML = opt.css;
			mapSvgDoc.querySelector("svg")?.insertBefore(newStyle, firstElement);
			const newSvg = mapSvgDoc.querySelector("svg")?.outerHTML ?? "";
			files.push({
				path: "World Map.svg",
				name: "World Map.svg",
				content: newSvg,
			});
		}

		const mapMd = Mustache.render(templates.MapInfo, {
			...global,
			...data.MapInfo,
			MapInfo: data.MapInfo,
		});

		files.push({
			path: `${data.MapInfo.info.name} ${opt.mapInfoFilename}`,
			name: `${data.MapInfo.info.name} ${opt.mapInfoFilename}`,
			content: mapMd,
		});
	}

	type Coll = keyof Omit<DataSets, "MapInfo">;
	const add = (
		_coll: Coll,
		singular: keyof TemplateMap,
		dir: string,
		// biome-ignore lint/suspicious/noExplicitAny: arr is meant to accept multiple types as it's a simplified file output.
		arr: any[],
		tpl: string,
		fields: string[],
	) => {
		const prefix = `${dir}/`;

		arr.forEach((item, i) => {
			const base = filenameFrom(item, fields, `${dir}-${i + 1}`);
			const name = withExt(base, opt.extension);
			const content = Mustache.render(tpl, {
				...global,
				...item,
				[singular]: item,
			});

			const rawSvg =
				singular === "City" || singular === "Country" ? item.coaSVG : undefined;

			if (singular === "City") {
				files.push({
					path: `${prefix}${item.country.name}/${name}`,
					name,
					content,
				});
				if (rawSvg) {
					const svgDoc = toFullSvg(String(rawSvg)); // uses helper from earlier
					files.push({
						path: `${prefix}${item.country.name}/${base}.svg`,
						name: `${base}.svg`,
						content: svgDoc,
					});
				}
			} else if (singular === "Country") {
				item.cities = data.Cities?.filter((c) => c.country.id === item.id);
				files.push({ path: `${prefix}${name}`, name, content });
				if (rawSvg) {
					const svgDoc = toFullSvg(String(rawSvg)); // uses helper from earlier
					files.push({
						path: `${prefix}${base}.svg`,
						name: `${base}.svg`,
						content: svgDoc,
					});
				}
			} else if (singular === "Note") {
				const name = withExt(base, opt.extension);

				if ((options?.templateName ?? "") === "Bag of Tips Inspired") {
					// choose the correct template string based on note type
					const tplForNote = resolveNoteTemplate(item as TLNote, templates);

					const content = Mustache.render(tplForNote, {
						...global,
						...(item as any),
						Note: item,
					});
					const folder = botiNoteFolder(item as TLNote);
					files.push({ path: `${folder}${name}`, name, content });
				} else {
					// original (non-BOTI) behavior
					const idParts = (item.id as string).split(/(\d+)/);
					const subDir =
						idParts[0] === "burg"
							? "city"
							: idParts[0] === "state" || idParts[0] === "stateLabel"
								? "country"
								: idParts[0];
					files.push({ path: `${prefix}${subDir}/${name}`, name, content });
				}
			} else {
				files.push({ path: `${prefix}${name}`, name, content });
			}
		});
	};

	if (exports?.includes("Cities")) {
		add(
			"Cities",
			"City",
			"cities",
			data.Cities ?? [],
			templates.City ?? "",
			opt.filenameFields.Cities ?? [],
		);
	}

	if (exports?.includes("Countries")) {
		add(
			"Countries",
			"Country",
			"countries",
			data.Countries ?? [],
			templates.Country ?? "",
			opt.filenameFields.Countries ?? [],
		);
	}

	if (exports?.includes("Cultures")) {
		add(
			"Cultures",
			"Culture",
			"cultures",
			data.Cultures ?? [],
			templates.Culture ?? "",
			opt.filenameFields.Cultures ?? [],
		);
	}

	if (exports?.includes("Notes")) {
		add(
			"Notes",
			"Note",
			"notes",
			data.Notes ?? [],
			templates.Note ?? "",
			opt.filenameFields.Notes ?? [],
		);
	}

	if (exports?.includes("Religions")) {
		add(
			"Religions",
			"Religion",
			"religions",
			data.Religions ?? [],
			templates.Religion ?? "",
			opt.filenameFields.Religions ?? [],
		);
	}

	return files;
}
