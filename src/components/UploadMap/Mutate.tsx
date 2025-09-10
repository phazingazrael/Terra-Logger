import { handleSvgReplace } from "../Util/handleSvgReplace";
import { createTerraLoggerMap } from "../Util/mkEmpty/tlMap";

import {
	mutateCities,
	mutateCountries,
	mutateCultures,
	mutateReligions,
	mutateNameBases,
	mutateNotes,
} from "../Util/mutations";

import type {
	TLMapInfo,
	TLCity,
	TLCulture,
} from "../../definitions/TerraLogger";

const assignMapInfo = (tempMap: TLMapInfo, data: MapInfo) => {
	// add map info that doesn't need mutating.
	tempMap.info = data.info;
	tempMap.settings = data.settings;
	tempMap.SVG = data.SVG;
};

const mutateData = async (data: MapInfo, Pack: Pack) => {
	const { populationRate, urbanization, urbanDensity } = data.settings;

	// Mutate Map Data to Terra-Logger Format //
	const tempMap: TLMapInfo = createTerraLoggerMap();

	// begin mutating data //
	try {
		assignMapInfo(tempMap, data);
		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
	} catch (error) {
		console.error("Error assigning Map Info", error);
	}

	// mutate cultures
	try {
		const Cultures = await mutateCultures(
			data,
			tempMap,
			populationRate,
			urbanization,
		);

		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
		tempMap.cultures = Cultures;
	} catch (error) {
		console.error("Error mutating cultures:", error);
	}

	// mutate cities
	try {
		const Cities = await mutateCities(
			data,
			tempMap,
			populationRate,
			urbanization,
			urbanDensity,
			tempMap.SVG,
		);
		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
		tempMap.cities = Cities;
	} catch (error) {
		console.error("Error mutating cities:", error);
	}

	// mutate countries
	try {
		const Countries = await mutateCountries(
			data,
			tempMap,
			populationRate,
			urbanization,
			tempMap.SVG,
		);
		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
		tempMap.countries = Countries;
	} catch (error) {
		console.error("Error mutating countries:", error);
	}

	// mutate name bases
	try {
		const NameBases = await mutateNameBases(tempMap);
		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
		tempMap.nameBases = NameBases;
	} catch (error) {
		console.error("Error mutating name bases:", error);
	}

	// mutate notes
	try {
		const Notes = await mutateNotes(data, tempMap);
		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
		tempMap.notes = Notes;
	} catch (error) {
		console.error("Error mutating notes:", error);
	}

	// mutate religions - needs touching up.
	try {
		const Religions = await mutateReligions(
			data,
			tempMap,
			Pack,
			populationRate,
			urbanization,
		);
		// set timeout for 3 seconds
		setTimeout(() => {}, 3000);
		tempMap.religions = Religions;
	} catch (error) {
		console.error("Error mutating religions:", error);
	}

	//associate cities with countries
	// biome-ignore lint/complexity/noForEach: <explanation>
	(tempMap.cities as unknown as TLCity[]).forEach((city) => {
		if (city.country) {
			const tempCountry = tempMap.countries.find(
				(c) => c.id === city.country.id,
			);
			if (tempCountry) {
				city.country = {
					_id: tempCountry._id,
					govForm: tempCountry.political.form,
					govName: tempCountry.political.formName,
					id: tempCountry.id,
					name: tempCountry.name,
					nameFull: tempCountry.nameFull,
				};
			}
		}
		if (city.culture) {
			const tempCulture = tempMap.cultures.find(
				(c) => (c.id as unknown as string) === city.culture.id,
			);
			if (tempCulture) {
				city.culture = {
					id: tempCulture.id as unknown as string,
					_id: tempCulture._id,
					name: tempCulture.name,
				};
			}
		}
	});

	// assigned Cities to Countries

	// mutate cultures
	for (const culture of tempMap.cultures as unknown as TLCulture[]) {
		const cultureCountries = tempMap.countries.filter(
			(country) => country.culture.id === (culture.id as unknown as string),
		);
		let urbPop = 0;
		let rurPop = 0;

		for (const country of cultureCountries) {
			const urbValue = Number.parseInt(
				country.population.urban.replace(/,/g, ""),
			);
			const rurValue = Number.parseInt(
				country.population.rural.replace(/,/g, ""),
			);

			urbPop += urbValue;
			rurPop += rurValue;
		}
		culture.urbanPop = urbPop.toLocaleString("en-US");
		culture.ruralPop = rurPop.toLocaleString("en-US");
	}

	handleSvgReplace({
		svg: data.SVG,
		height: data.info.height,
		width: data.info.width,
	});

	return tempMap;
};

export default mutateData;
