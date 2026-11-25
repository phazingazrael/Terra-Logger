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
import type {
	MapDatabaseStore,
} from "../../db/connections/mapsDatabase";
import { useDB } from "../../db/DataContext";
import { refreshImportedDevelopmentalEras } from "../../db/eras";
import {
	queryDataFromStore,
	saveImportedMapRecords,
} from "../../db/interactions";
import type { AppInfo } from "../../definitions/AppInfo";
import type { Context } from "../../definitions/Common";
import type { TLNPC } from "../../definitions/TerraLogger";
import type { TLMapEra } from "../../definitions/History";
import type { TLMapInfo } from "../../definitions/TerraLogger";
import { generateAndPersistNPCHistory } from "../NPC/history/generation";
import type { MapInf } from "../../definitions/TerraLogger";
import BookLoader from "../Util/bookLoader";
import mutateData, { type MutateProgressHandler } from "./Mutate";
import {
	DEFAULT_SUPPORTING_NPC_CATEGORY_IDS,
	SUPPORTING_NPC_CATEGORIES,
	type SupportingNPCCategoryId,
} from "../NPC/population/supportingCategories";
import {
	addUploadIssue,
	createMapUploadDiagnostics,
	downloadMapUploadDiagnostics,
	finishMapUploadDiagnostics,
	mergeMapEntities,
	recordUploadError,
	summarizeGeneratedNPCs,
	summarizeUploadIssues,
	uploadPhase,
	type MapImportSummary,
	type MapUploadDiagnostics,
	type MapUploadGenerationOptions,
	type ReimportEntities,
} from "./utils";
import { parseLoadedData } from "./Parse";
import { runMapImportWorker } from "./workers/mapImportClient";
import type { MapImportWorkerResult } from "./workers/mapImportTypes";
import ImportSummaryContent from "./ImportSummaryContent";

import "./UploadMap.css";
import "react-toastify/dist/ReactToastify.css";

export type MapImportMode =
	| { kind: "create" }
	| { kind: "update"; expectedMapId: string };

export type { MapImportSummary } from "./utils";

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

