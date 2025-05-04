// Modified from the following page and lines.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/io/load.js

import Delaunator from "delaunator";

// @ts-ignore
import * as VoronoiModule from "../Util/voronoi.js";
const Voronoi = VoronoiModule.Voronoi;

import NameBases from "./NameBases.json";

function getTypedArray(maxValue: number | bigint) {
	const UINT8_MAX = 255;
	const UINT16_MAX = 65535;
	const UINT32_MAX = 4294967295;
	console.assert(
		Number.isInteger(maxValue) && maxValue >= 0 && maxValue <= UINT32_MAX,
		`Array maxValue must be an integer between 0 and ${UINT32_MAX}, got ${maxValue}`,
	);

	if (maxValue <= UINT8_MAX) return Uint8Array;
	if (maxValue <= UINT16_MAX) return Uint16Array;
	if (maxValue <= UINT32_MAX) return Uint32Array;
	return Uint32Array;
}

function createTypedArray({
	maxValue,
	length,
	from,
}: { maxValue: number; length: number; from?: number[] }) {
	const typedArray = getTypedArray(maxValue);
	if (!from) return new typedArray(length);
	return typedArray.from(from);
}

function calculateVoronoi(points: number[], boundary: number[]) {
	const allPoints = points.concat(boundary);
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const delaunay = Delaunator.from(allPoints as any);

	const voronoi = new Voronoi(delaunay, allPoints, points.length);

	const cells = voronoi.cells;
	cells.i = createTypedArray({
		maxValue: points.length,
		length: points.length,
	}).map((_, i) => i); // array of indexes
	const vertices = voronoi.vertices;

	return { cells, vertices };
}

export const parseLoadedResult = (
	result: ArrayBuffer,
): [mapFile: string[], mapVersion: number] => {
	const resultAsString = new TextDecoder().decode(result);
	const isDelimited = resultAsString.substring(0, 10).includes("|");
	const decoded = isDelimited
		? resultAsString
		: decodeURIComponent(atob(resultAsString));

	const mapFile = decoded.split("\r\n");
	// biome-ignore lint/style/useConst: <explanation>
	let mapVersion =
		Number.parseFloat(mapFile[0].split("|")[0] || mapFile[0]) ?? 0;

	return [mapFile, mapVersion];
};

export const parseLoadedData = (data: string[]) => {
	interface SettingsOpts {
		pinNotes: boolean;
		winds: number[];
		temperatureEquator: number;
		temperatureNorthPole: number;
		temperatureSouthPole: number;
		stateLabelsMode: string;
		year: number;
		era: string;
		eraShort: string;
		military: {
			icon: string;
			name: string;
			rural: number;
			urban: number;
			crew: number;
			power: number;
			type: string;
			separate: number;
		}[];
	}

	interface GridData {
		points?: number[];
		boundary?: number[];
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		cells?: any;
		vertices?: number[];
		cellsDesired?: number;
		cellsX?: number;
		cellsY?: number;
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		features?: any[];
		spacing?: number;
	}
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

	let Grid: GridData = {
		points: [],
		boundary: [],
		cellsDesired: 0,
		cellsX: 0,
		cellsY: 0,
		spacing: 0,
	};
	// biome-ignore lint/style/useConst: <explanation>
	let Pack = {
		features: [],
		cultures: [],
		states: [],
		burgs: [],
		religions: [],
		provinces: [],
		rivers: [],
		markers: [],
		routes: [],
		zones: [],
		cells: {
			biome: [],
			burg: [],
			conf: [],
			culture: [],
			fl: [],
			pop: [],
			r: [],
			s: [],
			state: [],
			religion: [],
			province: [],
			routes: [],
		},
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

	// latLongs ("coords")
	// data[2]

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
		Notes = JSON.parse(data[4]) as Note[];
	}

	// data[5] is called last to ensure less processing time

	// "gridGeneral"
	if (data[6]) {
		Grid = JSON.parse(data[6]) as GridData;
		const { cells, vertices } = calculateVoronoi(
			JSON.parse(data[6]).points,
			JSON.parse(data[6]).boundary,
		);
		Grid.cells = cells;
		Grid.vertices = vertices;
		Grid.cells.h = Uint8Array.from(data[7].split(","));
		Grid.cells.prec = Uint8Array.from(data[8].split(","));
		Grid.cells.f = Uint16Array.from(data[9].split(","));
		Grid.cells.t = Int8Array.from(data[10].split(","));
		Grid.cells.temp = Int8Array.from(data[11].split(","));
	}

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

	// Deprecated || pack.cells.road
	// data[23]

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

	// Deprecated || pack.cells.crossroad
	// data[28]

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

	// rulersString
	// data[33]

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

	// "Serialized SVG"
	// data[5]
	let SVG = "";
	if (data[5]) {
		// svg stuff, do this last
		const svgString = data[5];

		// Parse the SVG string
		const parser = new DOMParser();
		const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
		const svgElement = svgDoc.documentElement;

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

	return parsedMap;
};
