import Mustache from "mustache";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
	Alert,
	AlertTitle,
	Box,
	Button,
	FormControl,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import type {
	DataSets,
	RenderOptions,
	FileSpec,
	PartialTemplates,
	TemplateMap,
} from "../../definitions/Export";
import type { TLNote } from "../../definitions/TerraLogger";

import Templates from "./templates.json";

import afmgcss from "../../assets/afmg.css?raw";

async function resolveTemplateFilesFromJson(
	files: PartialTemplates, // from Templates[tplIndex].Files
	baseUrl: string = import.meta.url, // resolve relative paths against this file
): Promise<PartialTemplates> {
	const out: PartialTemplates = {};
	for (const k of Object.keys(files) as (keyof TemplateMap)[]) {
		const p = files[k];
		if (!p) continue;

		// 1) Try dynamic import (?raw returns string in Vite/modern bundlers)
		try {
			// @vite-ignore allows non-static path
			const mod = await import(/* @vite-ignore */ p);
			// biome-ignore lint/suspicious/noExplicitAny: accepts any markdown raw string.
			const content = (mod as any)?.default ?? (mod as any);
			if (typeof content === "string") {
				out[k] = content;
				continue;
			}
		} catch {
			// fall through to fetch
		}

		// 2) Fallback to fetch via an asset URL resolved against this module
		//    Works in dev and build; bundler rewrites to hashed asset.
		const url = new URL(p, baseUrl).toString();
		const res = await fetch(url);
		if (!res.ok)
			throw new Error(`Failed to fetch template for ${k}: ${res.status}`);
		out[k] = await res.text();
	}
	return out;
}

