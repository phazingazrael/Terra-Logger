/**
 * Builds Markdown and asset files from DataSets using the export builder
 * or Mustache templates.
 */

import { createNPCPortraitExportFiles } from "../NPC/portraits/export";
import Mustache from "mustache";
import type {
	DataSets,
	FileSpec,
	RenderOptions,
	TemplateMap,
} from "../../definitions/Export";
import type { TLNote } from "../../definitions/TerraLogger";
import { DEFAULT_RENDER_OPTIONS } from "./Constants";
import { botiNoteFolder, getBotiExportPath, isBotiTemplate } from "./BotiUtils";

import { buildExportDocument } from "./builder/buildExportDocument";
import { getMarkdownDocumentTemplate } from "./builder/templateRegistry";
import type { ExportSourceType } from "./builder/exportTypes";

import { exportPathKey } from "./zipUtils";
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
	obj: Record<string, unknown>,
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

type ExportNameRequest = { entity: Record<string, unknown>; base: string; folder: string };

function allocateExportNames<T extends ExportNameRequest>(requests: T[], extension: string, boti: boolean): (T & { name: string })[] {
	const key = (request: T, base = request.base) => exportPathKey(boti ? getBotiExportPath(`${request.folder}${withExt(base, extension)}`) : `${request.folder}${withExt(base, extension)}`);
	const counts = new Map<string, number>();
	for (const request of requests) counts.set(key(request), (counts.get(key(request)) ?? 0) + 1);
	// Reserve unique names first so a generated suffix cannot take another entity's filename.
	const used = new Set(requests.filter((request) => counts.get(key(request)) === 1).map((request) => key(request)));
	return requests.map((request, index) => {
		if (counts.get(key(request)) === 1) return { ...request, name: withExt(request.base, extension) };
		const ids = [request.entity.id, request.entity._id]
			.filter((value) => typeof value === "string" || (typeof value === "number" && Number.isSafeInteger(value) && value >= 0))
			.map((value) => slug(value, "")).filter(Boolean);
		const suffix = ids[0] ?? String(index + 1);
		let base = `${request.base}-${suffix}`;
		if (used.has(key(request, base)) && ids[1]) base += `-${ids[1]}`;
		const candidate = base;
		let ordinal = 2;
		while (used.has(key(request, base))) base = `${candidate}-${ordinal++}`;
		used.add(key(request, base));
		return { ...request, base, name: withExt(base, extension) };
	});
}

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
		case "NPC":
			return "npc";
		case "Era":
			return "era";
		default:
			return null;
	}
}

