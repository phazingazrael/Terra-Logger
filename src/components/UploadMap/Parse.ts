// Modified from the following page.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/io/load.js

import NameBases from "./json/NameBases.json";
import svgDefs from "./json/svgDefs.json";
import b64Imgs from "./json/b64Img.json";

import {
	setAllMarkerTextsToPercent,
	ensureDefsHasBatch,
	inlinePatternImages,
} from "./util";

import type { SettingsOpts } from "../../definitions/TerraLogger";

export const parseLoadedResult = (
	result: ArrayBuffer,
): [mapFile: string[], mapVersion: number, versionString: string] => {
	const resultAsString = new TextDecoder().decode(result);
	const isDelimited = resultAsString.substring(0, 10).includes("|");
	const decoded = isDelimited
		? resultAsString
		: decodeURIComponent(atob(resultAsString));

	const mapFile = decoded.split("\r\n");
	const versionparts = mapFile[0].split("|")[0].split(".").map(Number);
	let mapVersion = `${versionparts[0]}${versionparts[1]}${versionparts[2]}`;
	const patchVersion =
		versionparts[2] > 9 ? versionparts[2] : `0${versionparts[2]}`;
	const versionString = JSON.stringify(
		`${versionparts[0]}.${versionparts[1]}.${patchVersion}`,
	);
	mapVersion = `${versionparts[0]}${versionparts[1]}${patchVersion}`;

	const MapVersion = mapVersion as unknown as number;

	return [mapFile, MapVersion, versionString];
};

