import Mustache from "mustache";
import JSZip from "jszip";
import { useEffect, useRef, useState } from "react";

import { Box, LinearProgress, Typography } from "@mui/material";

import PropTypes from "prop-types";

import type {
	DataSets,
	RenderOptions,
	FileSpec,
	PartialTemplates,
	TemplateMap,
} from "../../definitions/Export";

function LinearProgressWithLabel(props: { value: number }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center" }}>
			<Box sx={{ width: "100%", mr: 1 }}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box sx={{ minWidth: 35 }}>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					{`${Math.round(props.value)}%`}
				</Typography>
			</Box>
		</Box>
	);
}

const DEFAULT_RENDER_OPTIONS: Required<RenderOptions> = {
	mapInfoFilename: "map info.md", // default filename for main map info file
	useFolders: true, // whether to use folders to organize markdown files
	filenameFields: {
		// which fields to use when generating filenames for each dataset
		Cities: ["name", "title", "id", "_id"],
		Countries: ["name", "nameFull", "id", "_id"],
		Cultures: ["name", "code", "id", "_id"],
		Notes: ["name", "id", "_id"],
		Religions: ["name", "code", "_id"],
	},
	extension: ".md", // default file extension for markdown files
	css: `#map {
  background-color: #000000;
  mask-mode: alpha;
  mask-clip: no-clip;
  fill-rule: evenodd;
  user-select: none;
}

#prec text {
  font-size: 32px;
  stroke: none;
  text-shadow: 1px 1px 1px #9daac9;
  user-select: none;
}

#population,
#cells,
#compass {
  fill: none;
}

#biomes {
  stroke-width: 0.7;
}

#landmass {
  mask: url(#land);
  fill-rule: evenodd;
}

#lakes,
#coastline,
#armies,
#ice,
#emblems {
  cursor: pointer;
}

#temperature {
  font-family: var(--sans-serif);
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: central;
  text-shadow: 0px 0px 10px white;
  fill-rule: evenodd;
}

#oceanLayers,
#terrs {
  fill-rule: evenodd;
}

#coastline {
  fill: none;
  stroke-linejoin: round;
}

t,
#regions,
#cults,
#relig,
#biomes,
#provincesBody,
#terrs,
#tooltip,
#temperature,
#texture,
#landmass,
#vignette,
#fogging {
  pointer-events: none;
}

#armies text {
  pointer-events: none;
  user-select: none;
  stroke: none;
  fill: #fff;
  text-shadow: 0 0 4px #000;
  dominant-baseline: central;
  text-anchor: middle;
  font-family: var(--sans-serif);
  fill-opacity: 1;
}

#armies text.regimentIcon {
  font-size: 0.8em;
}

#statesBody {
  stroke-width: 3;
}

#statesHalo {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

#provincesBody {
  stroke-width: 0.2;
}

#statesBody,
#provincesBody,
#relig,
#biomes,
#cults {
  stroke-linejoin: round;
  fill-rule: evenodd;
}

#statesBody,
#provincesBody,
#relig,
#cults {
  mask: url(#land);
}

#borders {
  stroke-linejoin: round;
  fill: none;
}

#rivers {
  stroke: none;
  mask: url(#land);
  cursor: pointer;
  fill-rule: nonzero;
}

#anchors {
  pointer-events: none;
}

#terrain,
#burgIcons {
  cursor: pointer;
}

.strokes {
  stroke-width: 0.08px;
  width: 2px;
  stroke: #5c5c70;
  stroke-dasharray: 0.5, 0.7;
  stroke-linecap: round;
}

#routes {
  fill: none;
  cursor: pointer;
}

#labels {
  text-anchor: middle;
  dominant-baseline: central;
  cursor: pointer;
}

#provinceLabels,
#burgLabels {
  dominant-baseline: alphabetic;
  text-anchor: middle;
}

#routeLength,
#coastlineArea {
  background-color: #eeeeee;
  border: 1px solid #a5a5a5;
  line-height: 1.3em;
  cursor: default;
}`,
};

const slug = (s: unknown, fb: string) =>
	(String(s ?? "").trim() || fb)
		.normalize("NFKD")
		.replace(/\s+/g, "-")
		.replace(/[^a-zA-Z0-9._-]/g, "")
		.replace(/-+/g, "-")
		.replace(/^\.+/, "")
		.slice(0, 120)
		.toLowerCase();

function filenameFrom(
	// biome-ignore lint/suspicious/noExplicitAny: obj is an arbitrary object that may have any properties, so we can't give it a more specific type
	obj: Record<string, any>,
	fields: string[],
	fallback: string,
) {
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
}

function withExt(base: string, ext: string) {
	if (base.endsWith(ext)) {
		// if the base string already ends with the extension, just return the
		// original base string
		return base;
	}
	// if the base string doesn't already end with the extension, append the
	// extension to the base string and return the result
	return `${base}${ext}`;
}

