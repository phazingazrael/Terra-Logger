import {
	Alert,
	AlertTitle,
	Backdrop,
	Button,
	Checkbox,
	Collapse,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	FormControlLabel,
	FormGroup,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { type Id, toast } from "react-toastify";
import {
	initMapsDatabase,
	type MapDatabaseStore,
} from "../../db/connections/mapsDatabase";
import { useDB } from "../../db/DataContext";
import {
	addDataToStore,
	deleteEntireMapData,
	queryDataFromStore,
} from "../../db/interactions";
import type { AppInfo } from "../../definitions/AppInfo";
import type { Context } from "../../definitions/Common";
import type { TLNPC } from "../../definitions/TerraLogger";
import { generateAndPersistNPCHistory } from "../NPC/history/generation";
import type { MapInf } from "../../definitions/TerraLogger";
import BookLoader from "../Util/bookLoader";
import mutateData from "./Mutate";
import {
	DEFAULT_SUPPORTING_NPC_CATEGORY_IDS,
	SUPPORTING_NPC_CATEGORIES,
	type SupportingNPCCategoryId,
} from "../NPC/population/supportingCategories";
import {
	createMapUploadDiagnostics,
	downloadMapUploadDiagnostics,
	finishMapUploadDiagnostics,
	type MapUploadDiagnostics,
	type MapUploadGenerationOptions,
} from "./diagnostics";
import { parseLoadedData } from "./Parse";
import { runMapImportWorker } from "./workers/mapImportClient";
import type { MapImportWorkerResult } from "./workers/mapImportTypes";
import ImportSummaryContent from "./ImportSummaryContent";
import {
	summarizeGeneratedNPCs,
	summarizeUploadIssues,
	type MapImportSummary,
} from "./importSummary";

import "./UploadMap.css";
import "react-toastify/dist/ReactToastify.css";

export type MapImportMode =
	| { kind: "create" }
	| { kind: "update"; expectedMapId: string };

type UploadProgress = {
	section: string;
	item?: string;
	completed: number;
	total: number;
	percent: number;
	message: string;
};

type UploadProgressHandler = (progress: UploadProgress) => void;

export type { MapImportSummary } from "./importSummary";

function withBase(pathLike: string) {
	const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
	const rel = String(pathLike).replace(/^\/+/, "");
	return `${base}/${rel}`;
}

const DEMO_MAP_PATH = "demo/demo.map";

function clampToastProgress(percent: number): number {
	return Math.max(0, Math.min(1, percent / 100));
}

function getUploadItemName(item: unknown, fallback: string): string {
	if (!item || typeof item !== "object") {
		return fallback;
	}

	const record = item as {
		name?: unknown;
		title?: unknown;
		id?: unknown;
		i?: unknown;
	};

	return String(
		record.name ?? record.title ?? record.id ?? record.i ?? fallback,
	);
}

function trimImportedStrings<T>(value: T): T {
	if (typeof value === "string") {
		return value.trim() as T;
	}

	if (Array.isArray(value)) {
		return value.map((item) => trimImportedStrings(item)) as T;
	}

	if (value && typeof value === "object") {
		const entries = Object.entries(value).map(([key, nestedValue]) => [
			key,
			trimImportedStrings(nestedValue),
		]);

		return Object.fromEntries(entries) as T;
	}

	return value;
}

function isMapFile(file: File): boolean {
	return file.name.toLowerCase().endsWith(".map");
}

type UploadMapProps = {
	mode?: MapImportMode;
	onComplete?: () => void | Promise<void>;
	onImportSummary?: (summary: MapImportSummary) => void | Promise<void>;
	showDemoButton?: boolean;
 };

function useUploadMapModel({
	mode = { kind: "create" },
	onComplete,
	onImportSummary,
	showDemoButton = true,
}: UploadMapProps) {
	const { setActive } = useDB();
	const [app] = useState<AppInfo | null>(null);
	const [isLoading, setLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDraggingFile, setDraggingFile] = useState(false);
	const [importSummary, setImportSummary] = useState<MapImportSummary | null>(
		null,
	);
	const [isCompletingImport, setCompletingImport] = useState(false);
	const [generateNPCs, setGenerateNPCs] = useState(false);
	const [downloadLogs, setDownloadLogs] = useState(false);
	const [supportingNPCsPerCategory, setSupportingNPCsPerCategory] = useState(1);
	const [supportingCategoryIds, setSupportingCategoryIds] = useState<
		SupportingNPCCategoryId[]
	>([...DEFAULT_SUPPORTING_NPC_CATEGORY_IDS]);
	const [, setUploadStatus] = useState("Idle");
	const [, setUploadPercent] = useState(0);

	const { reloadMapsList } = useOutletContext<Context>();

	const OLDEST_SUPPORTED_VERSION = "1.105.15";
	const afmgMin = "1.105.15";
	const currentVersion = app?.application?.afmgVer ?? OLDEST_SUPPORTED_VERSION;

	const uploadToastIdRef = useRef<Id | null>(null);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	function startUploadToast(message = "Starting map upload..."): Id {
		const existingId = uploadToastIdRef.current;

		if (existingId !== null && toast.isActive(existingId)) {
			toast.dismiss(existingId);
		}

		const newId = toast.loading(message, {
			autoClose: false,
			closeOnClick: false,
			closeButton: false,
			draggable: false,
			progress: 0,
		});

		uploadToastIdRef.current = newId;
		return newId;
	}

	function getOrStartUploadToast(message: string): Id {
		const existingId = uploadToastIdRef.current;

		if (existingId !== null && toast.isActive(existingId)) {
			return existingId;
		}

		return startUploadToast(message);
	}

	function updateUploadToast(message: string, percent?: number) {
		const toastId = getOrStartUploadToast(message);

		toast.update(toastId, {
			render: message,
			type: "info",
			isLoading: true,
			autoClose: false,
			closeOnClick: false,
			closeButton: false,
			draggable: false,
			progress: percent == null ? undefined : clampToastProgress(percent),
		});
	}

	function finishUploadToast(message = "Map upload complete.") {
		const existingId = uploadToastIdRef.current;

		if (existingId === null || !toast.isActive(existingId)) {
			uploadToastIdRef.current = toast.success(message, {
				autoClose: 60000,
			});
			return;
		}

		toast.update(existingId, {
			render: message,
			type: "success",
			isLoading: false,
			autoClose: 60000,
			closeOnClick: true,
			closeButton: true,
			draggable: true,
			progress: undefined,
		});

		uploadToastIdRef.current = null;
	}

	function failUploadToast(message: string) {
		const existingId = uploadToastIdRef.current;

		if (existingId === null || !toast.isActive(existingId)) {
			toast.error(message);
			return;
		}

		toast.update(existingId, {
			render: message,
			type: "error",
			isLoading: false,
			autoClose: 15000,
			closeOnClick: true,
			closeButton: true,
			draggable: true,
			progress: undefined,
		});

		uploadToastIdRef.current = null;
	}

	const reportUploadProgress: UploadProgressHandler = (progress) => {
		updateUploadToast(progress.message, progress.percent);
	};

	function currentGenerationOptions(): MapUploadGenerationOptions {
		return {
			generateNPCs,
			downloadLogs,
			supportingNPCsPerCategory: Math.max(
				0,
				Math.min(100, Math.floor(supportingNPCsPerCategory || 0)),
			),
			supportingCategoryIds: [...supportingCategoryIds],
		};
	}

	function toggleSupportingCategory(id: SupportingNPCCategoryId) {
		setSupportingCategoryIds((current) =>
			current.includes(id)
				? current.filter((entry) => entry !== id)
				: [...current, id],
		);
	}

	type ImportMapFileOptions = {
		mode?: MapImportMode;
		initialMessage?: string;
	};

	async function importMapFile(file: File, options: ImportMapFileOptions = {}) {
		const importMode = options.mode ?? mode;
		const generation = currentGenerationOptions();
		const diagnostics = createMapUploadDiagnostics({
			fileName: file.name,
			mode: importMode.kind,
			options: generation,
		});

		startUploadToast(options.initialMessage ?? `Reading ${file.name}...`);

		const result = await runMapImportWorker(file, {
			currentVersion,
			oldestSupportedVersion: OLDEST_SUPPORTED_VERSION,
			onProgress: (progress) => {
				updateUploadToast(
					progress.message,
					progress.percent == null
						? undefined
						: Math.min(20, Math.round(progress.percent * 0.2)),
				);
			},
		});

		if (
			importMode.kind === "update" &&
			result.identity.mapId !== importMode.expectedMapId
		) {
			failUploadToast(
				`Wrong map file selected. Expected ${importMode.expectedMapId}, got ${result.identity.mapId}.`,
			);
			return;
		}

		await handleLoadedWorkerResult(result, importMode, generation, diagnostics);
	}

	async function handleLoadedWorkerResult(
		result: MapImportWorkerResult,
		importMode: MapImportMode,
		generation: MapUploadGenerationOptions,
		diagnostics: MapUploadDiagnostics,
	) {
		const { mapFile, mapVersion, versionString, validation } = result;
		const { isUpdated, isNewer, isInvalid, isAncient, isOutdated } = validation;

		if (isInvalid) {
			failUploadToast("Invalid map file. Please upload a valid map file.");
			return;
		}

		if (isAncient) {
			failUploadToast(
				`The map version you are trying to load (${mapVersion}) is too old. Please upload a newer map file.`,
			);
			return;
		}

		if (!(isNewer || isUpdated || isOutdated)) {
			failUploadToast("Map version could not be validated.");
			return;
		}

		updateUploadToast("Parsing map data...", 25);

		const parsedMap = parseLoadedData(mapFile);

		const summary = await saveMapData(
			parsedMap.parsedMap,
			JSON.parse(versionString),
			parsedMap.Pack,
			reportUploadProgress,
			importMode,
			generation,
			diagnostics,
		);

		finishMapUploadDiagnostics(diagnostics);
		if (generation.downloadLogs) downloadMapUploadDiagnostics(diagnostics);
		if (diagnostics.issues.length > 0) {
			const errors = diagnostics.issues.filter(
				(issue) => issue.severity === "error",
			).length;
			const warnings = diagnostics.issues.length - errors;
			toast.warning(
				`Map upload completed with ${errors} error${errors === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"}.`,
			);
		}

		finishUploadToast(
			importMode.kind === "update"
				? "Map update complete. The map is ready."
				: "Map upload complete. The map is ready.",
		);

		// MapManager can own the completion summary so it survives this upload
		// component being unmounted when the maps list refreshes. Standalone uses
		// retain the local dialog as a fallback.
		if (onImportSummary) {
			await onImportSummary(summary);
		} else {
			setImportSummary(summary);
		}
	}

	async function saveMapData(
		data: MapInfo,
		VersionString: string,
		Pack: object,
		onProgress: UploadProgressHandler | undefined,
		mode: MapImportMode,
		generation: MapUploadGenerationOptions,
		diagnostics: MapUploadDiagnostics,
	): Promise<MapImportSummary> {
		setUploadStatus("Converting to Terra-Logger data...");
		setUploadPercent(30);

		const mutatedMapData = await mutateData(
			data as unknown as MapInfo,
			Pack as unknown as Pack,
			onProgress,
			{ generation, diagnostics },
		);

		const mapData = trimImportedStrings(mutatedMapData);

		const {
			cities = [],
			countries = [],
			cultures = [],
			info,
			nameBases = [],
			notes = [],
			npcs: generatedNPCs = [],
			religions = [],
			settings,
			SVG,
			svgMod,
		} = mapData;

		const mapId = `${mapData.info.name}-${mapData.info.ID}`;
		diagnostics.mapId = mapId;

		const existingNPCs =
			mode.kind === "update"
				? await queryDataFromStore<TLNPC>("npcs", "mapIdIndex", mapId)
				: [];
		const existingMapRows =
			mode.kind === "update"
				? await initMapsDatabase().then(
						(database) =>
							database.getAllFromIndex("maps", "mapIdIndex", mapId) as Promise<
								MapInf[]
							>,
					)
				: [];
		const existingHistoryGenerator = existingMapRows[0]?.historyGenerator;
		const existingSignatures = new Set(
			existingNPCs.flatMap((npc) =>
				(npc.relationships ?? []).map(
					(rel) =>
						`${rel.relatedEntityType}:${rel.relatedEntityId}:${rel.relationshipType}:${rel.roleTitle ?? ""}`,
				),
			),
		);
		const retainedGenerated = generatedNPCs.filter(
			(npc) =>
				!(npc.relationships ?? []).some((rel) =>
					existingSignatures.has(
						`${rel.relatedEntityType}:${rel.relatedEntityId}:${rel.relationshipType}:${rel.roleTitle ?? ""}`,
					),
				),
		);
		const npcs = [...existingNPCs, ...retainedGenerated];
		diagnostics.counts["Existing NPCs preserved"] = existingNPCs.length;
		diagnostics.counts["New NPCs generated"] = retainedGenerated.length;
		diagnostics.counts["Generated duplicates skipped"] =
			generatedNPCs.length - retainedGenerated.length;

		if (mode.kind === "update" && mapId !== mode.expectedMapId) {
			throw new Error(
				`Selected map does not match uploaded .map file. Expected ${mode.expectedMapId}, got ${mapId}.`,
			);
		}

		if (mode.kind === "update") {
			onProgress?.({
				section: "Updating",
				completed: 0,
				total: 1,
				percent: 60,
				message: "Clearing existing map data...",
			});

			await deleteEntireMapData(mapId);
		}

		const MapInf: MapInf = {
			id: mapId,
			mapId: mapId,
			historyGenerator: existingHistoryGenerator ?? {
				currentEraMinimumYear: 0,
				previousEras: [],
			},
			info: { ...info, ver: VersionString },
			settings: settings,
			SVG: SVG,
			svgMod: svgMod,
		};

		const mapItem = document.getElementById("map");

		if (mapItem) {
			const parser = new DOMParser();
			const svgDoc = parser.parseFromString(mapItem.outerHTML, "image/svg+xml");
			const svgElement = svgDoc.documentElement;
			MapInf.svgMod = new XMLSerializer().serializeToString(svgElement);
		}

		diagnostics.counts.Cities = cities.length;
		diagnostics.counts.Countries = countries.length;
		diagnostics.counts.Cultures = cultures.length;
		diagnostics.counts.Religions = religions.length;
		diagnostics.counts.Notes = notes.length;
		diagnostics.counts.NPCs = npcs.length;

		const importSummary: MapImportSummary = {
			mapId,
			mapName: info.name,
			imported: [
				{ label: "Cities", count: cities.length },
				{ label: "Countries", count: countries.length },
				{ label: "Cultures", count: cultures.length },
				{ label: "Religions", count: religions.length },
				{ label: "Notes", count: notes.length },
				{ label: "Name Bases", count: nameBases.length },
			].filter((entry) => entry.count > 0),
			generatedNPCs: summarizeGeneratedNPCs(retainedGenerated),
			issues: summarizeUploadIssues(diagnostics.issues),
		};

		const totalRecords =
			1 +
			cities.length +
			countries.length +
			cultures.length +
			nameBases.length +
			notes.length +
			npcs.length +
			religions.length;

		let completed = 0;

		const makePercent = () => {
			if (totalRecords <= 0) {
				return 95;
			}

			return Math.min(95, 60 + Math.round((completed / totalRecords) * 35));
		};

		const emitProgress = (section: string, item?: string) => {
			const message = item
				? `Uploading ${section} - ${item}`
				: `Uploading ${section}`;

			onProgress?.({
				section,
				item,
				completed,
				total: totalRecords,
				percent: makePercent(),
				message,
			});
		};

		const writeRecord = async (
			storeName: MapDatabaseStore,
			section: string,
			itemName: string | undefined,
			value: unknown,
		) => {
			emitProgress(section, itemName);
			await addDataToStore(storeName, value);
			completed += 1;
		};

		await writeRecord("maps", "Map Info", info.name, MapInf);

		for (const city of cities) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord("cities", "Cities", getUploadItemName(city, "City"), {
				mapId,
				...city,
			});
		}

		for (const country of countries) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord(
				"countries",
				"Countries",
				getUploadItemName(country, "Country"),
				{
					mapId,
					...country,
				},
			);
		}

		for (const culture of cultures) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord(
				"cultures",
				"Cultures",
				getUploadItemName(culture, "Culture"),
				{
					mapId,
					...culture,
				},
			);
		}

		for (const nameBase of nameBases) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord(
				"nameBases",
				"Name Bases",
				getUploadItemName(nameBase, "Name Base"),
				{
					mapId,
					...nameBase,
				},
			);
		}

		for (const note of notes) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord("notes", "Notes", getUploadItemName(note, "Note"), {
				mapId,
				...note,
			});
		}

		for (const npc of npcs) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord("npcs", "NPCs", getUploadItemName(npc, "NPC"), {
				...npc,
				mapId,
			});
		}

		for (const religion of religions) {
			// Writes stay sequential so progress is accurate and IndexedDB is not flooded.
			// react-doctor-disable-next-line react-doctor/async-await-in-loop
			await writeRecord(
				"religions",
				"Religions",
				getUploadItemName(religion, "Religion"),
				{
					mapId,
					...religion,
				},
			);
		}

		if (generation.generateNPCs && retainedGenerated.length > 0) {
			const generatedIds = retainedGenerated.map((npc) => npc._id);
			onProgress?.({
				section: "NPC History",
				completed: 0,
				total: retainedGenerated.length,
				percent: 95,
				message: "Generating and persisting NPC history...",
			});
			const historyDiagnostics = await generateAndPersistNPCHistory(mapId, {
				npcIds: generatedIds,
				replaceGenerated: true,
				onProgress: (historyCompleted, historyTotal, message) =>
					onProgress?.({
						section: "NPC History",
						completed: historyCompleted,
						total: historyTotal,
						percent: 95,
						message,
					}),
			});
			diagnostics.counts["NPC history entries generated"] =
				historyDiagnostics.accepted;
			diagnostics.counts["NPC history entries rejected"] =
				historyDiagnostics.rejected;
		}

		onProgress?.({
			section: "Finalizing",
			completed,
			total: totalRecords,
			percent: 96,
			message: "Refreshing maps list...",
		});

		await reloadMapsList();

		onProgress?.({
			section: "Complete",
			completed,
			total: totalRecords,
			percent: 100,
			message: "Upload complete.",
		});

		return importSummary;
	}

	async function closeImportSummary() {
		if (!importSummary || isCompletingImport) return;

		setCompletingImport(true);
		const completedSummary = importSummary;

		try {
			await setActive(completedSummary.mapId);
			setImportSummary(null);
			await onComplete?.();
		} catch (error) {
			console.error(error);
			toast.error(
				error instanceof Error
					? `Map imported, but it could not be opened: ${error.message}`
					: "Map imported, but it could not be opened.",
			);
		} finally {
			setCompletingImport(false);
		}
	}

	function selectMapFile(file: File | null) {
		if (!file) {
			setSelectedFile(null);
			return;
		}

		if (!isMapFile(file)) {
			toast.error("Please select an Azgaar Fantasy Map Generator .map file.");
			setSelectedFile(null);
			if (fileInputRef.current) fileInputRef.current.value = "";
			return;
		}

		setSelectedFile(file);
	}

	const readMAP = (event: React.ChangeEvent<HTMLInputElement>) => {
		selectMapFile(event.target.files?.[0] ?? null);
	};

	function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
		event.preventDefault();
		event.dataTransfer.dropEffect = "copy";
		setDraggingFile(true);
	}

	function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
		if (event.currentTarget.contains(event.relatedTarget as Node | null))
			return;
		setDraggingFile(false);
	}

	function handleFileDrop(event: React.DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setDraggingFile(false);
		selectMapFile(event.dataTransfer.files?.[0] ?? null);
	}

	function clearSelectedFile() {
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	const uploadSelectedMap = async () => {
		if (!selectedFile || isLoading) return;

		setLoading(true);

		try {
			await importMapFile(selectedFile);
			clearSelectedFile();
			// biome-ignore lint/suspicious/noExplicitAny: error could be of any type
		} catch (err: any) {
			console.error(err);
			failUploadToast(`Failed to load map: ${err?.message ?? String(err)}`);
		} finally {
			setLoading(false);
		}
	};

	const loadDemoMap = async () => {
		setLoading(true);
		startUploadToast("Fetching demo map...");

		try {
			const res = await fetch(withBase(DEMO_MAP_PATH), { cache: "no-cache" });

			if (!res.ok) {
				throw new Error(`HTTP ${res.status} for ${DEMO_MAP_PATH}`);
			}

			const ab = await res.arrayBuffer();

			const demoFile = new File([ab], "demo.map", {
				type: "application/octet-stream",
			});

			await importMapFile(demoFile);
			// biome-ignore lint/suspicious/noExplicitAny: error could be of any type
		} catch (err: any) {
			console.error(err);
			failUploadToast(
				`Failed to load demo map: ${err?.message ?? String(err)}`,
			);
		} finally {
			setLoading(false);
		}
	};
	return { showDemoButton, isLoading, selectedFile, isDraggingFile, importSummary, isCompletingImport, generateNPCs, setGenerateNPCs, downloadLogs, setDownloadLogs, supportingNPCsPerCategory, setSupportingNPCsPerCategory, supportingCategoryIds, afmgMin, currentVersion, fileInputRef, toggleSupportingCategory, closeImportSummary, readMAP, handleDragOver, handleDragLeave, handleFileDrop, uploadSelectedMap, loadDemoMap };
}