export const parseLoadedData = (data: string[]) => {
	// Parse Map Parameters //

	let params: string[];
	let settings: string[];
	let SetOpt: SettingsOpts;
	let Notes: Note[];
	let Cultures: Culture[];
	let Countries: Country[];
	let Cities: City[];
	let Religions: Religion[];
	// biome-ignore lint/style/useConst: <explanation>
	let nameBases: NameBase[];

	let biomes: string[];

	// biome-ignore lint/style/useConst: <explanation>
	let Pack = {
		burgs: [], // Burgs (settlements) data is stored as an array of objects with strict element order. Element 0 is an empty object.
		cells: {
			area: [], // number[] - cells area in pixels. Uint16Array
			b: [], // number[] - indicator whether the cell borders the map edge, 1 if true, 0 if false. Integers, not Boolean
			biome: [], // number[] - cells biome index. Uint8Array
			burg: [], // number[] - cells burg index. Uint16Array
			c: [], // number[][] - indexes of cells adjacent to each cell (neighboring cells)
			conf: [], // number[] - cells flux amount in confluences. Confluences are cells where rivers meet each other. Uint16Array
			culture: [], // number[] - cells culture index. Uint16Array
			f: [], // number[] - indexes of feature. Uint16Array or Uint32Array (depending on cells number)
			fl: [], // number[] - cells flux amount. Defines how much water flow through the cell. Use to get rivers data and score cells. Uint16Array
			g: [], // number[] - indexes of a source cell in grid. Uint16Array or Uint32Array. The only way to find correct grid cell parent for pack cells
			h: [], // number[] - cells elevation in [0, 100] range, where 20 is the minimal land elevation. Uint8Array
			harbor: [], // number[] - cells harbor score. Shows how many water cells are adjacent to the cell. Used for scoring. Uint8Array
			haven: [], // number[] - cells haven cells index. Each coastal cell has haven cells defined for correct routes building. Uint16Array or Uint32Array (depending on cells number)
			i: [], // number[] - cell indexes Uint16Array or Uint32Array (depending on cells number)
			p: [], // number[][] - cells coordinates [x, y] after repacking. Numbers rounded to 2 decimals
			pop: [], // number[] - cells population in population points (1 point = 1000 people by default). Float32Array, not rounded to not lose population of high population rate
			province: [], // number[] - cells province index. Uint16Array
			q: {}, // object - quadtree used for fast closest cell detection
			r: [], // number[] - cells river index. Uint16Array
			religion: [], // number[] - cells religion index. Uint16Array
			routes: {}, //object - cells connections via routes. E.g. pack.cells.routes[8] = {9: 306, 10: 306} shows that cell 8 has two route connections - with cell 9 via route 306 and with cell 10 by route 306
			s: [], // number[] - cells score. Scoring is used to define best cells to place a burg. Uint16Array
			state: [], // number[] - cells state index. Uint16Array
			t: [], // number[] - distance field. 1, 2, ... - land cells, -1, -2, ... - water cells, 0 - unmarked cell. Uint8Array
			v: [], // number[][] - indexes of vertices of each cell
		},
		cultures: [], // Cultures (races, language zones) data is stored as an array of objects with strict element order. Element 0 is reserved by the wildlands culture.
		features: [], // object[] - array containing objects for all enclosed entities of repacked graph: islands, lakes and oceans. Note: element 0 has no data. Stored in .map file.
		markers: [], // Markers data is stored as an unordered array of objects.
		provinces: [], // Provinces data is stored as an array of objects with strict element order. Element 0 is not used.
		religions: [], // Religions data is stored as an array of objects with strict element order. Element 0 is reserved for "No religion".
		rivers: [], // Rivers data is stored as an unordered array of objects.
		routes: [], // Routes data is stored as an unordered array of objects.
		states: [], // States (countries) data is stored as an array of objects with strict element order. Element 0 is reserved for neutrals
		zones: [], // Zones data is stored as an array of objects with i not necessary equal to the element index, but order of element defines the rendering order and is important.
	};

	// params
	if (data[0]) {
		params = data[0].split("|");
	}

	// settings
	if (data[1]) {
		settings = data[1].split("|");
		SetOpt = JSON.parse(settings[19]) as SettingsOpts;
	}

	// biomes
	if (data[3]) {
		biomes = data[3].split("|");
		const biomesData = {
			names: [
				"Marine",
				"Hot desert",
				"Cold desert",
				"Savanna",
				"Grassland",
				"Tropical seasonal forest",
				"Temperate deciduous forest",
				"Tropical rainforest",
				"Temperate rainforest",
				"Taiga",
				"Tundra",
				"Glacier",
				"Wetland",
			],
			color: [
				"#466eab",
				"#fbe79f",
				"#b5b887",
				"#d2d082",
				"#c8d68f",
				"#b6d95d",
				"#29bc56",
				"#7dcb35",
				"#409c43",
				"#4b6b32",
				"#96784b",
				"#d5e7eb",
				"#0b9131",
			],
			habitability: [0, 4, 10, 22, 30, 50, 100, 80, 90, 12, 4, 0, 12],
			iconsDensity: [0, 3, 2, 120, 120, 120, 120, 150, 150, 100, 5, 0, 250],
			icons: [
				{},
				{ dune: 3, cactus: 6, deadTree: 1 },
				{ dune: 9, deadTree: 1 },
				{ acacia: 1, grass: 9 },
				{ grass: 1 },
				{ acacia: 8, palm: 1 },
				{ deciduous: 1 },
				{ acacia: 5, palm: 3, deciduous: 1, swamp: 1 },
				{ deciduous: 6, swamp: 1 },
				{ conifer: 1 },
				{ grass: 1 },
				{},
				{ swamp: 1 },
			],
			cost: [10, 200, 150, 60, 50, 70, 70, 80, 90, 200, 1000, 5000, 150], // biome movement cost
			biomesMartix: [
				// hot ↔ cold [>19°C; <-4°C]; dry ↕ wet
				new Uint8Array([
					1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
					2, 2, 10,
				]),
				new Uint8Array([
					3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 9, 9, 9, 9,
					10, 10, 10,
				]),
				new Uint8Array([
					5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 9, 9, 9, 9, 9,
					10, 10, 10,
				]),
				new Uint8Array([
					5, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9,
					10, 10, 10,
				]),
				new Uint8Array([
					7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9,
					9, 10, 10,
				]),
			],
		};
		biomesData.color = biomes[0].split(",");
		biomesData.habitability = biomes[1].split(",").map((h) => +h);
		biomesData.names = biomes[2].split(",");
	}

	// notes
	if (data[4]) {
		const tempNotes: Note[] = JSON.parse(data[4]);
		Notes = tempNotes.filter((note) => note.legend !== "");
	}

	// data[5] is called last to ensure less processing time

	// packFeatures
	if (data[12]) {
		Pack.features = JSON.parse(data[12]);
	}

	// Cultures
	if (data[13]) {
		Cultures = JSON.parse(data[13]) as Culture[];
		Pack.cultures = JSON.parse(data[13]);
	}

	// Countries
	if (data[14]) {
		Countries = JSON.parse(data[14]) as Country[];
		Pack.states = JSON.parse(data[14]);
	}

	// Cities
	if (data[15]) {
		Cities = JSON.parse(data[15]) as City[];
		Pack.burgs = JSON.parse(data[15]);
	}

	// pack.cells.biome
	if (data[16]) {
		(Pack.cells.biome as unknown as Uint8Array) = Uint8Array.from(
			data[16].split(","),
		);
	}

	// pack.cells.burg
	if (data[17]) {
		(Pack.cells.burg as unknown as Uint16Array) = Uint16Array.from(
			data[17].split(","),
		);
	}

	// pack.cells.conf
	if (data[18]) {
		(Pack.cells.conf as unknown as Uint8Array) = Uint8Array.from(
			data[18].split(","),
		);
	}

	// pack.cells.culture
	if (data[19]) {
		(Pack.cells.culture as unknown as Uint16Array) = Uint16Array.from(
			data[19].split(","),
		);
	}

	// pack.cells.fl
	if (data[20]) {
		(Pack.cells.fl as unknown as Uint16Array) = Uint16Array.from(
			data[20].split(","),
		);
	}

	// pop
	if (data[21]) {
		(Pack.cells.pop as unknown as Float32Array) = Float32Array.from(
			data[21].split(","),
		);
	}

	// pack.cells.r
	if (data[22]) {
		(Pack.cells.r as unknown as Uint16Array) = Uint16Array.from(
			data[22].split(","),
		);
	}

	// pack.cells.s
	if (data[24]) {
		(Pack.cells.s as unknown as Uint16Array) = Uint16Array.from(
			data[24].split(","),
		);
	}

	// pack.cells.state
	if (data[25]) {
		(Pack.cells.state as unknown as Uint16Array) = Uint16Array.from(
			data[25].split(","),
		);
	}

	// pack.cells.religion
	if (data[26]) {
		(Pack.cells.religion as unknown as Uint16Array) = Uint16Array.from(
			data[26].split(","),
		);
	}

	// pack.cells.province
	if (data[27]) {
		(Pack.cells.province as unknown as Uint16Array) = Uint16Array.from(
			data[27].split(","),
		);
	}

	// religions
	if (data[29]) {
		Religions = JSON.parse(data[29]) as Religion[];
		Pack.religions = JSON.parse(data[29]);
	}

	// provinces
	if (data[30]) {
		Pack.provinces = JSON.parse(data[30]);
	}

	// nameBases ("namesData")
	nameBases = [...NameBases] as NameBase[];
	if (data[31]) {
		const names = data[31].split("/");
		names.forEach((d, i) => {
			const e = d.split("|");
			if (!e.length) return;
			const b =
				e[5].split(",").length > 2 || !nameBases[i] ? e[5] : nameBases[i].b;
			nameBases[i] = {
				b: b,
				d: e[3],
				i: e[6] as unknown as number,
				m: e[4] as unknown as number,
				max: e[2] as unknown as number,
				name: e[0],
				min: e[1] as unknown as number,
			};
		});
	}

	// rivers
	if (data[32]) {
		Pack.rivers = JSON.parse(data[32]);
	}

	// fonts
	// data[34]

	// markers
	if (data[35]) {
		Pack.markers = JSON.parse(data[35]);
	}

	// cellRoutes
	if (data[36]) {
		Pack.cells.routes = JSON.parse(data[36]);
	}

	// routes
	if (data[37]) {
		Pack.routes = JSON.parse(data[37]);
	}

	// zones
	if (data[38]) {
		Pack.zones = JSON.parse(data[38]);
	}

	// "Serialized SVG", do this last
	// data[5]
	let SVG = "";
	if (data[5]) {
		const svgString = data[5];

		// Parse the SVG string
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
		const svgElement = svgDoc.documentElement;

		setAllMarkerTextsToPercent(
			svgElement as unknown as SVGSVGElement,
			25,
			62.5,
		);

		// Insert SVG Defs for each of the following ids:
		// - end-arrow
		// - end-arrow-small
		// - icon-store
		// - icon-anchor
		// - icon-route
		// - defs-relief
		// - defs-compass-rose
		// - gridPatterns
		// - defs-hatching

		ensureDefsHasBatch(svgElement as unknown as SVGSVGElement, svgDefs);

		// Replace <image> hrefs inside <pattern id="oceanic"> with provided base64 payloads
		inlinePatternImages(svgElement as unknown as SVGSVGElement, b64Imgs);

		// Replace the original SVG string with the modified one
		SVG = new XMLSerializer().serializeToString(svgElement);
	}

	// define parsed map here.
	const createParsedMap = (): MapInfo => {
		return {
			cities: Cities,
			countries: Countries,
			cultures: Cultures,
			info: {
				name: settings[20],
				seed: params[3],
				width: +params[4],
				height: +params[5],
				ID: params[6],
			},
			nameBases: nameBases,
			notes: Notes,
			npcs: [],
			params: params,
			religions: Religions,
			settings: {
				mapName: settings[20],
				distanceUnit: settings[0],
				distanceScale: settings[1],
				areaUnit: settings[2],
				heightUnit: settings[3],
				heightExponent: settings[4],
				temperatureScale: settings[5],
				barSize: settings[6],
				barLabel: settings[7],
				barBackOpacity: settings[8],
				barPosX: settings[10],
				barPosY: settings[11],
				populationRate: Number.parseInt(settings[12]),
				urbanization: settings[13],
				mapSize: settings[14],
				latitude0: settings[15],
				prec: settings[18],
				options: {
					pinNotes: SetOpt.pinNotes,
					winds: SetOpt.winds,
					temperatureEquator: SetOpt.temperatureEquator,
					temperatureNorthPole: SetOpt.temperatureNorthPole,
					temperatureSouthPole: SetOpt.temperatureSouthPole,
					stateLabelsMode: SetOpt.stateLabelsMode,
					year: SetOpt.year,
					era: SetOpt.era,
					eraShort: SetOpt.eraShort,
					militaryTypes: SetOpt.military as MilitaryType[],
				},
				hideLabels: +settings[21],
				stylePreset: settings[22],
				rescaleLabels: +settings[23],
				urbanDensity: +settings[24],
			},
			SVG: SVG,
			svgMod: "",
		};
	};

	const parsedMap: MapInfo = createParsedMap();

	return { parsedMap, Pack };
};
// Unused data sections
// latLongs ("coords")
// data[2]
// grid.cells.h
// data[7]
// grid.cells.prec
// data[8]
// grid.cells.f
// data[9]
// grid.cells.t
// data[10]
// grid.cells.temp
// data[11]
// Deprecated || pack.cells.road
// data[23]
// Deprecated || pack.cells.crossroad
// data[28]
// rulersString
// data[33]