function ctx(data: DataSets) {
	// shallow-copy the DataSets object to create a context object
	const context = { ...data };

	// return the context object
	return context;
}

export function fillMissingTemplates(partial: PartialTemplates): TemplateMap {
	// biome-ignore lint/suspicious/noExplicitAny: This is required because the type of the variable full is not known until the function returns.
	const full: any = {};

	// biome-ignore lint/complexity/noForEach: This is required because we need to iterate over the keys of the defaults object.
	(Object.keys(defaults) as (keyof TemplateMap)[]).forEach((k) => {
		// If the partial object has the key, use the value of that key. If
		// not, use the default template for that key.
		full[k] = partial[k] ?? defaults[k];
	});

	// Return the full object, which is a full implementation of the
	// TemplateMap interface.
	return full as TemplateMap;
}

const defaults: TemplateMap = {
	// The default template for the key "MapInfo".
	MapInfo: "# {{MapInfo.info.name}}\n",
	// The default template for the key "City".
	City: "# {{City.name}}\n",
	// The default template for the key "Country".
	Country: "# {{Country.name}}\n",
	// The default template for the key "Culture".
	Culture: "# {{Culture.name}}\n",
	// The default template for the key "Note".
	Note: "# {{Note.name}}\n",
	// The default template for the key "Religion".
	Religion: "# {{Religion.name}}\n",
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

export function renderMarkdownFiles(
	data: DataSets,
	templates: TemplateMap,
	options?: RenderOptions,
): FileSpec[] {
	const opt = {
		...DEFAULT_RENDER_OPTIONS,
		...(options || {}),
	} as Required<RenderOptions>;

	const files: FileSpec[] = [];

	const global = ctx(data);

	const mapMd = Mustache.render(templates.MapInfo, {
		...global,
		...data.MapInfo,
		MapInfo: data.MapInfo,
	});

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

	files.push({
		path: `${data.MapInfo.info.name} ${opt.mapInfoFilename}`,
		name: `${data.MapInfo.info.name} ${opt.mapInfoFilename}`,
		content: mapMd,
	});

	type Coll = keyof Omit<DataSets, "MapInfo">;
	const add = (
		_coll: Coll,
		singular: keyof TemplateMap,
		dir: string,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		arr: any[],
		tpl: string,
		fields: string[],
	) => {
		const prefix = opt.useFolders ? `${dir}/` : "";

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
				files.push({ path: `${prefix}${name}`, name, content });
				if (rawSvg) {
					const svgDoc = toFullSvg(String(rawSvg)); // uses helper from earlier
					files.push({
						path: `${prefix}${base}.svg`,
						name: `${base}.svg`,
						content: svgDoc,
					});
				}
			} else {
				files.push({ path: `${prefix}${name}`, name, content });
			}
		});
	};

	add(
		"Cities",
		"City",
		"cities",
		data.Cities ?? [],
		templates.City ?? "",
		opt.filenameFields.Cities ?? [],
	);
	add(
		"Countries",
		"Country",
		"countries",
		data.Countries ?? [],
		templates.Country ?? "",
		opt.filenameFields.Countries ?? [],
	);
	add(
		"Cultures",
		"Culture",
		"cultures",
		data.Cultures ?? [],
		templates.Culture ?? "",
		opt.filenameFields.Cultures ?? [],
	);
	add(
		"Notes",
		"Note",
		"notes",
		data.Notes ?? [],
		templates.Note ?? "",
		opt.filenameFields.Notes ?? [],
	);
	add(
		"Religions",
		"Religion",
		"religions",
		data.Religions ?? [],
		templates.Religion ?? "",
		opt.filenameFields.Religions ?? [],
	);

	return files;
}

export async function zipFiles(
	files: FileSpec[],
	zipName = "export.zip",
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const zip = new JSZip();

	for (const file of files) {
		zip.file(file.path, file.content);
	}

	const blob = await zip.generateAsync(
		{ type: "blob", compression: "DEFLATE" },
		onProgress
			? (meta) => {
					onProgress(Math.round(meta.percent), meta.currentFile ?? "");
				}
			: () => {},
	);

	const url = URL.createObjectURL(blob);

	const a = document.createElement("a");
	a.href = url;
	a.download = zipName;
	document.body.appendChild(a);
	a.click();
	a.remove();

	URL.revokeObjectURL(url);

	return blob;
}

