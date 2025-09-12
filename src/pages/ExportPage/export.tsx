import { Container } from "@mui/material";
import { useMemo } from "react";
import { useDB } from "../../db/DataContext";

import mapTpl from "../../components/Export/templates/map.md?raw";
import cityTpl from "../../components/Export/templates/city.md?raw";
import countryTpl from "../../components/Export/templates/country.md?raw";
import religionTpl from "../../components/Export/templates/religion.md?raw";

import { MarkdownExportPanel } from "../../components/Export/Export";

import type {
	MapInf,
	TLCity,
	TLCountry,
	// TLCulture,
	// TLNote,
	TLReligion,
} from "../../definitions/TerraLogger";

import type { DataSets } from "../../definitions/Export";

function ExportPage() {
	const { useActive, useActiveMap } = useDB();
	const MapInfo = useActiveMap<MapInf>();
	const Cities = useActive<TLCity>("cities");
	const CountriesRaw = useActive<TLCountry>("countries");
	// const Cultures = useActive<TLCulture>("cultures");
	const Notes = useActive<TLNote>("notes");
	const Religions = useActive<TLReligion>("religions");

	// Attach cities to countries, excluding "Unknown"
	const Countries = useMemo<TLCountry[]>(() => {
		if (!CountriesRaw.length) return [];
		return CountriesRaw.filter((c) => c.name !== "Unknown").map((country) => ({
			...country,
			cities: Cities.filter((city) => city.country?.name === country.name),
		}));
	}, [CountriesRaw, Cities]);

	// TODO: Enable choosing what is exported
	const data: DataSets = {
		// biome-ignore lint/suspicious/noExplicitAny: Any is fine
		MapInfo: MapInfo as any,
		Cities,
		Countries,
		// Cultures,
		// Notes,
		Religions,
	};

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
					zipName={`${MapInfo?.info?.name ?? "Map"}-Export-${new Date()
						.toISOString()
						.slice(0, 19)
						.replace("T", " ")}.zip`}
				/>
			</div>
		</Container>
	);
}

export default ExportPage;
