import {
	Alert,
	AlertTitle,
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	FormGroup,
	InputLabel,
	LinearProgress,
	MenuItem,
	Select,
	Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Templates from "./templates.json";

import { BOTI_BASE_ZIP } from "./Constants";
import { remapPathsForBOTI, makeZipName } from "./BotiUtils";
import {
	resolveTemplateFilesFromJson,
	fillMissingTemplates,
} from "./templateUtils";
import { mergeZipWithBase, zipFiles } from "./zipUtils";
import { renderMarkdownFiles } from "./renderMarkdownFiles";

import type {
	DataSets,
	PartialTemplates,
	ZipEntry,
} from "../../definitions/Export";
import type { SelectChangeEvent } from "@mui/material/Select";

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

const defaultExports: Array<string> = [
	"Cities",
	"Countries",
	"Cultures",
	"Map",
	"Notes",
	"Religions",
	// "NPCs",
];

export function MarkdownExportPanel(props: {
	data: DataSets;
	templates?: PartialTemplates;
	zipName?: string;
	className?: string;
}) {
	const { data, templates, zipName = "markdown.zip", className } = props;

	// State
	const [showExportOptions, setShowExportOptions] = useState(false);
	const [selectAllDefaults, setSelectAllDefaults] = useState(false);
	const [defaultexports, setDefaultexports] =
		useState<Array<string>>(defaultExports);
	const [tplIndex, setTplIndex] = useState<number>(0);
	const [status, setStatus] = useState<string>("Idle");
	const [percent, setPercent] = useState<number>(0);
	const [logs, setLogs] = useState<string[]>([]);
	const exportingRef = useRef(false);
	const exported = useRef(false);
	const [zipDownloaded, setZipDownloaded] = useState(false);

	const [hideBotiWarning, setHideBotiWarning] = useState(false);

	const lastPctRef = useRef(0);
	const lastFileRef = useRef<string | undefined>(undefined);
	const termRef = useRef<HTMLDivElement | null>(null);

	const handleSelectAllDefaults = () => {
		setSelectAllDefaults(!selectAllDefaults);
		setDefaultexports(selectAllDefaults ? [] : [...defaultExports]);
	};

	const handleSelectDefault = (option: string) => {
		const updatedDefaults = defaultexports.includes(option)
			? defaultexports.filter((item) => item !== option)
			: [...defaultexports, option];

		setDefaultexports(updatedDefaults);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: Must update each time logs change
	useEffect(() => {
		const el = termRef.current;
		if (el) el.scrollTo({ top: el.scrollHeight });
	}, [logs]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: we want to reset this when tplIndex changes
	useEffect(() => {
		setHideBotiWarning(false);
	}, [tplIndex]);

	const log = (type: string, line: string) =>
		setLogs((l) => [
			...l,
			`[${new Date().toISOString().slice(0, 19).replace("T", " ")}] [{${type}}] ${line}`,
		]);

	// Derive current template name BEFORE clicking Export (for warning box + final name preview)
	const tplCfg =
		(Templates as Array<{ Name: string; Files: PartialTemplates }>)[tplIndex] ??
		null;
	const tplName = tplCfg?.Name ?? "Default";
	const isBOTI = tplName === "Bag of Tips Inspired";
	const finalZipName = makeZipName(zipName, tplName, data.MapInfo.info.name);

	// Main export
	const run = async () => {
		setShowExportOptions(false);
		if (exportingRef.current) return;
		exportingRef.current = true;
		exported.current = false;
		setPercent(0);
		setLogs([]);
		lastPctRef.current = 0;
		lastFileRef.current = undefined;

		const counts = {
			cities: data.Cities?.length,
			countries: data.Countries?.length,
			cultures: data.Cultures?.length,
			notes: data.Notes?.length,
			religions: data.Religions?.length,
		};

		try {
			log("INFO", "▶ export started");
			log("INFO", `• Selected Template: ${tplName}`);
			log(
				"INFO",
				`• counts:${defaultexports.includes("Cities") ? `cities=${counts.cities}, ` : ""}${defaultexports.includes("Countries") ? `countries=${counts.countries}, ` : ""}${defaultexports.includes("Cultures") ? `cultures=${counts.cultures}, ` : ""}${defaultexports.includes("Notes") ? `notes=${counts.notes}, ` : ""}${defaultexports.includes("Religions") ? `religions=${counts.religions}` : ""}`,
			);
			log("INFO", `• ZipName="${finalZipName}"`);

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
			let files = renderMarkdownFiles(
				data,
				tpls,
				{
					templateName: tplName,
				},
				defaultexports,
			);

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
				`✔ zip generated (${(blob.size / (1024 * 1024)).toFixed(2)} MB), download triggered`,
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

	console.log("defaultexports", defaultexports);

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

			<FormControl size="small" sx={{ minWidth: 240, mr: 2 }}>
				<Button
					variant="contained"
					onClick={() => setShowExportOptions(!showExportOptions)}
					color={showExportOptions ? "error" : "primary"}
				>
					{showExportOptions ? "Hide Export Options" : "Show Export Options"}
				</Button>
			</FormControl>

			{/* Export button */}
			<FormControl size="small" sx={{ minWidth: 240, mr: 2 }}>
				<Button
					type="button"
					onClick={run}
					variant="contained"
					color="success"
					disabled={exportingRef.current}
				>
					{exportingRef.current ? "Exporting…" : "Export Markdown"}
				</Button>
			</FormControl>

			{showExportOptions && (
				<Box
					sx={{
						border: "1px solid #ccc",
						borderRadius: 2,
						p: 2,
						backgroundColor: "#f9f9f9",
						my: 2,
					}}
				>
					<FormGroup>
						<FormControlLabel
							control={
								<Checkbox
									checked={defaultexports.length === defaultExports.length}
									onChange={handleSelectAllDefaults}
								/>
							}
							label="Select All"
						/>
						<Box
							sx={{
								display: "grid",
								gridTemplateColumns: {
									xs: "1fr",
									sm: "1fr 1fr",
									md: "1fr 1fr 1fr",
								},
							}}
						>
							{defaultExports.map((option) => (
								<FormControlLabel
									key={option}
									control={
										<Checkbox
											checked={defaultexports.includes(option)}
											onChange={() => handleSelectDefault(option)}
										/>
									}
									label={option}
								/>
							))}
						</Box>
					</FormGroup>
				</Box>
			)}

			{/* Warning box shown BEFORE export when BOTI is selected */}
			{isBOTI &&
				!exportingRef.current &&
				!exported.current &&
				!hideBotiWarning && (
					<Alert
						severity="warning"
						sx={{ my: 2, position: "relative" }}
						action={
							<Button
								onClick={() => setHideBotiWarning(true)}
								sx={{
									position: "absolute",
									top: 8,
									right: 8,
									minWidth: "auto",
									padding: "2px 6px",
									fontSize: "0.75rem",
								}}
							>
								x
							</Button>
						}
					>
						<AlertTitle>
							Bag of Tips Inspired Vault Export - Vault may take time to index
							at initial load.
						</AlertTitle>
						<strong>
							This Template has a large initial file size. Core assets zipped
							are 22.7MB.
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