export function renderMarkdownFiles(
	data: DataSets,
	templates: TemplateMap,
	options?: RenderOptions,
	exports?: string[],
	onRendering?: (context: string) => void,
): FileSpec[] {
	const opt = {
		...DEFAULT_RENDER_OPTIONS,
		...(options || {}),
	} as Required<RenderOptions>;
	const files: FileSpec[] = [];

	const developmentalEraPaths: Record<string, string> = Object.create(null);
	const developmentalFolder = `${isBotiTemplate(opt.templateName) ? "World/01. Lore/Eras/Developmental" : "history/developmental"}/`;
	const developmentalDocuments = allocateExportNames(exports?.includes("Developmental Eras")
		? [...(data.DevelopmentalEras ?? [])].sort((a, b) => a.level - b.level || a._id.localeCompare(b._id)).map((era) => ({
			entity: era, folder: developmentalFolder,
			base: filenameFrom(era, opt.filenameFields.DevelopmentalEras ?? ["name", "_id"], "developmental-era"),
		})) : [], opt.extension, isBotiTemplate(opt.templateName)).map(({ entity: era, folder, name }) => {
		const path = `${folder}${name}`;
		developmentalEraPaths[era._id] = path;
		return { era, path, name };
	});
	const global = ctx(data);

	const renderBuilderContent = (
		sourceType: ExportSourceType,
		item: Record<string, unknown>,
		documentPath?: string,
	): string => {
		const template = getMarkdownDocumentTemplate(opt.templateName);

		return buildExportDocument({
			template,
			context: {
				data,
				templateId: template.id,
				sourceType,
				entity: item,
				documentPath,
				developmentalEraPaths,
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
			["note", "culture", "religion", "city", "country", "map", "npc", "era", "developmentalEra"].includes(
				sourceType,
			)
		);
	};

	if (exports?.includes("Map")) {
		onRendering?.(`Map ${data.MapInfo.mapId}`);
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

		const requests = arr.map((item, index) => {
			let folder = prefix;
			if (singular === "City") folder += `${item.country.name}/`;
			else if (singular === "NPC") {
				for (const relation of item.relationships ?? []) {
					if (relation.relatedEntityType === "city") {
						const city = data.Cities.find((city) => String(city._id) === String(relation.relatedEntityId));
						if (city) { folder = `${prefix}${city.country.name}/${city.name}/`; break; }
					} else if (relation.relatedEntityType === "country") {
						const country = data.Countries.find((country) => String(country._id) === String(relation.relatedEntityId));
						if (country) { folder = `${prefix}${country.name}/`; break; }
					} else if (relation.profession?.name) folder = `${prefix}${relation.profession.name}/`;
					else if (relation.ancestry?.name) folder = `${prefix}${relation.ancestry.name}/`;
					else folder = prefix;
				}
			} else if (singular === "Note") {
				if (isBotiTemplate(opt.templateName)) folder = botiNoteFolder(item as TLNote);
				else {
					const root = String(item.id ?? "").split(/(\d+)/)[0];
					const subDir = root === "burg" ? "city" : root === "state" || root === "stateLabel" ? "country" : root;
					folder += `${subDir}/`;
				}
			}
			return { entity: item, folder, base: filenameFrom(item, fields, `${dir}-${index + 1}`) };
		});
		const documents = allocateExportNames(requests, opt.extension, isBotiTemplate(opt.templateName));
		for (const { entity: item, base, name, folder } of documents) {
			onRendering?.(`${singular} ${item.name ?? item.title ?? ""} (${item._id ?? item.id ?? name})`);
			const sourceType = getSourceTypeFromSingular(singular);
			const path = `${folder}${name}`;
			const documentPath = isBotiTemplate(opt.templateName) ? getBotiExportPath(path) : path;
			const svgPath = `${folder}${base}.svg`;
			const exportItem = {
				...item,
				coaFilename: isBotiTemplate(opt.templateName) ? getBotiExportPath(svgPath) : svgPath,
				...(singular === "Country" ? { cities: citiesByCountryId.get(String(item.id)) ?? item.cities ?? [] } : {}),
			};
			const content = sourceType && shouldUseBuilder(sourceType, opt.templateName)
				? renderBuilderContent(sourceType, exportItem, documentPath)
				: Mustache.render(tpl, { ...global, ...exportItem, [singular]: exportItem });
			files.push({ path, name, content });
			if ((singular === "City" || singular === "Country") && item.coaSVG) {
				const svgDoc = normalizeSvgForExport(item.coaSVG);
				if (svgDoc) files.push({ path: svgPath, name: `${base}.svg`, content: svgDoc });
			}
		}
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

	if (exports?.includes("NPCs")) {
		add(
			"NPCs",
			"NPC",
			"npcs",
			data.NPCs ?? [],
			templates.NPC ?? "",
			opt.filenameFields.NPCs ?? ["name", "_id"],
		);
		onRendering?.("NPC portrait assets");
		files.push(...createNPCPortraitExportFiles(data.NPCs ?? []));
	}

	if (exports?.includes("Eras")) {
		const eras = [...(data.Eras ?? [])].sort((a, b) =>
			a.timelineStartYear - b.timelineStartYear || a._id.localeCompare(b._id));
		const documents = allocateExportNames(eras.map((era) => {
			const eraName = filenameFrom(era, opt.filenameFields.Eras ?? ["name", "_id"], "era");
			const base = isBotiTemplate(opt.templateName) && era.status === "current" ? `current-${eraName}` : eraName;
			return { entity: era, base, folder: "history/" };
		}), opt.extension, isBotiTemplate(opt.templateName));
		for (const { entity: era, folder, name } of documents) {
			onRendering?.(`Era ${era.name} (${era._id})`);
			const path = `${folder}${name}`;
			const documentPath = isBotiTemplate(opt.templateName) ? getBotiExportPath(path) : path;
			files.push({ path, name, content: renderBuilderContent("era", era, documentPath) });
		}
	}

	for (const { era, path, name } of developmentalDocuments) {
		onRendering?.(`Developmental era ${era.name} (${era._id})`);
		files.push({ path, name, content: renderBuilderContent("developmentalEra", era, path) });
	}
	return files;
}
