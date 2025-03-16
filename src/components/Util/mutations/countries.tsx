import { v7 as uuidv7 } from "uuid";

import findCultureByID from "../findCultureByID";
import { createEmptyCountry } from "../mkEmpty/tlCountry";

export const mutateCountries = async (
	data: MapInfo,
	tempMap: TLMapInfo,
	populationRate: number,
	urbanization: string,
) => {
	for (const country of data.countries) {
		// define new country object
		const newCountry: TLCountry = createEmptyCountry();

		// add country data to new country object
		newCountry._id = uuidv7();
		newCountry.id = country.i;
		newCountry.coa = country.coa;
		newCountry.color = country.color;
		newCountry.location = data.info.name;
		newCountry.name = country.name;
		newCountry.nameFull = country.fullName;
		newCountry.political.form = country.form;
		newCountry.political.formName = country.formName;

		const Culture = findCultureByID(country.culture, data);

		if (Culture) {
			newCountry.culture = {
				_id: "",
				id: Culture.i as unknown as string,
			};
		}

		if (country.military) {
			for (const military of country.military) {
				newCountry.political.military.push({
					_id: uuidv7(),
					id: military.i,
					a: military.a,
					cell: military.cell,
					x: military.x,
					y: military.y,
					bx: military.bx,
					by: military.by,
					u: {
						cavalry: military.u.cavalry,
						archers: military.u.archers,
						infantry: military.u.infantry,
						artillery: military.u.artillery,
					},
					n: military.n,
					name: military.name,
					state: military.state,
					icon: military.icon,
				});
			}
		}
		if (country.neighbors) {
			for (const neighbor of country.neighbors) {
				newCountry.political.neighbors.push({
					name:
						data.countries[neighbor].fullName || data.countries[neighbor].name,
					id: data.countries[neighbor].i,
					_id: "",
				});
			}
		}
		if (country.diplomacy) {
			country.diplomacy.forEach((diplomacyStatus, index) => {
				let status = diplomacyStatus;
				if (status === "Suspicion") {
					status = "Suspicious";
				}
				if (index === country.i) {
					status = "-";
				}

				const dipObj: TLDiplomacy = {
					name: data.countries[index].fullName || data.countries[index].name,
					status,
					id: data.countries[index].i,
				};
				newCountry.political.diplomacy.push(dipObj);
			});
		}

		if (country.coa) {
			// get coa svg from armoria and save to string inside of city data
			const coa = country.coa;
			let url: string | undefined;

			// check if coa is an object and if it has more than 0 keys
			if (typeof coa === "object" && Object.keys(coa).length > 0) {
				// if so, encode the coa data to a string and add it to the url
				url = `https://armoria.herokuapp.com/?coa=${encodeURIComponent(JSON.stringify(coa))}`;
			} else if (coa === undefined) {
				console.log(coa, (country as unknown as TLCity)._id);
				// if not, add the default url
				url = "https://armoria.herokuapp.com/?size=500&format=svg";
			}

			if (url !== undefined) {
				try {
					const response = await fetch(url);
					const svg = await response.text();
					if (svg.startsWith("<!DOCTYPE html>")) {
						throw new Error("Received HTML error page");
					}
					newCountry.coaSVG = svg;
					console.log(country.name, url);
				} catch (error) {
					console.error("Error fetching SVG:", error);
				}
			}
		}

		const urbanvalue = Math.round(
			country.urban * Number(populationRate) * Number(urbanization),
		);
		newCountry.population.urban = urbanvalue.toLocaleString("en-US") || "";

		const ruralvalue = Math.round(
			country.rural * Number(populationRate) * Number(urbanization),
		);
		newCountry.population.rural = ruralvalue.toLocaleString("en-US") || "";

		newCountry.population.total =
			Math.round(ruralvalue + urbanvalue).toLocaleString("en-US") || "";

		newCountry.tags.push({
			_id: "0192be16-c07d-74ab-966e-5a5a5f43c2ff",
			Default: true,
			Description:
				"A distinct and sovereign nation within the world, often with defined borders.",
			Name: "Country",
			Type: "Locations",
		});
		newCountry.type = country.type;

		tempMap.countries.push(newCountry);
	}

	return tempMap.countries;
};