export function MarkdownExportPanel(props: {
	data: DataSets;
	templates?: PartialTemplates; // provide raw strings
	zipName?: string;
	className?: string;
	useFolders?: boolean; // static toggle (no internal state)
}) {
	const {
		data,
		templates,
		zipName = "markdown.zip",
		className,
		useFolders = true,
	} = props;

	// State variables
	const [status, setStatus] = useState<string>("Idle"); // shows the current status of the export process
	const [percent, setPercent] = useState<number>(0); // shows the percentage complete of the export process
	const [logs, setLogs] = useState<string[]>([]); // an array of log messages that show the progress of the export
	const exportingRef = useRef(false); // a flag that indicates whether the export is currently running

	// References to the last progress percentage and the last file that was being processed
	const lastPctRef = useRef(0);
	const lastFileRef = useRef<string | undefined>(undefined);

	// Ref to the terminal-style element that displays the log messages
	const termRef = useRef<HTMLDivElement | null>(null);

	// Effect that runs when the logs state variable changes, and scrolls the terminal-style element to the bottom
	// biome-ignore lint/correctness/useExhaustiveDependencies: See above comment
	useEffect(() => {
		const el = termRef.current;
		if (el) el.scrollTo({ top: el.scrollHeight });
	}, [logs]);

	// a function that returns the current time as a string, formatted like "HH:MM:SS"
	const time = () =>
		new Date().toLocaleTimeString(undefined, { hour12: false });

	// a function that adds a new log message to the logs state variable
	const log = (line: string) => setLogs((l) => [...l, `[${time()}] ${line}`]);

	// The main export function
	const run = async () => {
		if (exportingRef.current) return; // if the export is already running, do nothing
		exportingRef.current = true; // set the flag to indicate that the export is running
		setPercent(0); // reset the progress percentage
		setLogs([]); // reset the log messages
		lastPctRef.current = 0; // reset the last progress percentage
		lastFileRef.current = undefined; // reset the last file that was being processed

		try {
			log("▶ export started");
			log(`• options: useFolders=${String(useFolders)} zipName="${zipName}"`);
			log(
				`• counts: ${data.Cities ? `cities=${data.Cities?.length},` : ""} ${data.Countries ? `countries=${data.Countries?.length},` : ""}  ${data.Cultures ? `cultures=${data.Cultures?.length},` : ""} ${data.Notes ? `notes=${data.Notes?.length},` : ""} ${data.Religions ? `religions=${data.Religions?.length}` : ""}`,
			);

			setStatus("Preparing templates…");
			log("→ using selected template (or default)…");

			const tpls = fillMissingTemplates(templates || {});
			log("✔ templates ready");

			setStatus("Rendering markdown files…");
			const files = renderMarkdownFiles(data, tpls, { useFolders });
			log(`✔ rendered ${files.length} files`);

			setStatus("Zipping…");
			const blob = await zipFiles(files, zipName, (p, file) => {
				setPercent(p);
				setStatus(`Zipping… ${p}%`);
				if (file && file !== lastFileRef.current) {
					lastFileRef.current = file;
					log(`… writing ${file}`);
				}
				if (p === 100 || p - lastPctRef.current >= 10) {
					lastPctRef.current = p;
					log(`progress ${p}%`);
				}
			});

			log(
				`✔ zip generated (${(blob.size / 1024).toFixed(1)} KB), download triggered`,
			);
			setStatus("Done. Download started.");

			// biome-ignore lint/suspicious/noExplicitAny: We want to catch the error here, regardless of it's type
		} catch (e: any) {
			const msg = e?.message ?? String(e); // get the error message
			log(`✖ error: ${msg}`); // log an error message
			setStatus(`Error: ${msg}`); // set the status to indicate an error
		} finally {
			exportingRef.current = false; // reset the flag to indicate that the export is not running
		}
	};

	return (
		<div className={className ?? "p-2 border rounded"}>
			{/* Button to trigger the export */}
			<button
				type="button"
				onClick={run}
				disabled={exportingRef.current} // disable the button if the export is running
				style={{ marginBottom: 8 }}
			>
				{exportingRef.current ? "Exporting…" : "Export Markdown"}
				{/* show "Working…" if the export is running, otherwise show "Export Markdown" */}
			</button>
			<LinearProgressWithLabel value={percent} />
			{/* Terminal-style element to display the log messages */}
			<div
				ref={termRef}
				role="log"
				aria-live="polite"
				style={{
					fontFamily:
						'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
					background: "#111827",
					color: "#e5e7eb",
					border: "1px solid #1f2937",
					borderRadius: 8,
					padding: 12,
					height: 220,
					overflow: "auto",
					whiteSpace: "pre-wrap",
					lineHeight: 1.35,
				}}
			>
				{logs.length === 0 ? (
					<div>[{time()}] ready. click “Export Markdown”.</div>
				) : (
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					logs.map((line, i) => <div key={i}>{line}</div>)
				)}
			</div>

			{/* One-line status element */}
			<div style={{ marginTop: 8, fontSize: 12, color: "#374151" }}>
				{status} {percent ? `(${percent}%)` : ""}
			</div>
		</div>
	);
}

export default MarkdownExportPanel;

LinearProgressWithLabel.propTypes = {
	value: PropTypes.number.isRequired,
};
