import { createEmptyCity, minmax } from "../../Util";

import { v7 as uuidv7 } from "uuid";

import getCOA from "../generators/coa/render";

import type {
	TLMapInfo,
	TLCity,
	TLContentView,
	TLContentSection,
} from "../../../definitions/TerraLogger";

export const mutateCities = async (
	data: MapInfo,
	tempMap: TLMapInfo,
	populationRate: number,
	urbanization: string,
	urbanDensity: number,
	mapSVG: string,
	dataDisplay: string,
) => {
	// mutate cities
	for (const city of data.cities) {
		if (city.removed !== true && city.name !== undefined) {
			// if city is not removed
			// add city data to new city object
			const newCity: TLCity = createEmptyCity();

			// define "newCity" properties
			newCity._id = uuidv7(); // unique id,
			newCity.capital = !!city.capital; // if city is capital
			newCity.coa = city.coa; // set CoA data
			newCity.country.id = city.state; // set country id,
			newCity.id = city.i; // set city id
			newCity.mapLink = city.link; // set map link
			newCity.mapSeed = city.MFCG as unknown as string; // set map seed
			newCity.name = city.name; // set city name
			newCity.population = Math.round(
				city.population * Number(populationRate) * Number(urbanization),
			).toLocaleString("en-US");
			// set default city tags
			newCity.tags = [
				{
					_id: "0192be16-c07d-74dd-946d-07ba53af9bf0",
					Default: true,
					Description:
						"A large and permanent human settlement within the world.",
					Name: "City",
					Type: "Locations",
				},
			];
			newCity.type = city.type; // set city type
			newCity.description = ""; // no description

			const randomNumberInRange = (min: number, max: number): number => {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			};

			const randomSeed = randomNumberInRange(1000, 1000000);

			if (city.coa) {
				if ((city.coa as unknown as { custom: boolean }).custom !== true) {
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
				} else {
					const start = mapSVG.indexOf('<g id="defs-emblems">');
					if (start === -1) {
						throw new Error('Error: could not find <g id="defs-emblems">');
					}
					const end = mapSVG.indexOf("</g>", start);
					if (end === -1) {
						throw new Error("Error: could not find </g>");
					}
					const emblems = mapSVG
						.slice(start, end)
						.match(/<svg.*?<\/svg>/gs) as string[];
					const cityCOA = emblems.find((svg) =>
						svg.includes(`<svg id="burgCOA${city.i}"`),
					);
					if (!cityCOA) {
						throw new Error(
							`Error: could not find <svg id="burgCOA${city.i}" in mapSVG`,
						);
					}
					newCity.coaSVG = cityCOA;
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

			const Culture = tempMap.cultures.find((c) => c.id === city.culture);

			if (Culture) {
				newCity.culture = {
					_id: "",
					id: Culture.id as unknown as string,
					name: Culture.name,
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

			const contentItems: TLContentSection[] = [
				{
					type: "Section",
					props: {
						className: "section features",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Features",
									},
								},
								{
									type: "Icon",
									props: {
										name: "GiSparkles",
										style: "DynamicSparkle",
									},
								},
							],
						},
						{
							type: "DataList",
							props: {
								listtype: "Chips",
								className: "tag-list",
								listname: "features",
							},
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section tags",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Tags",
									},
								},
								{
									type: "Icon",
									props: {
										name: "GiSparkles",
										style: "DynamicSparkle",
									},
								},
							],
						},
						{
							type: "DataList",
							props: {
								listtype: "Chips",
								className: "tag-list",
								listname: "tags",
							},
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section map-link",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Map",
									},
								},
								{
									type: "Icon",
									props: {
										name: "GiSparkles",
										style: "DynamicSparkle",
									},
								},
							],
						},
						{
							type: "Linkage",
							props: {
								target: "_blank",
								rel: "noopener noreferrer",
								text: "🗺️ View City Map",
								linkname: "cityMap",
							},
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section history",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "History",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "HistoryDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Notable Founding Myths/Legends:",
										value:
											"[Ancient tales about how the city was formed or its divine/magical origins.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Major Wars & Conflicts:",
										value:
											"[Significant wars, galactic conflicts, magical wars, or civil uprisings.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Epochs & Eras:",
										value:
											"[Different historical periods, dynasties, or interstellar ages.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Notable Leaders & Rulers:",
										value: "[Kings, Emperors, Warlords, AI Governors, etc.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section geography-environment",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Geography & Environment",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "GeographyEnvironmentDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Location:",
										value:
											"[Describe location within the world, dimension, or space sector.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Climate & Atmosphere:",
										value:
											"[Earth-like, toxic, magical storms, artificial climate, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Topography & Terrain:",
										value:
											"[Floating islands, underground caverns, space stations, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Planar/Dimensional Traits:",
										value:
											"[Is it tied to another plane? Does time move differently here?]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Unique Natural Features:",
										value:
											"[Magical ley lines, sentient forests, shifting deserts, etc.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section economy-trade",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Economy & Trade",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "EconomyTradeDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Major Industries:",
										value:
											"[Alchemy, soul-forging, mecha production, space mining, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Currency & Trade:",
										value:
											"[Gold coins, credits, mana crystals, barter system, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Notable Guilds & Corporations:",
										value:
											"[Merchant houses, cybernetic megacorps, thieves guilds, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Imports & Exports:",
										value:
											"[What does the city rely on, and what does it supply to others?]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Black Market & Illicit Trade:",
										value: "[Contraband, smugglers, underground syndicates.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section government-power",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Government & Power Structure",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "GovernmentPowerDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Government Type:",
										value:
											"[Monarchy, Theocracy, AI-Controlled, Mage Council, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Current Ruler(s):",
										value:
											"[King, High Priestess, AI Overlord, Elder Council, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Noble Houses & Factions:",
										value:
											"[Major power groups, noble families, rival factions.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Laws & Justice System:",
										value:
											"[Trial by combat? Magic-enforced law? A dystopian police state?]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Corruption Level:",
										value:
											"[Low, moderate, high, controlled by crime syndicates.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section demographics-society",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Demographics & Society",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "DemographicsSocietyDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Population Growth & Migration:",
										value:
											"[Stable, declining, booming, dependent on magic/artificial births.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Ethnic & Racial Composition:",
										value: "[Humans, Elves, Orcs, Androids, Clones, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Language & Scripts:",
										value:
											"[Common tongue, ancient runes, digital code-based speech.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Religion & Deities:",
										value:
											"[Worship of gods, forgotten cosmic entities, AI prophets.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Caste/Class System:",
										value:
											"[Strict hierarchy, meritocracy, anarchist communes, slave societies.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section military-defense",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Military & Defense",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "MilitaryDefenseDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "City Guard & Enforcers:",
										value:
											"[Knights, robotic enforcers, spectral guardians, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Standing Army/Navy:",
										value:
											"[Size and structure of land, sea, air, or space forces.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Walls & Defenses:",
										value:
											"[Titanium barriers, magical shields, psychic wards.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Notable Weapons & Technology:",
										value:
											"[Arcane cannons, plasma rifles, necromantic constructs.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Mercenaries & Private Forces:",
										value:
											"[Who offers protection outside of government control?]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section education-knowledge",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Education & Knowledge",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "EducationKnowledgeDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Academies & Universities:",
										value:
											"[Magical academies, science research institutes, AI learning centers.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Forbidden Knowledge & Secret Societies:",
										value: "[Cults, hidden libraries, esoteric scholars.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Notable Thinkers & Researchers:",
										value:
											"[Famous wizards, AI philosophers, other intellectuals.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Libraries & Archives:",
										value:
											"[World’s largest collection of spell tomes, AI-encrypted data vaults.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section culture-arts",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Culture, Arts & Entertainment",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "CultureArtsDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Music & Performing Arts:",
										value: "[Bards, holographic opera, psychic concerts.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Festivals & Holidays:",
										value:
											"[Ritual sacrifice days, AI awakening celebrations, etc.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Cuisine & Food Culture:",
										value:
											"[Elven wine, synthetic protein cubes, soul-infused delicacies.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Fashion & Dress:",
										value:
											"[Steampunk, cybernetic enhancements, enchanted robes.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section crime-underworld",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Crime & Underworld",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "CrimeUnderworldDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Thieves' Guilds & Crime Syndicates:",
										value: "[Who controls the underground economy?]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Black Markets & Smuggling Rings:",
										value: "[Illegal tech, cursed artifacts, ancient relics.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Assassins & Mercenaries:",
										value: "[Infamous killers, rogue mages, bounty hunters.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Notable Criminals & Outlaws:",
										value:
											"[Legendary thieves, escaped war criminals, anarchist hackers.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section religion-mythology",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Religion & Mythology",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "ReligionMythologyDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Gods, Demons & Cosmic Entities:",
										value: "[Who is worshiped or feared in the city?]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Sacred Sites & Temples:",
										value:
											"[Massive cathedrals, shrines hidden in floating cities.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Religious Factions & Cults:",
										value: "[What groups enforce (or subvert) faith?]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Miracles & Divine Interventions:",
										value: "[Recent divine events or mythological sightings.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section notable-locations",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Notable Locations & Landmarks",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "NotableLocationsDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "The Great Palace/Throne Room:",
										value: "[Seat of power, filled with ancient relics.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "The Arcane University/Tech Lab:",
										value: "[Center of magical/scientific advancement.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "The Underbelly/Sewers/Shadow City:",
										value: "[Underground city full of secrets.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "The Astral Tower/Observatory:",
										value:
											"[Study of other planes, stars, and cosmic entities.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section sister-cities",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Sister Cities & Interstellar Relations",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "SisterCitiesDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Sister Cities & Diplomatic Ties:",
										value:
											"[List of allied cities, rival cities, or otherworldly diplomatic ties.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section notable-figures",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Notable Figures & Legends",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "NotableFiguresDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Influential Figures:\n",
										value:
											"[List of influential people, such as rulers, warriors, philosophers, criminals, and deities.]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section adventurers-mercenaries",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Adventurers & Mercenary Work",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "AdventurersMercenariesDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Common Quests & Jobs:",
										value:
											"[Hunting monsters, retrieving artifacts, political assassinations.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Bounty Board:",
										value:
											"[List of wanted criminals, beasts, or other bounties.]",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Guilds & Organizations for Adventurers:",
										value: "[Who offers work and resources?]",
									},
								},
							],
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section additional-info",
					},
					children: [
						{
							type: "Typography",
							props: {
								color: "text.secondary",
								component: "h2",
							},
							children: [
								{
									type: "Text",
									props: {
										text: "Additional Information",
									},
								},
								{
									type: "Icon",
									props: {
										name: "GiSparkles",
										style: "DynamicSparkle",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "AdditionalInfo",
							},
						},
					],
					set: ["default", "recommended"],
				},
			];

			const content: TLContentView = {
				type: "View",
				sourceType: "city",
				props: {
					className: "content-grid",
				},
				children: [],
			};

			for (const ContentItem of contentItems) {
				if (ContentItem.type === "Section") {
					if (ContentItem.set?.includes(dataDisplay)) {
						content.children?.push(ContentItem);
					}
				}
			}

			newCity.content = content;

			tempMap.cities.push(newCity);
		} else {
			console.log("city data not found", city);
		}
	}

	return tempMap.cities;
};
