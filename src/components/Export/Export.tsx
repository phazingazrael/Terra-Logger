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

import afmgcss from "../../assets/afmg.css?raw";

import Templates from "./templates.json";

// Eagerly bundle every markdown under this component's templates folder.
// Adjust the glob roots if your templates live elsewhere as well.
const RAW_TEMPLATES: Record<string, string> = import.meta.glob(
	[
		"./templates/**/*.{md,markdown,txt}",
		"/src/**/templates/**/*.{md,markdown,txt}", // safety net if you import via absolute project path
	],
	{ as: "raw", eager: true },
);

function resolveRawFromGlob(requestPath: string): string | undefined {
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

async function resolveTemplateFilesFromJson(
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
				continue;
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

function remapPathsForBOTI(files: FileSpec[]): FileSpec[] {
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
			p = p.replace(/^cultures\//, `World/12. Groups/Cultures`);
		else if (p.startsWith("religions/"))
			p = p.replace(/^religions\//, `World/12. Groups/Religions`);

		return { ...f, path: p };
	});
}

function botiNoteFolder(note: TLNote): string {
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

function pickNoteTemplateKey(note: TLNote): string {
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

function resolveNoteTemplate(note: TLNote, templates: TemplateMap): string {
	const key = pickNoteTemplateKey(note);
	return templates[key] ?? templates.Note;
}

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
						22.7MB.
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
