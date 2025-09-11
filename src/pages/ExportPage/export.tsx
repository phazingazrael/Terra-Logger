import { Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";

import mapTpl from "../../components/Export/templates/map.md?raw";
import cityTpl from "../../components/Export/templates/city.md?raw";
import countryTpl from "../../components/Export/templates/country.md?raw";
import religionTpl from "../../components/Export/templates/religion.md?raw";

import { MarkdownExportPanel } from "../../components/Export/Export";

import type {
	TLCity,
	TLCountry,
	// TLCulture,
	// TLNote,
	TLReligion,
} from "../../definitions/TerraLogger";
import type { DataSets } from "../../definitions/Export";

function ExportPage() {
	const [map] = useRecoilState(mapAtom);
	const [Cities, setCities] = useState<TLCity[]>([]);
	const [Countries, setCountries] = useState<TLCountry[]>([]);
	// const [Cultures, setCultures] = useState<TLCulture[]>([]);
	// const [Notes, setNotes] = useState<TLNote[]>([]);
	const [Religions, setReligions] = useState<TLReligion[]>([]);

	const { mapId } = map;
	const MapInfo = map;

	// TODO: Enable choosing what is exported
	const data: DataSets = {
		MapInfo,
		Cities,
		Countries,
		// Cultures,
		// Notes,
		Religions,
	};

	useEffect(() => {
		const initializeDatabase = async () => {
			try {
				const database = await initDatabase();
				if (database) {
					console.info("Database initialized");
				}
			} catch (error) {
				console.error(error);
			}
		};

		initializeDatabase();
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const loadCities = async () => {
			const data = (await queryDataFromStore(
				"cities",
				"mapIdIndex",
				mapId,
			)) as TLCity[];
			setCities(data);
		};
		const loadCountries = async () => {
			const data = (await queryDataFromStore(
				"countries",
				"mapIdIndex",
				mapId,
			)) as TLCountry[];

			const tempData: TLCountry[] = [];
			for (const country of data) {
				if (country.name !== "Unknown") {
					country.cities = Cities.filter(
						(city) => city.country.name === country.name,
					);

					tempData.push(country);
					console.log(country);
				}
			}
			console.log(tempData);
			if (tempData.length > 0) {
				setCountries(tempData);
			}
		};
		// const loadCultures = async () => {
		// 	const data = (await queryDataFromStore(
		// 		"cultures",
		// 		"mapIdIndex",
		// 		mapId,
		// 	)) as TLCulture[];
		// 	setCultures(data);
		// };
		// const loadNotes = async () => {
		// 	const data = (await queryDataFromStore(
		// 		"notes",
		// 		"mapIdIndex",
		// 		mapId,
		// 	)) as TLNote[];
		// 	setNotes(data);
		// };
		const loadReligions = async () => {
			const data = (await queryDataFromStore(
				"religions",
				"mapIdIndex",
				mapId,
			)) as TLReligion[];
			setReligions(data);
		};

		loadCountries();
		loadCities();
		// loadCultures();
		// loadNotes();
		loadReligions();
	}, []);
	return (
		<Container>
			<div className="contentSubBody exportPage">
				<h1>Export</h1>
				<MarkdownExportPanel
					data={data}
					templates={{
						MapInfo: mapTpl,
						City: cityTpl,
						Country: countryTpl,
						Religion: religionTpl,
					}}
					zipName={`${MapInfo.info.name}-Export-${new Date().toISOString().slice(0, 19).replace("T", " ")}.zip`}
				/>
			</div>
		</Container>
	);
}

export default ExportPage;
