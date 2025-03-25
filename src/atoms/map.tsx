import { atom } from "jotai";

const createEmptyMap = (): MapInf => {
	return {
		id: "",
		info: {
			name: "",
			seed: "",
			width: 0,
			height: 0,
			ID: "",
		},
		mapId: "",
		settings: {
			mapName: "",
			distanceUnit: "",
			distanceScale: "",
			areaUnit: "",
			heightUnit: "",
			heightExponent: "",
			temperatureScale: "",
			barSize: "",
			barLabel: "",
			barBackOpacity: "",
			barPosX: "",
			barPosY: "",
			populationRate: 0,
			urbanization: "",
			mapSize: "",
			latitude0: "",
			prec: "",
			options: {
				pinNotes: false,
				winds: [],
				temperatureEquator: 0,
				temperatureNorthPole: 0,
				temperatureSouthPole: 0,
				stateLabelsMode: "",
				year: 0,
				era: "",
				eraShort: "",
				militaryTypes: [
					{
						icon: "",
						name: "",
						rural: 0,
						urban: 0,
						crew: 0,
						power: 0,
						type: "",
						separate: 0,
					},
				],
			},
			hideLabels: 0,
			stylePreset: "",
			rescaleLabels: 0,
			urbanDensity: 0,
		},
		SVG: "",
		svgMod: "",
	};
};

const mapData: MapInf = createEmptyMap();
const mapAtom = atom(mapData);

export default mapAtom;
