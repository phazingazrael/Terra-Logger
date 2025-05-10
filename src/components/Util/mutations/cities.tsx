import { minmax, findCultureByID } from "../../Util";

import { v7 as uuidv7 } from "uuid";

import getCOA from "../generators/coa/render.tsx";

export const mutateCities = async (
	data: MapInfo,
	tempMap: TLMapInfo,
	populationRate: number,
	urbanization: string,
	urbanDensity: number,
) => {
	// mutate cities
	for (const city of data.cities) {
		if (city.removed !== true && city.name !== undefined) {
			// if city is not removed
			// add city data to new city object
			const newCity: TLCity = {
				_id: uuidv7(), // unique id,
				capital: !!city.capital, // if city is capital
				coa: city.coa, // set CoA data
				coaSVG: "",
				country: {
					_id: "",
					govForm: "",
					govName: "",
					id: city.state, // set country id,
					name: "",
					nameFull: "",
				},
				culture: {
					_id: "",
					id: "",
				},
				features: [],
				id: city.i, // set city id
				mapLink: city.link, // set map link
				mapSeed: city.MFCG as unknown as string, // set map seed
				name: city.name, // set city name
				population: Math.round(
					city.population * Number(populationRate) * Number(urbanization),
				).toLocaleString("en-US"),
				size: "",
				tags: [
					// set default city tags
					{
						_id: "0192be16-c07d-74dd-946d-07ba53af9bf0",
						Default: true,
						Description:
							"A large and permanent human settlement within the world.",
						Name: "City",
						Type: "Locations",
					},
				],
				type: city.type, // set city type
				description: "", // no description
			};

			const randomNumberInRange = (min: number, max: number): number => {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			};

			const randomSeed = randomNumberInRange(1000, 1000000);

			if (city.coa) {
				// get coa svg from armoria and save to string inside of city data

				const coa = city.coa;

				try {
					const response = await (typeof coa === "object" &&
					Object.keys(coa).length > 0
						? getCOA(city.i as unknown as string, coa)
						: fetch(
								`https://armoria.herokuapp.com/?size=500&format=svg&seed=${randomSeed}`,
							).then((response) => response.text()));
					const svg = response;
					if (svg.startsWith("<!DOCTYPE html>")) {
						throw new Error("Received HTML error page");
					}
					newCity.coaSVG = svg;
				} catch (error) {
					console.error("Error fetching SVG:", city.name, error);
				}
			} else if (!city.coa || city.coa === undefined) {
				const response = await fetch(
					`https://armoria.herokuapp.com/?size=500&format=svg&seed=${randomSeed}`,
				).then((response) => response.text());
				newCity.coaSVG = response;
			}

			// size & sizeRaw from editors.js from Azgaar.
			// https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/ui/editors.js#L306C1-L307C51
			const sizeRaw =
				2.13 * ((city.population * populationRate) / urbanDensity) ** 0.385;
			const size = minmax(Math.ceil(sizeRaw), 6, 100);

			// city features switch
			switch (true) {
				case city.citadel === 1:
					newCity.features.push("Citadel");
					newCity.tags.push({
						_id: "0192be16-c07d-75c8-a7cb-e902f9288150",
						Default: true,
						Description:
							"A fortress, typically on high ground, protecting or dominating a city.",
						Name: "Citadel",
						Type: "Maps",
					});
					break;
				case city.plaza === 1:
					newCity.features.push("Plaza");
					newCity.tags.push({
						_id: "0192be16-c07d-75ce-b400-fb4205c032cb",
						Default: true,
						Description: "An open public square, especially in a city or town.",
						Name: "Plaza",
						Type: "Maps",
					});
					break;
				case city.port === 1:
					newCity.features.push("Port");
					newCity.tags.push({
						_id: "0192be16-c07d-775a-88b6-a04be82a4ef8",
						Default: true,
						Description:
							"Locations designated for harboring and facilitating the arrival, departure, and storage of ships and vessels. Ports are key points of trade, transportation, and naval activities within the world, often situated along coastlines or major waterways.",
						Name: "Port",
						Type: "Maps",
					});
					break;
				case city.shanty === 1:
					newCity.features.push("Shanty Town(s)");
					newCity.tags.push({
						_id: "0192be16-c07d-7dcb-8bc4-59b414181713",
						Default: true,
						Description:
							"A deprived area on the outskirts of a town consisting of makeshift dwellings.",
						Name: "Shanty Town",
						Type: "Maps",
					});
					break;
				case city.temple === 1:
					newCity.features.push("Temple");
					newCity.tags.push({
						_id: "0192be16-c07d-77cb-a8a9-5f2e7cca4ff5",
						Default: true,
						Description:
							"A building dedicated to the worship of deities or a place of religious practices.",
						Name: "Temple",
						Type: "Maps",
					});
					break;
				case city.walls === 1:
					newCity.features.push("Walls");
					newCity.tags.push({
						_id: "0192be16-c07d-7d9d-94e7-5c20fb29cdf4",
						Default: true,
						Description:
							"Defensive barriers or fortifications enclosing a city or settlement.",
						Name: "Walls",
						Type: "Maps",
					});
			}

			const Culture = findCultureByID(city.culture, data);

			if (Culture) {
				newCity.culture = {
					_id: "",
					id: Culture.i as unknown as string,
				};
			}

			const populationValue = Number.parseInt(
				newCity.population.replace(/,/g, ""),
			);

			if (city.i !== undefined) {
				// Check if city index is defined
				// Convert city index to a string and pad it with leading zeros to ensure it's 4 digits
				const paddedId = city.i.toString().padStart(4, "0");
				// Check if the city link is not already set
				if (city.link === undefined) {
					// Set the map seed for the city as the padded city index
					newCity.mapSeed = paddedId;
					// Create a unique seed for the map by concatenating the global seed with the padded city index
					const seed = data.info.seed + paddedId;
					// Construct a map link using various city properties and the created seed
					newCity.mapLink = `https://watabou.github.io/city-generator/?size=${size}&seed=${seed}&name=${newCity.name}&population=${newCity.population.replace(/,/g, "")}&greens=0&citadel=${city.citadel}&urban_castle=${city.citadel}&plaza=${city.plaza}&temple=${city.temple}&walls=${city.walls}&shantytown=${city.shanty}&coast=${city.port}&river=${city.port}&hub=${city.capital}&sea=${city.port}`;
				}
			} else {
				// If city index is not defined, generate a random number to use as the map seed
				const randomNumber = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;
				// Pad the random number with leading zeros to ensure it's 4 digits
				const paddedRandomNumber = randomNumber.toString().padStart(4, "0");
				// Set the map seed for the city as the padded random number
				newCity.mapSeed = paddedRandomNumber;
				// Create a unique seed for the map by concatenating the global seed with the padded random number
				const seed = data.info.seed + paddedRandomNumber;
				// Set the city ID to a default value of 0
				newCity.id = 0;
				// Construct a map link using various city properties and the created seed
				newCity.mapLink = `https://watabou.github.io/city-generator/?size=${size}&seed=${seed}&name=${newCity.name}&&population=${newCity.population.replace(/,/g, "")}&greens=0&citadel=${city.citadel}&urban_castle=${city.citadel}&plaza=${city.plaza}&temple=${city.temple}&walls=${city.walls}&shantytown=${city.shanty}&coast=${city.port}&river=${city.port}&hub=${city.capital}&sea=${city.port}`;
			}

			// city size switch
			// city size data loosely interpreted from "Medieval Demographics Made Easy" by S. John Ross (last known email sjohn@cumberlandgames.com)
			// plans to implement further data from the demographics based on https://www.rpglibrary.org/utils/meddemog/ by Brandon Blackmoor
			switch (true) {
				case populationValue < 21:
					newCity.size = "Thorp";
					newCity.tags.push({
						_id: "0192be16-c07d-74f5-99b0-a740feb48fa8",
						Default: true,
						Description: "A small village or hamlet within the world.",
						Name: "Thorp",
						Type: "Locations",
					});
					break;
				case populationValue > 21 && populationValue < 60:
					newCity.size = "Hamlet";
					newCity.tags.push({
						_id: "0192be16-c07d-75f5-8a3a-71493c6551c4",
						Default: true,
						Description:
							"A small settlement, often smaller than a village, within the world.",
						Name: "Hamlet",
						Type: "Locations",
					});
					break;
				case populationValue > 61 && populationValue < 200:
					newCity.size = "Village";
					newCity.tags.push({
						_id: "0192be16-c07d-744f-8488-5243c3811a7e",
						Default: true,
						Description:
							"A clustered human settlement larger than a hamlet but smaller than a town.",
						Name: "Village",
						Type: "Locations",
					});
					break;
				case populationValue > 201 && populationValue < 2000:
					newCity.size = "Small Town";
					newCity.tags.push({
						_id: "0192be16-c07d-75f3-aef5-43d0a0d27233",
						Default: true,
						Description:
							"A compact and organized human settlement, larger than a village but smaller than a large town.",
						Name: "Small Town",
						Type: "Locations",
					});
					break;
				case populationValue > 2001 && populationValue < 5000:
					newCity.size = "Large Town";
					newCity.tags.push({
						_id: "0192be16-c07d-7a1e-94fc-485f70488182",
						Default: true,
						Description:
							"A sizable and populated human settlement, larger than a small town but smaller than a city.",
						Name: "Large Town",
						Type: "Locations",
					});
					break;
				case populationValue > 5001 && populationValue < 10000:
					newCity.size = "Small City";
					newCity.tags.push({
						_id: "0192be16-c07d-7e2c-88a4-f1c2fde568bc",
						Default: true,
						Description:
							"A compact and urbanized human settlement, larger than a large town but smaller than a metropolis.",
						Name: "Small City",
						Type: "Locations",
					});
					break;
				case populationValue > 10001 && populationValue < 25000:
					newCity.size = "Large City";
					newCity.tags.push({
						_id: "0192be16-c07d-7b5e-abf6-d13114d5327b",
						Default: true,
						Description:
							"A densely populated and highly developed urban center within the world.",
						Name: "Large City",
						Type: "Locations",
					});
					break;
				case populationValue > 25000:
					newCity.size = "Metropolis";
					newCity.tags.push({
						_id: "0192be16-c07d-7739-8b58-d67e3913403a",
						Default: true,
						Description:
							"An extremely large and highly populated urban center, often a major hub of commerce and culture.",
						Name: "Metropolis",
						Type: "Locations",
					});
					break;
				default:
					newCity.size = "unknown";
					break;
			}

			newCity.type = `City - ${newCity.size}`;

			tempMap.cities.push(newCity);
		} else if (city.removed === true) {
			console.log("city was removed");
		} else {
			console.log("city data not found", city);
		}
	}

	return tempMap.cities;
};
