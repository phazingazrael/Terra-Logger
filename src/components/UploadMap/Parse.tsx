export const parseLoadedResult = (result: ArrayBuffer): [mapFile: string[], mapVersion: number] => {
  const resultAsString = new TextDecoder().decode(result);
  const isDelimited = resultAsString.substring(0, 10).includes('|');
  const decoded = isDelimited ? resultAsString : decodeURIComponent(atob(resultAsString));

  const mapFile = decoded.split('\r\n');
  let mapVersion = parseFloat(mapFile[0].split('|')[0] || mapFile[0]);
  if (mapVersion === null) {
    mapVersion = 0;
  }
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
  // Parse Map Parameters //
  const params = data[0].split('|');
  const settings = data[1].split('|');

  const SetOpt = JSON.parse(settings[19]) as SettingsOpts;

  const Notes = JSON.parse(data[4]) as Note[];

  const Cultures = JSON.parse(data[13]) as Culture[];
  const Countries = JSON.parse(data[14]) as Country[];
  const Cities = JSON.parse(data[15]) as City[];
  const Religions = JSON.parse(data[29]) as Religion[];

  const nameBases = [] as NameBase[];

  if (data[31]) {
    const namesDL = data[31].split('/');
    namesDL.forEach((d, i) => {
      const e = d.split('|');
      if (!e.length) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const b = e[5].split(',').length > 2 || !nameBases[i] ? e[5] : nameBases[i].b;
      nameBases[i] = { name: e[0], min: e[1], max: e[2], d: e[3], m: e[4], b };
    });
  }

  let SVG = '';
  // svg stuff, do this last
  if (data[5]) {
    const svgString = data[5];

    // Parse the SVG string
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
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
      npcs: [{ name: 'test' }],
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
        populationRate: settings[12],
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
      svgMod: '',
    };
  };

  const parsedMap: MapInfo = createParsedMap();

  return parsedMap;
};
