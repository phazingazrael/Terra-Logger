import { Button, Grid2 as Grid, Modal, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";

import mapAtom from "../../atoms/map.tsx";
import mapLoadedAtom from "../../atoms/mapLoaded.tsx";
import mapNameAtom from "../../atoms/mapName.tsx";
import {
	deleteDataFromStore,
	queryDataFromStore,
} from "../../db/interactions.tsx";

import "./index.css";
import { MapsCard } from "../Cards/index.tsx";
import UploadMap from "../UploadMap/UploadMap.tsx";
import shadows from "@mui/material/styles/shadows";
import { useOutletContext } from "react-router-dom";
import type { Context } from "../../definitions/Common.ts";

import type {
	TLCity,
	TLCountry,
	TLCulture,
	TLNameBase,
	TLNote,
	TLReligion,
	MapInf,
} from "../../definitions/TerraLogger.ts";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: shadows[24],
	p: 4,
};

const MapManager: React.FC = () => {
	const [map, setMap] = useRecoilState(mapAtom);
	const { mapsList }: Context = useOutletContext();
	const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
	const [selectedCities, setSelectedCities] = useState<TLCity[]>([]);
	const [selectedCountries, setSelectedCountries] = useState<TLCountry[]>([]);
	const [selectedCultures, setSelectedCultures] = useState<TLCulture[]>([]);
	const [selectedNotes, setSelectedNotes] = useState<TLNote[]>([]);
	// const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
	const [selectedReligions, setSelectedReligions] = useState<TLReligion[]>([]);
	const [selectedNameBases, setSelectedNameBases] = useState<TLNameBase[]>([]);
	const [, setMapName] = useRecoilState(mapNameAtom);
	const [, setMapLoaded] = useRecoilState(mapLoadedAtom);

	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const createEmptyMap = (): MapInf => ({
		id: "",
		info: {
			name: "",
			seed: "",
			width: 0,
			height: 0,
			ID: "",
			ver: "",
		},
		mapId: "",
		settings: {
			mapName: "",
			distanceUnit: "",
			distanceScale: "",
			areaUnit: "",
			heightUnit: "",
			heightExponent: "",
			temperatureScale: "",
			barSize: "",
			barLabel: "",
			barBackOpacity: "",
			barPosX: "",
			barPosY: "",
			populationRate: 0,
			urbanization: "",
			mapSize: "",
			latitude0: "",
			prec: "",
			options: {
				pinNotes: false,
				winds: [],
				temperatureEquator: 0,
				temperatureNorthPole: 0,
				temperatureSouthPole: 0,
				stateLabelsMode: "",
				year: 0,
				era: "",
				eraShort: "",
				militaryTypes: [
					{
						icon: "",
						name: "",
						rural: 0,
						urban: 0,
						crew: 0,
						power: 0,
						type: "",
						separate: 0,
					},
				],
			},
			hideLabels: 0,
			stylePreset: "",
			rescaleLabels: 0,
			urbanDensity: 0,
		},
		SVG: "",
		svgMod: "",
	});
	const emptyMap: MapInf = createEmptyMap();

	useEffect(() => {
		const fetchObjectsList = async () => {
			if (selectedMaps.length > 0) {
				for (const map of selectedMaps) {
					const cityObjs = await queryDataFromStore(
						"cities",
						"mapIdIndex",
						map,
					);
					const countryObjs = await queryDataFromStore(
						"countries",
						"mapIdIndex",
						map,
					);
					const cultureObjs = await queryDataFromStore(
						"cultures",
						"mapIdIndex",
						map,
					);
					const noteObjs = await queryDataFromStore("notes", "mapIdIndex", map);
					//const npcObjs = await queryDataFromStore("npcs", "mapIdIndex", map);
					const religionObjs = await queryDataFromStore(
						"religions",
						"mapIdIndex",
						map,
					);
					const nameBaseObjs = await queryDataFromStore(
						"nameBases",
						"mapIdIndex",
						map,
					);

					setSelectedCities(cityObjs);
					setSelectedCountries(countryObjs);
					setSelectedCultures(cultureObjs);
					setSelectedNotes(noteObjs);
					//setSelectedNpcs(npcObjs);
					setSelectedReligions(religionObjs);
					setSelectedNameBases(nameBaseObjs);
				}
			}
		};

		fetchObjectsList();
	}, [selectedMaps]);

	const handleMapSelect = (mapId: string) => {
		if (selectedMaps.includes(mapId)) {
			setSelectedMaps(selectedMaps.filter((id) => id !== mapId));
		} else {
			setSelectedMaps([...selectedMaps, mapId]);
		}
	};

	const handleDeleteMaps = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
		const allPromises = selectedMaps.map(async (mapId) => {
			console.group(`========= Deleting Map:  ${mapId} =========`);
			console.groupCollapsed("========= Deleting Cities =========");
			for (const city of selectedCities) {
				console.info(city.name);
				await deleteDataFromStore("cities", city._id);
			}
			console.groupEnd();

			console.groupCollapsed("========= Deleting Countries =========");
			for (const country of selectedCountries) {
				console.info(country.name);
				await deleteDataFromStore("countries", country._id);
			}
			console.groupEnd();

			console.groupCollapsed("========= Deleting Cultures =========");
			for (const culture of selectedCultures) {
				console.info(culture.name);
				await deleteDataFromStore("cultures", culture._id);
			}
			console.groupEnd();

			console.groupCollapsed("========= Deleting Notes =========");
			for (const note of selectedNotes) {
				console.info(note.name);
				await deleteDataFromStore("notes", note._id);
			}
			console.groupEnd();

			// TODO: implement NPCs
			// console.groupCollapsed("========= Deleting NPCs =========");
			// for (const npc of selectedNpcs) {
			// 	console.info(npc.name);
			// 	await deleteDataFromStore("npcs", npc._id);
			// }
			// console.groupEnd()

			console.groupCollapsed("========= Deleting Religions =========");
			for (const religion of selectedReligions) {
				console.info(religion.name);
				await deleteDataFromStore("religions", religion._id);
			}
			console.groupEnd();

			console.groupCollapsed("========= Deleting NameBases =========");
			for (const nameBase of selectedNameBases) {
				console.info(nameBase.name);
				await deleteDataFromStore("nameBases", nameBase._id);
			}
			console.groupEnd();

			await deleteDataFromStore("maps", mapId);
			console.info(`========= Deleted Map: ${map.id} (${mapId}) =========`);
			console.groupEnd();
		});

		await Promise.all(allPromises);

		// set the flag  to indicate that all objects have been deleted
		setMap(emptyMap);
		setMapLoaded(false);
		setMapName("");
		const mapElement = document.getElementById("map");

		if (mapElement) {
			mapElement.remove();
		}
	};

	return (
		<div>
			<h2>Saved maps</h2>
			<Grid container spacing={2}>
				{mapsList.map((map) => (
					<Grid size={3} key={map.id} id={map.id}>
						<MapsCard {...map} handleMapSelect={handleMapSelect} />
					</Grid>
				))}
			</Grid>
			<br />
			{selectedMaps.length > 0 ? (
				<Button
					variant="contained"
					color="error"
					onClick={handleDeleteMaps}
					disabled={selectedMaps.length === 0}
				>
					Delete Selected Maps
				</Button>
			) : (
				""
			)}
			<Button
				variant="contained"
				onClick={() => {
					handleOpen();
					setTimeout(() => {
						handleClose();
					}, 10000);
				}}
			>
				Upload New Map
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={modalStyle} className="UploadMap-modal">
					<UploadMap />
				</Box>
			</Modal>
		</div>
	);
};

export default MapManager;