function remapPathsForBOTI(files: FileSpec[]): FileSpec[] {
	return files.map((f) => {
		let p = f.path;

		// Move core collections into BOTI folders
		if (p.startsWith("cities/"))
			p = p.replace(/^cities\//, `Campaign/06. Cities/`);
		else if (p.startsWith("countries/"))
			p = p.replace(/^countries\//, `Campaign/04. Countries/`);
		else if (p.startsWith("notes/"))
			p = p.replace(/^notes\//, `Campaign/16. Notes/`);
		else if (p.startsWith("cultures/"))
			p = p.replace(/^cultures\//, `Campaign/12. Groups/Cultures`);
		else if (p.startsWith("religions/"))
			p = p.replace(/^religions\//, `Campaign/12. Groups/Religions`);

		return { ...f, path: p };
	});
}

function botiNoteFolder(note: TLNote): string {
	const id = String(note?.id || "").toLowerCase();
	const root = id.match(/^[a-zA-Z]+/)?.[0] || "";
	const base = `Campaign/16. Notes`;

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

function makeZipName(baseZipName: string, tplName: string, mapName: string) {
	if (tplName === "Bag of Tips Inspired") {
		return `${mapName} Vault.zip`;
	}
	return baseZipName.endsWith(".zip") ? baseZipName : `${baseZipName}.zip`;
}

type ZipEntry = {
	path: string;
	name: string;
	content: string | Uint8Array;
	zipOptions?: any;
};

const BOTI_BASE_ZIP = "expoRes/boti-assets/Vault.zip"; // ← public/ path to the base vault zip

function withBase(pathLike: string) {
	const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
	const rel = String(pathLike).replace(/^\/+/, "");
	return `${base}/${rel}`;
}

function normalizeZipPath(p: string) {
	return String(p || "")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "");
}

// Merge generated entries into the base vault zip from public/ and download.
// .obsidian/** is protected (not overwritten).
async function mergeZipWithBase(
	publicZipRelPath: string,
	entries: ReadonlyArray<ZipEntry>,
	finalZipName: string,
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const { default: JSZip } = await import("jszip");

	const url = withBase(publicZipRelPath);
	const res = await fetch(url, { cache: "no-cache" });
	if (!res.ok)
		throw new Error(`Failed to fetch base vault zip: ${url} (${res.status})`);
	const ab = await res.arrayBuffer();

	const baseZip = await JSZip.loadAsync(ab);

	const PROTECTED_PREFIXES = [".obsidian/"]; // keep vault settings/plugins intact
	for (const e of entries) {
		const pathInZip = normalizeZipPath(e.path);
		if (PROTECTED_PREFIXES.some((p) => pathInZip.toLowerCase().startsWith(p)))
			continue;
		const opts =
			e.zipOptions ??
			(e.content instanceof Uint8Array ? { binary: true } : undefined);
		baseZip.file(pathInZip, e.content as any, opts); // overwrite or add
	}

	const blob = await baseZip.generateAsync(
		{ type: "blob", compression: "DEFLATE" },
		(meta) => onProgress?.(Math.round(meta.percent), meta.currentFile ?? ""),
	);

	const href = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = href;
	a.download = finalZipName.endsWith(".zip")
		? finalZipName
		: `${finalZipName}.zip`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(href);

	return blob;
}

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
	const { default: JSZip } = await import("jszip");
	const zip = new JSZip();

	for (const f of files) {
		zip.file(f.path, f.content); // content is string
	}

	const blob = await zip.generateAsync(
		{ type: "blob", compression: "DEFLATE" },
		onProgress
			? (m) => onProgress(Math.round(m.percent), m.currentFile ?? "")
			: undefined,
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
	templates?: PartialTemplates;
	zipName?: string;
	className?: string;
}) {
	const { data, templates, zipName = "markdown.zip", className } = props;

	// State
	const [tplIndex, setTplIndex] = useState<number>(0);
	const [status, setStatus] = useState<string>("Idle");
	const [percent, setPercent] = useState<number>(0);
	const [logs, setLogs] = useState<string[]>([]);
	const exportingRef = useRef(false);
	const exported = useRef(false);
	const [zipDownloaded, setZipDownloaded] = useState(false);

	const lastPctRef = useRef(0);
	const lastFileRef = useRef<string | undefined>(undefined);
	const termRef = useRef<HTMLDivElement | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Must update each time logs change
	useEffect(() => {
		const el = termRef.current;
		if (el) el.scrollTo({ top: el.scrollHeight });
	}, [logs]);

	const log = (type: string, line: string) =>
		setLogs((l) => [
			...l,
			`[${new Date().toISOString().slice(0, 19).replace("T", " ")}] [{${type}}] ${line}`,
		]);

	// ⬇️ Derive current template name BEFORE clicking Export (for warning box + final name preview)
	const tplCfg =
		(Templates as Array<{ Name: string; Files: PartialTemplates }>)[tplIndex] ??
		null;
	const tplName = tplCfg?.Name ?? "Default";
	const isBOTI = tplName === "Bag of Tips Inspired";
	const finalZipName = makeZipName(zipName, tplName, data.MapInfo.info.name);

	// Main export
	const run = async () => {
		if (exportingRef.current) return;
		exportingRef.current = true;
		exported.current = false;
		setPercent(0);
		setLogs([]);
		lastPctRef.current = 0;
		lastFileRef.current = undefined;

		try {
			log("INFO", "▶ export started");
			log("INFO", `• ZipName="${finalZipName}"`);
			log(
				"INFO",
				`• counts: ${data.Cities ? `cities=${data.Cities?.length}, ` : ""}${
					data.Countries ? `countries=${data.Countries?.length}, ` : ""
				}${data.Cultures ? `cultures=${data.Cultures?.length}, ` : ""}${
					data.Notes ? `notes=${data.Notes?.length}, ` : ""
				}${data.Religions ? `religions=${data.Religions?.length}` : ""}`,
			);

			setStatus("Preparing templates…");
			const loadedFiles = tplCfg?.Files
				? await resolveTemplateFilesFromJson(tplCfg.Files)
				: {};
			const tpls = fillMissingTemplates({
				...loadedFiles,
				...(templates || {}),
			});
			log("INFO", `✔ templates ready (${tplCfg?.Name ?? "Defaults"})`);

			setStatus("Rendering markdown files…");
			let files = renderMarkdownFiles(data, tpls, {
				templateName: tplName,
			});

			if (isBOTI) {
				files = remapPathsForBOTI(files);
			}

			const entries: ZipEntry[] = files.map((f) => ({ ...f }));

			log("INFO", `✔ rendered ${files.length} files`);

			setStatus("Zipping…");
			const nameForZip = finalZipName;

			let blob: Blob | null = null;
			if (isBOTI) {
				blob = await mergeZipWithBase(
					BOTI_BASE_ZIP,
					entries,
					nameForZip,
					(p, file) => {
						setPercent(p);
						setStatus(`Zipping… ${p}%`);
						if (file && file !== lastFileRef.current) {
							lastFileRef.current = file;
							log("FILE", `… writing ${file}`);
						}
					},
				);
			} else {
				blob = await zipFiles(files, nameForZip, (p, file) => {
					setPercent(p);
					setStatus(`Zipping… ${p}%`);
					if (file && file !== lastFileRef.current) {
						lastFileRef.current = file;
						log("FILE", `… writing ${file}`);
					}
				});
			}

			log(
				"INFO",
				`✔ zip generated (${(blob.size / 1024).toFixed(1)} KB), download triggered`,
			);
			setStatus("Done. Download started.");
			setZipDownloaded(true);
			exported.current = true;
		} catch (e: any) {
			const msg = e?.message ?? String(e);
			log("ERROR", `✖ error: ${msg}`);
			setStatus(`Error: ${msg}`);
		} finally {
			exportingRef.current = false;
		}
	};

	const downloadLogs = () => {
		const logsText = logs.join("\n");
		const blob = new Blob([logsText], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${finalZipName.replace(".zip", "")} export log.txt`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	return (
		<div className={className ?? "p-2 border rounded"}>
			<FormControl size="small" sx={{ minWidth: 240, mr: 2 }}>
				<InputLabel id="tpl-label">Template</InputLabel>
				<Select
					labelId="tpl-label"
					label="Template"
					value={String(tplIndex)}
					onChange={(e: SelectChangeEvent<string>) =>
						setTplIndex(Number(e.target.value))
					}
				>
					{(Templates as Array<{ Name: string }>).map((t, idx) => (
						<MenuItem key={`${t.Name}-${idx}`} value={idx}>
							{t.Name ?? `Template ${idx + 1}`}
						</MenuItem>
					))}
				</Select>
			</FormControl>

			{/* Export button */}
			<Button
				type="button"
				onClick={run}
				variant="contained"
				color="success"
				disabled={exportingRef.current}
			>
				{exportingRef.current ? "Exporting…" : "Export Markdown"}
			</Button>
			{/* Warning box shown BEFORE export when BOTI is selected */}
			{isBOTI && !exportingRef.current && !exported.current && (
				<Alert severity="warning" sx={{ my: 2 }}>
					<AlertTitle>
						Bag of Tips Inspired Vault Export - Vault may take time to index at
						initial load.
					</AlertTitle>
					<strong>
						This Template has a large initial file size, Core assets zipped are
						47.8MB.
					</strong>
					<p>
						This template will:
						<ul style={{ margin: 0, paddingLeft: 18 }}>
							<li>Create a custom Obsidian Vault folder structure</li>
							<li>
								Contain Custom CSS Snippets
								<ul>
									<li>Terra-Logger Styles to tweak Obsidian's appearance</li>
									<li>ITS Theme Callouts, Such as Infoboxes etc.</li>
									<li>Bag Of Tips Inspired Callouts</li>
									<li>Custom Terra-Logger Callouts</li>
									<li>A Small Collection of Community Callouts</li>
								</ul>
							</li>
							<li>
								Include several basic file templates for use in your vault
								<ul>
									<li>Look under z_Templates for more info</li>
								</ul>
							</li>
							<li>
								Download as <strong>{finalZipName}</strong>.
							</li>
						</ul>
					</p>
				</Alert>
			)}
			{zipDownloaded && (
				<Button
					type="button"
					color="secondary"
					variant="contained"
					onClick={downloadLogs}
					style={{ float: "right" }}
				>
					Download Logs
				</Button>
			)}
			<div>
				<LinearProgressWithLabel value={percent} />

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
						marginTop: 8,
					}}
				>
					{logs.length === 0 ? (
						<div>{`[${new Date().toISOString().slice(0, 19).replace("T", " ")}] [{Ready}] ready. click “Export Markdown”.`}</div>
					) : (
						logs.map((line) => <div key={uuidv4()}>{line}</div>)
					)}
				</div>
				<div style={{ marginTop: 8, fontSize: 12, color: "#374151" }}>
					{status} {percent ? `(${percent}%)` : ""}
				</div>
			</div>
		</div>
	);
}

export default MarkdownExportPanel;
