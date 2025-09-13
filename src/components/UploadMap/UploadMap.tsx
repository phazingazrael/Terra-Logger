// biome-ignore assist/source/organizeImports: no effect, visual only
import { Alert, AlertTitle, Divider, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import mutateData from "./Mutate.tsx";
import { parseLoadedData, parseLoadedResult } from "./Parse.tsx";
import BookLoader from "../Util/bookLoader.tsx";

import { useDB } from "../../db/DataContext";

import { addDataToStore, getFullStore } from "../../db/interactions.tsx";

import type { MapInf } from "../../definitions/TerraLogger.ts";
import type { AppInfo } from "../../definitions/AppInfo.ts";

import "./UploadMap.css";
import "react-toastify/dist/ReactToastify.css";

const ToastSuccess = () =>
	toast.success(
		"Map Loaded Successfully! \n Please wait for the map to be fully loaded.",
	);
const ToastInvalid = () =>
	toast.error("Invalid map file. Please upload a valid map file.");
const ToastAncient = (mapVersion: number) =>
	toast.error(
		`The map version you are trying to load (${mapVersion}) is too old. \n Please upload a newer map file.`,
	);

function UploadMap() {
	const { setActive } = useDB();
	const [app, setApp] = useState<AppInfo | null>(null);
	const [isLoading, setLoading] = useState(false);

	const OLDEST_SUPPORTED_VERSION = "1.105.15";
	const afmgMin = "1.105.15";
	const currentVersion = Number.parseFloat(
		app?.application?.afmgVer ?? OLDEST_SUPPORTED_VERSION,
	);

	// Load current app settings (for version info)
	useEffect(() => {
		(async () => {
			const rows = await getFullStore("appSettings");
			const latest = rows?.[rows.length - 1] as AppInfo | undefined;
			if (latest) setApp(latest);
		})();
	}, []);

	function isValidVersion(versionString: string) {
		if (!versionString) return false;
		const [major, minor, patch] = versionString.split(".");
		return !Number.isNaN(major) && !Number.isNaN(minor) && !Number.isNaN(patch);
	}

	function compareVersions(
		version1: string,
		version2: string,
		options = { major: true, minor: true, patch: true },
	) {
		if (!isValidVersion(version1) || !isValidVersion(version2))
			return { isEqual: false, isNewer: false, isOlder: false };

		let [major1, minor1, patch1] = version1.split(".").map(Number);
		let [major2, minor2, patch2] = version2.split(".").map(Number);

		if (!options.major) major1 = major2 = 0;
		if (!options.minor) minor1 = minor2 = 0;
		if (!options.patch) patch1 = patch2 = 0;

		const isEqual = major1 === major2 && minor1 === minor2 && patch1 === patch2;
		const isNewer =
			major1 > major2 ||
			(major1 === major2 &&
				(minor1 > minor2 || (minor1 === minor2 && patch1 > patch2)));
		const isOlder =
			major1 < major2 ||
			(major1 === major2 &&
				(minor1 < minor2 || (minor1 === minor2 && patch1 < patch2)));

		return { isEqual, isNewer, isOlder };
	}

	function processLoadedData(mapFile: string[], mapVersion: string) {
		const isInvalid =
			!mapFile || !mapVersion || mapFile?.length < 26 || !mapFile?.[5];
		const isUpdated = compareVersions(
			mapVersion,
			currentVersion.toString(),
		).isEqual;
		const isAncient = compareVersions(
			mapVersion,
			OLDEST_SUPPORTED_VERSION.toString(),
		).isOlder;
		const isNewer = compareVersions(
			mapVersion,
			currentVersion.toString(),
		).isNewer;
		const isOutdated = compareVersions(
			mapVersion,
			currentVersion.toString(),
		).isOlder;

		return {
			isUpdated,
			isNewer,
			isInvalid,
			isAncient,
			isOutdated,
		};
	}

	function handleLoadedData(
		isUpdated: boolean,
		isNewer: boolean,
		isInvalid: boolean,
		isAncient: boolean,
		isOutdated: boolean,
		mapVersion: number,
		mapFile: string[],
		versionString: string,
	) {
		if (isNewer || isUpdated || isOutdated) {
			const parsedMap = parseLoadedData(mapFile);
			saveMapData(
				parsedMap.parsedMap,
				JSON.parse(versionString),
				parsedMap.Pack,
			);
			// need to redirect to the main page '/'
			ToastSuccess();
		}
		if (isInvalid) {
			ToastInvalid();
			setLoading(false);
		}
		if (isAncient) {
			ToastAncient(mapVersion);
			setLoading(false);
		}
		return null;
	}

	async function saveMapData(
		data: MapInfo,
		VersionString: string,
		Pack: object,
	): Promise<void> {
		const mapData = await mutateData(
			data as unknown as MapInfo,
			Pack as unknown as Pack,
		);
		const {
			cities,
			countries,
			cultures,
			info,
			nameBases,
			notes,
			npcs,
			religions,
			settings,
			SVG,
			svgMod,
		} = mapData;
		const mapId = `${mapData.info.name}-${mapData.info.ID}`;
		const MapInf: MapInf = {
			id: mapId,
			mapId: mapId,
			info: { ...info, ver: VersionString },
			settings: settings,
			SVG: SVG,
			svgMod: svgMod,
		};

		// assign SVG elements to variables
		const mapItem = document.getElementById("map");

		if (mapItem) {
			const parser = new DOMParser();
			const svgDoc = parser.parseFromString(mapItem.outerHTML, "image/svg+xml");
			const svgElement = svgDoc.documentElement;

			MapInf.svgMod = new XMLSerializer().serializeToString(svgElement);
		}

		// Persist the new map, then make it active via DBProvider
		await addDataToStore("maps", MapInf);
		await setActive(mapId);

		for (const city of cities) {
			const obj = {
				mapId: mapId,
				...city,
			};
			addDataToStore("cities", obj);
		}

		for (const country of countries) {
			const obj = {
				mapId: mapId,
				...country,
			};
			addDataToStore("countries", obj);
		}

		for (const culture of cultures) {
			const obj = {
				mapId: mapId,
				...culture,
			};
			addDataToStore("cultures", obj);
		}

		for (const nameBase of nameBases) {
			const obj = {
				mapId: mapId,
				...nameBase,
			};
			addDataToStore("nameBases", obj);
		}

		for (const note of notes) {
			const obj = {
				mapId: mapId,
				...note,
			};
			addDataToStore("notes", obj);
		}

		for (const npc of npcs) {
			const obj = {
				mapId: mapId,
				...npc,
			};
			addDataToStore("npcs", obj);
		}

		for (const religion of religions) {
			const obj = {
				mapId: mapId,
				...religion,
			};
			addDataToStore("religions", obj);
		}

		setLoading(false);
	}

	const readMAP = (e: React.ChangeEvent<HTMLInputElement>) => {
		setLoading(true);
		if (e.target.files) {
			const file = e.target.files[0];
			const fileReader = new FileReader();

			fileReader.onloadend = function onLoadEnd(event) {
				if (event.target) {
					const { result } = event.target;
					if (result instanceof ArrayBuffer) {
						const [mapFile, mapVersion, versionString] =
							parseLoadedResult(result);
						const { isUpdated, isNewer, isInvalid, isAncient, isOutdated } =
							processLoadedData(mapFile, mapVersion.toString());
						handleLoadedData(
							isUpdated,
							isNewer,
							isInvalid,
							isAncient,
							isOutdated,
							mapVersion,
							mapFile,
							versionString,
						);
					}
				}
			};

			fileReader.readAsArrayBuffer(file);
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
											<Divider
												sx={{
													marginTop: "5px",
													marginBottom: "5px",
													borderBottomWidth: "thick",
												}}
											/>
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
