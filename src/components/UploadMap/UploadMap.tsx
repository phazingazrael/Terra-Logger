import { Alert, AlertTitle, Button, Divider, Stack } from "@mui/material";
import { useRef, useState } from "react";
import { toast, type Id } from "react-toastify";
import { parseLoadedData } from "./Parse";

import mutateData from "./Mutate";
import BookLoader from "../Util/bookLoader";
import { runMapImportWorker } from "./workers/mapImportClient";
import type { MapImportWorkerResult } from "./workers/mapImportTypes";

import { useDB } from "../../db/DataContext";

import { addDataToStore, deleteEntireMapData } from "../../db/interactions";

import { useOutletContext } from "react-router-dom";

import type { MapInf } from "../../definitions/TerraLogger";
import type { AppInfo } from "../../definitions/AppInfo";
import type { Context } from "../../definitions/Common";

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

function withBase(pathLike: string) {
	const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
	const rel = String(pathLike).replace(/^\/+/, "");
	return `${base}/${rel}`;
}

const DEMO_MAP_PATH = "demo/demo.map";

type UploadMapProps = {
	mode?: MapImportMode;
	onComplete?: () => void | Promise<void>;
	showDemoButton?: boolean;
};

function UploadMap({
	mode = { kind: "create" },
	onComplete,
	showDemoButton = true,
}: UploadMapProps) {
	const { setActive } = useDB();
	const [app] = useState<AppInfo | null>(null);
	const [isLoading, setLoading] = useState(false);
	const [, setUploadStatus] = useState("Idle");
	const [, setUploadPercent] = useState(0);

	const { reloadMapsList } = useOutletContext<Context>();

	const OLDEST_SUPPORTED_VERSION = "1.105.15";
	const afmgMin = "1.105.15";
	const currentVersion = app?.application?.afmgVer ?? OLDEST_SUPPORTED_VERSION;

	const uploadToastIdRef = useRef<Id | null>(null);

	function clampToastProgress(percent: number): number {
		return Math.max(0, Math.min(1, percent / 100));
	}

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

	type ImportMapFileOptions = {
		mode?: MapImportMode;
		initialMessage?: string;
	};

	async function importMapFile(file: File, options: ImportMapFileOptions = {}) {
		const importMode = options.mode ?? mode;

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

		await handleLoadedWorkerResult(result, importMode);
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

	async function handleLoadedWorkerResult(
		result: MapImportWorkerResult,
		importMode: MapImportMode = mode,
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

		await saveMapData(
			parsedMap.parsedMap,
			JSON.parse(versionString),
			parsedMap.Pack,
			reportUploadProgress,
			importMode,
		);

		finishUploadToast(
			importMode.kind === "update"
				? "Map update complete. The map is ready."
				: "Map upload complete. The map is ready.",
		);

		await onComplete?.();
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

	async function saveMapData(
		data: MapInfo,
		VersionString: string,
		Pack: object,
		onProgress?: UploadProgressHandler,
		mode: MapImportMode = { kind: "create" },
	): Promise<void> {
		setUploadStatus("Converting to Terra-Logger data...");
		setUploadPercent(30);

		const mutatedMapData = await mutateData(
			data as unknown as MapInfo,
			Pack as unknown as Pack,
			onProgress,
		);

		const mapData = trimImportedStrings(mutatedMapData);

		const {
			cities = [],
			countries = [],
			cultures = [],
			info,
			nameBases = [],
			notes = [],
			npcs = [],
			religions = [],
			settings,
			SVG,
			svgMod,
		} = mapData;

		const mapId = `${mapData.info.name}-${mapData.info.ID}`;

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
			storeName: string,
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
			await writeRecord("cities", "Cities", getUploadItemName(city, "City"), {
				mapId,
				...city,
			});
		}

		for (const country of countries) {
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
			await writeRecord("notes", "Notes", getUploadItemName(note, "Note"), {
				mapId,
				...note,
			});
		}

		for (const npc of npcs) {
			await writeRecord("npcs", "NPCs", getUploadItemName(npc, "NPC"), {
				mapId,
				...npc,
			});
		}

		for (const religion of religions) {
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

		onProgress?.({
			section: "Finalizing",
			completed,
			total: totalRecords,
			percent: 96,
			message: "Refreshing maps list...",
		});

		await reloadMapsList();

		onProgress?.({
			section: "Finalizing",
			completed,
			total: totalRecords,
			percent: 98,
			message: "Setting active map...",
		});

		await setActive(mapId);

		onProgress?.({
			section: "Complete",
			completed,
			total: totalRecords,
			percent: 100,
			message: "Upload complete.",
		});
	}

	const readMAP = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		if (!file) {
			return;
		}

		setLoading(true);

		try {
			await importMapFile(file);
		} catch (err: any) {
			console.error(err);
			failUploadToast(`Failed to load map: ${err?.message ?? String(err)}`);
		} finally {
			setLoading(false);
			e.target.value = "";
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
		} catch (err: any) {
			console.error(err);
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
					{isLoading ? (
						<div className="custom-loading">
							<BookLoader />
						</div>
					) : null}
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
										<label htmlFor="map-file-upload">Select a MAP file</label>
										<input
											type="file"
											name="map-file-upload"
											accept=".map"
											onChange={readMAP}
										/>

										{showDemoButton ? (
											<div style={{ marginTop: 8 }}>
												<Button
													variant="outlined"
													onClick={loadDemoMap}
													disabled={isLoading}
													title={`Loads ${DEMO_MAP_PATH} from public/`}
												>
													Load Demo Map
												</Button>
											</div>
										) : null}
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
		</div>
	);
}

export default UploadMap;
