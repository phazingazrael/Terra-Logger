import { v7 as uuidv7 } from "uuid";

import { createEmptyCountry } from "../mkEmpty/tlCountry";

import getCOA from "../generators/coa/render";

import type {
	TLMapInfo,
	TLCountry,
	TLDiplomacy,
} from "../../../definitions/TerraLogger";
import { countryAdapter } from "../../atlas/adapters/countryAdapter";
import { generate } from "../generators/coa/generate";

export const mutateCountries = async (
	data: MapInfo,
	tempMap: TLMapInfo,
	populationRate: number,
	urbanization: string,
	mapSVG: string,
) => {
	let customEmblems: Element | null = null;
	const troops = militaryTroopConverter(data.renderingSource?.version ?? data.params[0], populationRate);

	for (const country of data.countries) {
		if ((country.i === 0 || country.name !== "Unknown") && country.removed !== true) {
			// define new country object
			const newCountry: TLCountry = createEmptyCountry();

			// add country data to new country object
			newCountry._id = uuidv7();
			newCountry.aliases = [newCountry.nameFull, newCountry.name].filter(
				Boolean,
			);
			newCountry.coa = country.coa ? {
				...country.coa,
				charges: country.coa.charges?.map((charge) => ({
					...charge,
					sinister: charge.sinister === undefined ? undefined : Boolean(charge.sinister),
					reversed: charge.reversed === undefined ? undefined : Boolean(charge.reversed),
					layered: charge.layered === undefined ? undefined : Boolean(charge.layered),
				})),
			} : undefined;
			newCountry.color = country.color;
			newCountry.id = country.i;
			newCountry.location = data.info.name;
			newCountry.name = country.name;
			newCountry.nameFull = country.fullName;
			newCountry.planetPlane = "";
			newCountry.political.form = country.i === 0 ? "" : country.form;
			newCountry.political.formName = country.i === 0 ? "" : country.formName;
			newCountry.pronounced = newCountry.name;
			newCountry.religions = [];
			newCountry.terrain = "";
			newCountry.theme = newCountry.type;

			const Culture = tempMap.cultures.find((c) => c.id === country.culture);
			newCountry.cities = tempMap.cities.filter((city) => {
				return String(city.country?.id) === String(newCountry.id);
			});

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
						a: troops(military.a),
						cell: military.cell,
						x: military.x,
						y: military.y,
						bx: military.bx,
						by: military.by,
						u: Object.fromEntries(Object.entries(military.u).map(([name, amount]) => [name, troops(amount)])),
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
			newCountry.political.diplomacy = [];
			if (country.i === 0) {
				newCountry.political.diplomacy = [];
			} else {
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
				if ((country.coa as unknown as { custom: boolean }).custom !== true) {
					const coa = newCountry.coa;
					try {
						// Keep requests sequential to avoid flooding the coat-of-arms service.
						// react-doctor-disable-next-line react-doctor/async-await-in-loop
						const genCoa = generate();
						const svg =
							typeof coa === "object" &&
							coa !== null &&
							Object.keys(coa).length > 0
								? await getCOA(String(country.i), coa ?? {}, data.settings.options.customIcons)
								: await getCOA(String(country.i), genCoa, data.settings.options.customIcons);
						newCountry.coaSVG = svg;
					} catch (error) {
						console.error(
							`Error fetching the coat of arms for ${country.name}:`,
							error,
						);
					}
				} else {
					if (!customEmblems) {
						const svgDocument = new DOMParser().parseFromString(mapSVG, "image/svg+xml");
						if (svgDocument.querySelector("parsererror")) {
							throw new Error("Error: could not parse map SVG for custom country coats of arms.");
						}
						customEmblems = svgDocument.querySelector('g[id="defs-emblems"]');
						if (!customEmblems) {
							throw new Error('Error: could not find <g id="defs-emblems">');
						}
					}
					// Select the complete emblem, including any nested groups or SVG elements.
					const stateCOA = customEmblems.querySelector(
						`svg[id="stateCOA${country.i}"]`,
					);
					if (!stateCOA) {
						throw new Error(
							`Error: could not find <svg id="stateCOA${country.i}" in mapSVG`,
						);
					}
					newCountry.coaSVG = new XMLSerializer().serializeToString(stateCOA);
				}
			} else if (!country.coa) {
				try {
					const genCoa = generate();
					// Keep requests sequential to avoid flooding the coat-of-arms service.
					// react-doctor-disable-next-line react-doctor/async-await-in-loop
					const svg = await getCOA(String(country.i), genCoa, data.settings.options.customIcons);

					newCountry.coaSVG = svg;
				} catch (error) {
					console.error(
						`Error fetching the coat of arms for ${country.name}:`,
						error,
					);
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

			if (country.i !== 0) newCountry.tags.push({
				_id: "0192be16-c07d-74ab-966e-5a5a5f43c2ff",
				Default: true,
				Description:
					"A distinct and sovereign nation within the world, often with defined borders.",
				Name: "Country",
				Type: "Locations",
			});
			newCountry.type = country.i === 0 ? "Neutral group" : country.type;

			newCountry.content = countryAdapter.createDefaultContent(newCountry);

			tempMap.countries.push(newCountry);
		}
	}

	return tempMap.countries;
};

// Terra-Logger keeps troop counts; AFMG 1.157 changed its saved values to population points.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/8cc7f8e4a00fa4b2fab5a29d619b310cfcd60272/src/model/political/military-generator.ts
function militaryTroopConverter(version: string, scale: number): (value: number) => number {
  const [major, minor] = version.split(".").map(Number);
  const points = major > 1 || (major === 1 && minor >= 157);
  if (points && (!Number.isFinite(scale) || scale <= 0)) throw new Error("Military population scale must be positive.");
  return (value) => {
    if (!Number.isFinite(value) || value < 0) throw new Error("Military strength and composition must contain non-negative numbers.");
    const count = points ? Math.ceil(Math.round(value * scale * 1000) / 1000) : value;
    if (!Number.isFinite(count) || count > Number.MAX_SAFE_INTEGER) throw new Error("Military troop count exceeds the supported range.");
    return count;
  };
}
