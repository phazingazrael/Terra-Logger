import { useMemo } from "react";
import { useActive, useActiveMap } from "../../db/DataContext";

import { MarkdownExportPanel } from "../../components/Export/Export";

import type {
	MapInf,
	TLCity,
	TLCountry,
	TLCulture,
	TLNote,
	TLReligion,
} from "../../definitions/TerraLogger";

import type { DataSets } from "../../definitions/Export";
import type { TLNPC } from "../../definitions/TerraLogger";

function ExportPage() {
	const MapInfo = useActiveMap<MapInf>();
	const Cities = useActive<TLCity>("cities");
	const CountriesRaw = useActive<TLCountry>("countries");
	const Cultures = useActive<TLCulture>("cultures");
	const Notes = useActive<TLNote>("notes");
	const Religions = useActive<TLReligion>("religions");
	const NPCs = useActive<TLNPC>("npcs");

	const citiesByCountryName = useMemo(() => {
		const byName = new Map<string, TLCity[]>();
		for (const city of Cities) {
			const countryName = city.country?.name;
			if (!countryName) continue;
			const existing = byName.get(countryName);
			if (existing) existing.push(city);
			else byName.set(countryName, [city]);
		}
		return byName;
	}, [Cities]);

	// Attach cities to countries, excluding "Unknown"
	const Countries = useMemo<TLCountry[]>(() => {
		if (!CountriesRaw.length) return [];
		return CountriesRaw.reduce<TLCountry[]>((countries, country) => {
			if (country.name === "Unknown") return countries;
			countries.push({
				...country,
				cities: citiesByCountryName.get(country.name) ?? [],
			});
			return countries;
		}, []);
	}, [CountriesRaw, citiesByCountryName]);

	// TODO: Enable choosing what is exported
	const data: DataSets = {
		// biome-ignore lint/suspicious/noExplicitAny: Any is fine
		MapInfo: MapInfo as any,
		Cities,
		Countries,
		Cultures,
		Notes,
		Religions,
		NPCs,
	};

	return (
		<div className="contentSubBody exportPage">
			<MarkdownExportPanel
				data={data}
				zipName={`${MapInfo?.info?.name ?? "Map"}-Export-${new Date()
					.toISOString()
					.slice(0, 19)
					.replace("T", " ")}.zip`}
			/>
		</div>
	);
}

export default ExportPage;
