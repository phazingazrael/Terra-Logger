import { v7 as uuidv7 } from "uuid";

import { createEmptyCountry } from "../mkEmpty/tlCountry";

import getCOA from "../generators/coa/render";

import type {
	TLMapInfo,
	TLCountry,
	TLDiplomacy,
	TLContentView,
	TLContentSection,
} from "../../../definitions/TerraLogger";

export const mutateCountries = async (
	data: MapInfo,
	tempMap: TLMapInfo,
	populationRate: number,
	urbanization: string,
	mapSVG: string,
	dataDisplay: string,
) => {
	for (const country of data.countries) {
		if (country.name !== "Unknown" && country.removed !== true) {
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

			const Culture = tempMap.cultures.find((c) => c.id === country.culture);

			if (Culture) {
				newCountry.culture = {
					_id: "",
					id: Culture.id as unknown as string,
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
							data.countries[neighbor].fullName ||
							data.countries[neighbor].name,
						id: data.countries[neighbor].i,
						_id: "",
					});
				}
			}

			if (country.name !== "Neutrals") {
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
							name:
								data.countries[index].fullName || data.countries[index].name,
							status,
							id: data.countries[index].i,
						};
						newCountry.political.diplomacy.push(dipObj);
					});
				}
			} else {
				newCountry.political.diplomacy = [];
			}

			const randomNumberInRange = (min: number, max: number): number => {
				return Math.floor(Math.random() * (max - min + 1)) + min;
			};

			const randomSeed = randomNumberInRange(1000, 1000000);

			if (country.coa) {
				if ((country.coa as unknown as { custom: boolean }).custom !== true) {
					// get coa svg from armoria and save to string inside of city data			const coa = country.coa;
					const coa = country.coa;
					try {
						const response = await (typeof coa === "object" &&
						Object.keys(coa).length > 0
							? getCOA(country.i as unknown as string, coa)
							: fetch(
									`https://armoria.herokuapp.com/?size=500&format=svg&seed=${randomSeed}`,
								).then((response) => response.text()));
						const svg = response.replace(/_coa/g, "");
						if (svg.startsWith("<!DOCTYPE html>")) {
							throw new Error("Received HTML error page");
						}
						newCountry.coaSVG = svg;
					} catch (error) {
						console.error("Error fetching SVG:", country.name, error);
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
					const stateCOA = emblems.find((svg) =>
						svg.includes(`<svg id="stateCOA${country.i}"`),
					);
					if (!stateCOA) {
						throw new Error(
							`Error: could not find <svg id="stateCOA${country.i}" in mapSVG`,
						);
					}
					newCountry.coaSVG = stateCOA;
				}
			} else if (!country.coa || country.coa === undefined) {
				const response = await fetch(
					`https://armoria.herokuapp.com/?size=500&format=svg&seed=${randomSeed}`,
				).then((response) => response.text());
				newCountry.coaSVG = response;
			}
			console.groupEnd();

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
			const contentItems: TLContentSection[] = [
				{
					type: "Section",
					props: {
						className: "section citiesList",
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
										text: "Cities",
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
								listname: "cities",
							},
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section military",
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
										text: "Military",
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
								listtype: "Military",
							},
						},
					],
					set: ["default", "recommended"],
				},
				{
					type: "Section",
					props: {
						className: "section political-info",
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
										text: "Political Information",
									},
								},
							],
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "PoliticalInfoDetail",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Government Type:",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Detail",
										label: "Capital:",
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
						className: "section economy",
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
										text: "Economy",
									},
								},
							],
						},
						{
							type: "SubList",
							props: {
								listtype: "Detail",
								className: "sub-lists",
								listname: "economy-ex-imports",
							},
						},
						{
							type: "List",
							props: {
								listtype: "Detail",
								className: "info",
								listname: "EconomyDetail",
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
											"[Merchant houses, cybernetic megacorps, thieves’ guilds, etc.]",
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
						className: "section diplomacy",
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
										text: "Diplomacy",
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
								listtype: "Unordered",
								className: "diplomacy-relations",
								listname: "DiplomacyList",
								listheading: "Friendly",
							},
							children: [
								{
									type: "ListItem",
									props: {
										itemtype: "Unordered",
										text: "Principality of Victrixia",
									},
								},
								{
									type: "ListItem",
									props: {
										itemtype: "Unordered",
										text: "Milfordean League",
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
								listname: "GovernmentPowerDetail",
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
				sourceType: "country",
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

			newCountry.content = content;

			tempMap.countries.push(newCountry);
		}
	}

	return tempMap.countries;
};
