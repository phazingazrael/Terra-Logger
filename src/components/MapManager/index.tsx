import { Button, Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";

import mapAtom from "../../atoms/map.tsx";
import mapLoadedAtom from "../../atoms/mapLoaded.tsx";
import mapNameAtom from "../../atoms/mapName.tsx";
import {
	deleteDataFromStore,
	getFullStore,
	queryDataFromStore,
} from "../../db/interactions.tsx";

import "./index.css";
import { MapsCard } from "../Cards/index.tsx";

const MapManager: React.FC = () => {
	const [map, setMap] = useAtom(mapAtom);
	const [mapsList, setMapsList] = useState<MapInf[]>([]);
	const [selectedMaps, setSelectedMaps] = useState<string[]>([]);
	const [selectedCities, setSelectedCities] = useState<TLCity[]>([]);
	const [selectedCountries, setSelectedCountries] = useState<TLCountry[]>([]);
	const [selectedCultures, setSelectedCultures] = useState<TLCulture[]>([]);
	const [selectedNotes, setSelectedNotes] = useState<TLNote[]>([]);
	// const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
	const [selectedReligions, setSelectedReligions] = useState<TLReligion[]>([]);
	const [selectedNameBases, setSelectedNameBases] = useState<TLNameBase[]>([]);
	const [, setMapName] = useAtom(mapNameAtom);
	const [, setMapLoaded] = useAtom(mapLoadedAtom);

	useEffect(() => {
		const fetchMapsList = async () => {
			const mapsData = await getFullStore("maps");
			setMapsList(mapsData);
		};

		fetchMapsList();
	}, []);

	const createEmptyMap = (): MapInf => ({
		id: "",
		info: {
			name: "",
			seed: "",
			width: 0,
			height: 0,
			ID: "",
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
			console.log(`========= Deleting Map:  ${mapId} =========`);
			console.log("========= Deleting Cities =========");
			for (const city of selectedCities) {
				console.log(city.name);
				await deleteDataFromStore("cities", city._id);
			}

			console.log("========= Deleting Countries =========");
			for (const country of selectedCountries) {
				console.log(country.name);
				await deleteDataFromStore("countries", country._id);
			}

			console.log("========= Deleting Cultures =========");
			for (const culture of selectedCultures) {
				console.log(culture.name);
				await deleteDataFromStore("cultures", culture._id);
			}

			console.log("========= Deleting Notes =========");
			for (const note of selectedNotes) {
				console.log(note.name);
				await deleteDataFromStore("notes", note._id);
			}

			// TODO: implement NPCs
			// console.log("========= Deleting NPCs =========");
			// for (const npc of selectedNpcs) {
			// 	console.log(npc.name);
			// 	await deleteDataFromStore("npcs", npc._id);
			// }

			console.log("========= Deleting Religions =========");
			for (const religion of selectedReligions) {
				console.log(religion.name);
				await deleteDataFromStore("religions", religion._id);
			}

			console.log("========= Deleting NameBases =========");
			for (const nameBase of selectedNameBases) {
				console.log(nameBase.name);
				await deleteDataFromStore("nameBases", nameBase._id);
			}

			await deleteDataFromStore("maps", mapId);
			console.log(`========= Deleted Map: ${map.id} (${mapId}) =========`);
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

		if (mapsList.length > 0) {
			window.location.replace("/");
		} else {
			window.location.replace("/settings");
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
		</div>
	);
};

export default MapManager;