function UploadMap({
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
	const [lastDiagnostics, setLastDiagnostics] = useState<MapUploadDiagnostics | null>(null);
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

	function finishUploadToast(message = "Map upload complete.", type: "success" | "warning" = "success") {
		const existingId = uploadToastIdRef.current;

		if (existingId === null || !toast.isActive(existingId)) {
			uploadToastIdRef.current = toast(message, {
				type,
				autoClose: 10000,
			});
			return;
		}

		toast.update(existingId, {
			render: message,
			type,
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

	const reportUploadProgress: MutateProgressHandler = (progress) => {
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
		diagnostics?: MapUploadDiagnostics;
	};

	async function importMapFile(file: File, options: ImportMapFileOptions = {}) {
		const importMode = options.mode ?? mode;
		const generation = currentGenerationOptions();
		const diagnostics = options.diagnostics ?? createMapUploadDiagnostics({
			fileName: file.name,
			mode: importMode.kind,
			options: generation,
		});

		diagnostics.fileSize = file.size;
		uploadPhase(diagnostics, "Reading map");
		try {
			startUploadToast(options.initialMessage ?? `Reading ${file.name}...`);

			const result = await runMapImportWorker(file, {
				currentVersion,
				oldestSupportedVersion: OLDEST_SUPPORTED_VERSION,
				onProgress: (progress) => {
					uploadPhase(diagnostics, `Worker: ${progress.phase}`, progress.message);
					updateUploadToast(
						progress.message,
						progress.percent == null
							? undefined
							: Math.min(20, Math.round(progress.percent * 0.2)),
					);
				},
			});

			diagnostics.version = result.version;
			diagnostics.mapId = result.identity.mapId;
			diagnostics.counts["Map sections"] = result.mapFile.length;
			uploadPhase(diagnostics, "Validating map identity");
			if (
				importMode.kind === "update" &&
				result.identity.mapId !== importMode.expectedMapId
			) {
				throw new Error(`Wrong map file selected. Expected ${importMode.expectedMapId}, got ${result.identity.mapId}.`);
			}

			await handleLoadedWorkerResult(result, importMode, generation, diagnostics);
		} catch (error) {
			recordUploadError(diagnostics, error);
			throw error;
		} finally {
			finishMapUploadDiagnostics(diagnostics);
			setLastDiagnostics(diagnostics);
			console.info("Map upload diagnostics", diagnostics);
			if (generation.downloadLogs) {
				try { downloadMapUploadDiagnostics(diagnostics); }
				catch (error) { console.error("Could not download upload diagnostics", error); }
			}
		}
	}

	async function handleLoadedWorkerResult(
		result: MapImportWorkerResult,
		importMode: MapImportMode,
		generation: MapUploadGenerationOptions,
		diagnostics: MapUploadDiagnostics,
	) {
		const { mapFile, mapVersion, versionString, validation } = result;
		const { isUpdated, isNewer, isInvalid, isAncient, isOutdated } = validation;

		uploadPhase(diagnostics, "Validating map version");
		if (isInvalid) {
			throw new Error("Invalid map file. Please upload a valid map file.");
		}

		if (isAncient) {
			throw new Error(`The map version you are trying to load (${mapVersion}) is too old. Please upload a newer map file.`);
		}

		if (!(isNewer || isUpdated || isOutdated)) {
			throw new Error("Map version could not be validated.");
		}

		updateUploadToast("Parsing map data...", 25);

		uploadPhase(diagnostics, "Parsing map sections");
		const parsedMap = await parseLoadedData(mapFile);
		for (const message of parsedMap.renderingIssues) {
			addUploadIssue(diagnostics, {
				severity: "warning",
				phase: "SVG restoration",
				message,
				continued: true,
			});
		}

		const summary = await saveMapData(
			parsedMap.parsedMap,
			JSON.parse(versionString),
			parsedMap.Pack,
			reportUploadProgress,
			importMode,
			generation,
			diagnostics,
		);

		uploadPhase(diagnostics, "Presenting import summary");
		if (diagnostics.issues.length > 0) {
			const errors = diagnostics.issues.filter(
				(issue) => issue.severity === "error",
			).length;
			const warnings = diagnostics.issues.length - errors;
			toast.warning(
				`Map upload completed with ${errors} error${errors === 1 ? "" : "s"} and ${warnings} warning${warnings === 1 ? "" : "s"}.`,
			);
		}

		// MapManager can own the completion summary so it survives this upload
		// component being unmounted when the maps list refreshes. Standalone uses
		// retain the local dialog as a fallback.
		if (onImportSummary) {
			await onImportSummary(summary);
		} else {
			setImportSummary(summary);
		}
		finishUploadToast(
			importMode.kind === "update"
				? "Map update complete. The map is ready."
				: "Map upload complete. The map is ready.",
			"success",
		);
	}

	async function saveMapData(
		data: MapInfo,
		VersionString: string,
		Pack: object,
		onProgress: MutateProgressHandler | undefined,
		mode: MapImportMode,
		generation: MapUploadGenerationOptions,
		diagnostics: MapUploadDiagnostics,
	): Promise<MapImportSummary> {
		const forwardProgress = onProgress;
		let stage = "Converting";
		onProgress = (progress) => {
			uploadPhase(diagnostics, `${stage}: ${progress.section}`, progress.item ?? progress.message);
			forwardProgress?.(progress);
		};
		uploadPhase(diagnostics, "Loading existing map data");
		setUploadStatus("Converting to Terra-Logger data...");
		setUploadPercent(30);

		let previousEntities: ReimportEntities | undefined;
		if (mode.kind === "update") {
			const incomingMapId = `${data.info.name.trim()}-${data.info.ID.trim()}`;
			if (incomingMapId !== mode.expectedMapId) {
				throw new Error(
					`Selected map does not match uploaded .map file. Expected ${mode.expectedMapId}, got ${incomingMapId}.`,
				);
			}

			const [cities, countries, cultures, religions, notes, nameBases] =
				await Promise.all([
					queryDataFromStore<TLMapInfo["cities"][number]>(
						"cities",
						"mapIdIndex",
						incomingMapId,
					),
					queryDataFromStore<TLMapInfo["countries"][number]>(
						"countries",
						"mapIdIndex",
						incomingMapId,
					),
					queryDataFromStore<TLMapInfo["cultures"][number]>(
						"cultures",
						"mapIdIndex",
						incomingMapId,
					),
					queryDataFromStore<TLMapInfo["religions"][number]>(
						"religions",
						"mapIdIndex",
						incomingMapId,
					),
					queryDataFromStore<TLMapInfo["notes"][number]>(
						"notes",
						"mapIdIndex",
						incomingMapId,
					),
					queryDataFromStore<TLMapInfo["nameBases"][number]>(
						"nameBases",
						"mapIdIndex",
						incomingMapId,
					),
				]);
			previousEntities = {
				cities,
				countries,
				cultures,
				religions,
				notes,
				nameBases,
			};
		}

		const mutatedMapData = await mutateData(
			data as unknown as MapInfo,
			Pack as unknown as Pack,
			onProgress,
			{
				generation,
				diagnostics,
				prepareEntities: (map) => {
					const importedOptions = map.settings.options;
					const importedBiomes = map.biomes;
					Object.assign(map, trimImportedStrings(map));
					// Preserve source option strings and biome definitions without trimming them.
					map.settings.options = importedOptions;
					map.biomes = importedBiomes;
					if (previousEntities) mergeMapEntities(map, previousEntities);
				},
			},
		);

		const mapData = {
			...mutatedMapData,
			npcs: trimImportedStrings(mutatedMapData.npcs),
		};

		const {
			renderingSource,
			biomes,
			geography,
			economy,
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

		const MapInf: MapInf = {
			renderingSource,
			biomes,
			geography,
			economy,
			id: mapId,
			mapId: mapId,
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

		diagnostics.counts["Name Bases"] = nameBases.length;
		diagnostics.counts.Biomes = biomes?.length ?? 0;
		diagnostics.counts.Goods = economy?.goods?.length ?? 0;
		diagnostics.counts.Markets = economy?.markets?.length ?? 0;
		diagnostics.counts.Deals = economy?.deals?.length ?? 0;
		diagnostics.counts["Unresolved deals"] = economy?.unresolvedDealIds?.length ?? 0;
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

		stage = "Preparing";
		uploadPhase(diagnostics, "Preparing database records");
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

		const records: {
			storeName: MapDatabaseStore;
			section: string;
			itemName: string | undefined;
			value: unknown;
		}[] = [];

		const writeRecord = async (
			storeName: MapDatabaseStore,
			section: string,
			itemName: string | undefined,
			value: unknown,
		) => {
			// Prepare records before opening the replacement transaction.
			records.push({ storeName, section, itemName, value });
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

		stage = "Saving";
		uploadPhase(diagnostics, "Saving map transaction");
		const saved = await saveImportedMapRecords(
			mapId,
			mode.kind === "update",
			records,
			(index) => {
				completed += 1;
				const record = records[index];
				emitProgress(record.section, record.itemName);
			},
		);

		diagnostics.committed = true;
		diagnostics.counts["Committed import records"] = records.length;
		diagnostics.counts["Eras created by import"] = saved.erasCreated;
		diagnostics.counts["Eras preserved"] = saved.erasPreserved;
		diagnostics.notes.push("Main map transaction committed. Subsequent history generation uses separate transactions.");
		stage = "Finalizing";
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
			diagnostics.notes.push(`NPC history diagnostics: ${JSON.stringify(historyDiagnostics)}`);
		}

		onProgress?.({
			section: "Finalizing",
			completed,
			total: totalRecords,
			percent: 96,
			message: "Refreshing maps list...",
		});

		uploadPhase(diagnostics, "Saving developmental eras and summaries");
		const developmentalEras = await refreshImportedDevelopmentalEras(mapId);
		diagnostics.counts["Developmental eras"] = developmentalEras.length;
		diagnostics.counts["Classification-enabled developmental eras"] = developmentalEras.filter((era) => era.active).length;
		diagnostics.counts["Developmental placements"] = developmentalEras.reduce((sum, era) => sum + era.placements.length, 0);
		diagnostics.counts["Estimated developmental placements"] = developmentalEras.reduce((sum, era) => sum + era.placements.filter((placement) => placement.estimated).length, 0);
		importSummary.imported.push({ label: "Developmental eras", count: developmentalEras.length });

		uploadPhase(diagnostics, "Reading final Era records");
		const eras = await queryDataFromStore<TLMapEra>("eras", "mapIdIndex", mapId);
		diagnostics.counts.Eras = eras.length;
		diagnostics.counts["Current eras"] = eras.filter((era) => era.status === "current").length;
		diagnostics.counts["Previous eras"] = eras.filter((era) => era.status === "previous").length;
		diagnostics.counts["Era notable events"] = eras.reduce((sum, era) => sum + (era.events?.length ?? 0), 0);
		diagnostics.counts["Era NPC history links"] = eras.reduce((sum, era) => sum + (era.events ?? []).reduce((count, event) => count + (event.npcHistory?.length ?? 0), 0), 0);
		importSummary.imported.push({ label: "Eras", count: eras.length });
		importSummary.issues = summarizeUploadIssues(diagnostics.issues);
		uploadPhase(diagnostics, "Refreshing maps list");
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
		const diagnostics = createMapUploadDiagnostics({ fileName: "demo.map", mode: mode.kind, options: currentGenerationOptions() });
		uploadPhase(diagnostics, "Fetching demo map", DEMO_MAP_PATH);

		try {
			const res = await fetch(withBase(DEMO_MAP_PATH), { cache: "no-cache" });

			if (!res.ok) {
				throw new Error(`HTTP ${res.status} for ${DEMO_MAP_PATH}`);
			}

			const ab = await res.arrayBuffer();

			const demoFile = new File([ab], "demo.map", {
				type: "application/octet-stream",
			});

			await importMapFile(demoFile, { diagnostics });
			// biome-ignore lint/suspicious/noExplicitAny: error could be of any type
		} catch (err: any) {
			console.error(err);
			if (!diagnostics.completedAt) {
				recordUploadError(diagnostics, err);
				finishMapUploadDiagnostics(diagnostics);
				setLastDiagnostics(diagnostics);
				console.error("Demo upload diagnostics", diagnostics);
				if (diagnostics.options.downloadLogs) downloadMapUploadDiagnostics(diagnostics);
			}
			failUploadToast(
				`Failed to load demo map: ${err?.message ?? String(err)}`,
			);
		} finally {
			setLoading(false);
		}
	};
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
						<div className="file-input">
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
											Leadership NPCs are always generated when NPC generation
											is enabled.
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
												setSupportingNPCsPerCategory(Number(event.target.value))
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
									{lastDiagnostics && (
										<Button variant="outlined" disabled={isLoading} onClick={() => downloadMapUploadDiagnostics(lastDiagnostics)}>
											Download upload logs ({lastDiagnostics.status})
										</Button>
									)}
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
							<Stack
								direction="row"
								sx={{ marginTop: "16px", width: "100%" }}
								spacing={2}
							>
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
							</Stack>
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

export default UploadMap;
