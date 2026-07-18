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

import { buildExportDocument } from "./builder/buildExportDocument";
import { getMarkdownDocumentTemplate } from "./builder/templateRegistry";
import type { ExportSourceType } from "./builder/exportTypes";

import { injectSvgStyle, normalizeSvgForExport } from "./svgExportUtils";

// === Filename + Slug Helpers ===

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

function ctx(data: DataSets) {
	// shallow-copy the DataSets object to create a context object
	const context = { ...data };

	// return the context object
	return context;
}

function getSourceTypeFromSingular(
	singular: keyof TemplateMap,
): ExportSourceType | null {
	switch (singular) {
		case "MapInfo":
			return "map";
		case "City":
			return "city";
		case "Country":
			return "country";
		case "Culture":
			return "culture";
		case "Religion":
			return "religion";
		case "Note":
			return "note";
		default:
			return null;
	}
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

	const renderBuilderContent = (
		sourceType: ExportSourceType,
		item: Record<string, unknown>,
	): string => {
		const template = getMarkdownDocumentTemplate(opt.templateName);

		return buildExportDocument({
			template,
			context: {
				data,
				templateId: template.id,
				sourceType,
				entity: item,
			},
		});
	};

	const shouldUseBuilder = (
		sourceType: ExportSourceType,
		templateName: string,
	): boolean => {
		const template = getMarkdownDocumentTemplate(templateName);

		return (
			(template.id === "default" || template.id === "boti") &&
			["note", "culture", "religion", "city", "country", "map"].includes(
				sourceType,
			)
		);
	};

	if (exports?.includes("Map")) {
		const newSvg = injectSvgStyle(data.MapInfo.SVG, opt.css);

		if (newSvg) {
			files.push({
				path: "World Map.svg",
				name: "World Map.svg",
				content: newSvg,
			});
		}

		const mapEntity = data.MapInfo as unknown as Record<string, unknown>;

		const mapMd = shouldUseBuilder("map", opt.templateName)
			? renderBuilderContent("map", mapEntity)
			: Mustache.render(templates.MapInfo, {
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

	const citiesByCountryId = new Map<string, unknown[]>();

	for (const city of data.Cities ?? []) {
		const countryId = String(city.country?.id ?? "");

		if (!countryId) continue;

		const cities = citiesByCountryId.get(countryId) ?? [];
		cities.push(city);
		citiesByCountryId.set(countryId, cities);
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
			const sourceType = getSourceTypeFromSingular(singular);

			const exportItem =
				singular === "Country"
					? {
							...item,
							cities:
								citiesByCountryId.get(String(item.id)) ?? item.cities ?? [],
						}
					: item;

			const usesBuilder = Boolean(
				sourceType && shouldUseBuilder(sourceType, opt.templateName),
			);

			const content =
				usesBuilder && sourceType
					? renderBuilderContent(sourceType, exportItem)
					: Mustache.render(tpl, {
							...global,
							...exportItem,
							[singular]: exportItem,
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
					const svgDoc = normalizeSvgForExport(rawSvg);

					if (svgDoc) {
						files.push({
							path: `${prefix}${item.country.name}/${base}.svg`,
							name: `${base}.svg`,
							content: svgDoc,
						});
					}
				}
			} else if (singular === "Country") {
				files.push({ path: `${prefix}${name}`, name, content });
				if (rawSvg) {
					const svgDoc = normalizeSvgForExport(rawSvg);

					if (svgDoc) {
						files.push({
							path: `${prefix}${base}.svg`,
							name: `${base}.svg`,
							content: svgDoc,
						});
					}
				}
			} else if (singular === "Note") {
				const name = withExt(base, opt.extension);

				if (opt.templateName === "Bag of Tips Inspired") {
					const folder = botiNoteFolder(item as TLNote);

					files.push({
						path: `${folder}${name}`,
						name,
						content,
					});
				} else {
					const idParts = (item.id as string).split(/(\d+)/);
					const subDir =
						idParts[0] === "burg"
							? "city"
							: idParts[0] === "state" || idParts[0] === "stateLabel"
								? "country"
								: idParts[0];

					files.push({
						path: `${prefix}${subDir}/${name}`,
						name,
						content,
					});
				}
			} else {
				files.push({ path: `${prefix}${name}`, name, content });
			}
		});
	};

	if (exports?.includes("Cities")) {
		console.time("[export] Cities");

		add(
			"Cities",
			"City",
			"cities",
			data.Cities ?? [],
			templates.City ?? "",
			opt.filenameFields.Cities ?? [],
		);

		console.timeEnd("[export] Cities");
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