function UploadMapView(model: ReturnType<typeof useUploadMapModel>) {
	const { showDemoButton, isLoading, selectedFile, isDraggingFile, importSummary, isCompletingImport, generateNPCs, setGenerateNPCs, downloadLogs, setDownloadLogs, supportingNPCsPerCategory, setSupportingNPCsPerCategory, supportingCategoryIds, afmgMin, currentVersion, fileInputRef, toggleSupportingCategory, closeImportSummary, readMAP, handleDragOver, handleDragLeave, handleFileDrop, uploadSelectedMap, loadDemoMap } = model;
	return (
		<div className="uploadForm">
			<div>
				<div className="custom-card" data-v0-t="card">
					<Backdrop
						open={isLoading}
						sx={{
							position: "absolute",
							inset: 0,
							zIndex: 3,
							backgroundColor: "rgba(0, 0, 0, 0.72)",
						}}
					>
						<BookLoader />
					</Backdrop>
					<div className="card-header">
						<h5 className="card-title">
							Uh Oh, Looks like there isn&apos;t anything loaded, Want to load
							an exported map file?
						</h5>
					</div>
					<div>
						<div className="file-grid">
							<div className="file-input">
								<Stack sx={{ width: "100%" }} spacing={2}>
									<Alert severity="success" className="UploadBox">
										<AlertTitle>Upload your .map File</AlertTitle>

										<FormGroup sx={{ marginBottom: 2 }}>
											<FormControlLabel
												control={
													<Checkbox
														checked={generateNPCs}
														onChange={(event) =>
															setGenerateNPCs(event.target.checked)
														}
													/>
												}
												label="Generate NPCs"
											/>
											<FormControlLabel
												control={
													<Checkbox
														checked={downloadLogs}
														onChange={(event) =>
															setDownloadLogs(event.target.checked)
														}
													/>
												}
												label="Download Map Upload Logs"
											/>
										</FormGroup>
										<Collapse in={generateNPCs}>
											<Stack
												spacing={1.5}
												sx={{
													marginBottom: 2,
													padding: 1.5,
													border: "1px solid",
													borderColor: "divider",
													borderRadius: 1,
												}}
											>
												<Typography variant="subtitle2">
													Required leadership generation
												</Typography>
												<Typography variant="body2" color="text.secondary">
													Leadership NPCs are always generated when NPC
													generation is enabled.
												</Typography>
												<FormGroup row>
													<FormControlLabel
														disabled
														control={<Checkbox checked />}
														label="Country government roles"
													/>
													<FormControlLabel
														disabled
														control={<Checkbox checked />}
														label="City leadership roles"
													/>
													<FormControlLabel
														disabled
														control={<Checkbox checked />}
														label="Religion leadership roles"
													/>
													<FormControlLabel
														disabled
														control={<Checkbox checked />}
														label="Culture elder roles"
													/>
												</FormGroup>

												<Divider />
												<Typography variant="subtitle2">
													Optional supporting NPC generation
												</Typography>
												<TextField
													type="number"
													size="small"
													label="NPCs per supporting category"
													value={supportingNPCsPerCategory}
													onChange={(event) =>
														setSupportingNPCsPerCategory(
															Number(event.target.value),
														)
													}
													slotProps={{
														htmlInput: { min: 0, max: 100, step: 1 },
													}}
												/>
												<FormGroup row>
													{SUPPORTING_NPC_CATEGORIES.map((category) => (
														<FormControlLabel
															key={category.id}
															control={
																<Checkbox
																	checked={supportingCategoryIds.includes(
																		category.id,
																	)}
																	onChange={() =>
																		toggleSupportingCategory(category.id)
																	}
																/>
															}
															label={category.label}
														/>
													))}
												</FormGroup>
											</Stack>
										</Collapse>
										<label htmlFor="map-file-upload">Select a MAP file</label>
										{/** biome-ignore lint/a11y/noStaticElementInteractions: why */}
										<div
											className={`map-file-drop-zone${isDraggingFile ? " is-dragging" : ""}${selectedFile ? " has-file" : ""}`}
											onDragOver={handleDragOver}
											onDragLeave={handleDragLeave}
											onDrop={handleFileDrop}
										>
											<input
												ref={fileInputRef}
												id="map-file-upload"
												type="file"
												name="map-file-upload"
												accept=".map"
												onChange={readMAP}
												disabled={isLoading}
											/>
											<Typography
												variant="body2"
												className="map-file-selection-status"
											>
												{selectedFile
													? `Selected: ${selectedFile.name}`
													: "Choose a .map file or drag and drop one here. Selection does not start the upload."}
											</Typography>
										</div>

										<div className="map-upload-actions">
											{showDemoButton ? (
												<Button
													variant="outlined"
													onClick={loadDemoMap}
													disabled={isLoading}
													title={`Loads ${DEMO_MAP_PATH} from public/`}
												>
													Load Demo Map
												</Button>
											) : (
												<span />
											)}
											<Button
												variant="contained"
												onClick={uploadSelectedMap}
												disabled={isLoading || !selectedFile}
											>
												{isLoading ? "Uploading..." : "Upload"}
											</Button>
										</div>
									</Alert>
									<Alert severity="info">
										<AlertTitle>Notice</AlertTitle>
										<p>
											Please note, This will only work with maps exported from
											versions of Azgaar&apos;s Fantasy Map Generator V{afmgMin}
											&nbsp; and Newer.
											<br />
											The current maximum version supported by this program is V
											{currentVersion}.
										</p>
										<Divider
											sx={{
												marginTop: "5px",
												marginBottom: "5px",
												borderBottomWidth: "thick",
											}}
										/>
										<p>
											<strong>
												Please note: This is a one-way process, any changes made
												to exported files will not sync to your map.
											</strong>
										</p>
									</Alert>
								</Stack>
							</div>
							<div className="file-input">
								<Alert severity="info" className="uploadBox-desc">
									<AlertTitle>
										Why use the .map file instead of exported .json?
									</AlertTitle>
									<p>
										This is a very good question, One of the main reasons to use
										the map file instead of an exported json file is that the
										map file itself contains a copy of what your map looked like
										at the time of save.
									</p>
									<h4>Why does this matter?</h4>
									<p>
										The .map file is a binary file that contains all of the data
										you need to load your map into Azgaar&apos;s Fantasy Map
										Generator.
										<br />
										It also contains a lot of additional data used for various
										generated information when used in Azgaar&apos;s Fantasy Map
										Generator, Terra-Logger also uses this information to
										generate accurate data for other details of the map.
									</p>
								</Alert>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div style={{ display: "none" }} className="alert custom-alert">
				<p className="alertMessage">Warning!</p>
			</div>

			<Dialog
				open={importSummary !== null}
				onClose={(_, reason) => {
					if (reason !== "backdropClick" && !isCompletingImport)
						void closeImportSummary();
				}}
				disableEscapeKeyDown={isCompletingImport}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle>Map Import Complete</DialogTitle>
				<DialogContent dividers>
					<ImportSummaryContent summary={importSummary} />
				</DialogContent>
				<DialogActions>
					<Button
						variant="contained"
						onClick={() => void closeImportSummary()}
						disabled={isCompletingImport}
					>
						{isCompletingImport ? "Opening Map..." : "Close"}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

function UploadMap({
	mode = { kind: "create" },
	onComplete,
	onImportSummary,
	showDemoButton = true,
}: UploadMapProps) {
	const model = useUploadMapModel({ mode, onComplete, onImportSummary, showDemoButton });
	return <UploadMapView {...model} />;
}

export default UploadMap;
