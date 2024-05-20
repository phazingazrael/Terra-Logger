// Modified from the following page and lines.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/io/load.js#L149-L167
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

  let params: string[],
    settings: string[],
    SetOpt: SettingsOpts,
    Notes: Note[],
    Cultures: Culture[],
    Countries: Country[],
    Cities: City[],
    Religions: Religion[],
    nameBases: NameBase[],
    Pack: object[];

  if (data[5]) {
    // Find the starting and ending indices of the SVG code
    const startIndex = data.findIndex((item) => item.startsWith('<svg'));
    const endIndex = data.findIndex((item) => item.endsWith('</svg>'));

    // Merge the SVG code into data[5]
    data[5] = data.slice(startIndex, endIndex + 1).join('');
    data.splice(6, endIndex + 1);
  }

  // data.forEach((d, i) => {
  //   console.log("Line "+i+": "+d)
  // });

  if (data[0]) {
    //console.log(data[0]);
    params = data[0].split('|');
  }

  if (data[1]) {
    //console.log(data[1]);
    settings = data[1].split('|');
    SetOpt = JSON.parse(settings[19]) as SettingsOpts;
  }

  if (data[4]) {
    //console.log(data[4]);
    Notes = JSON.parse(data[4]) as Note[];
  }

  if (data[6]) {
    //console.log(data[6]);
    Pack = JSON.parse(data[6]);
  }

  if (data[7]) {
    //console.log(data[7]);
    Cultures = JSON.parse(data[7]) as Culture[];
  }

  if (data[8]) {
    //console.log(data[8]);
    Countries = JSON.parse(data[8]) as Country[];
  }

  if (data[9]) {
    //console.log(data[9]);
    Cities = JSON.parse(data[9]) as City[];
  }

  if (data[23]) {
    //console.log(data[23]);
    Religions = JSON.parse(data[23]) as Religion[];
  }

  nameBases = [] as NameBase[];

  if (data[25]) {
    //console.log(data[25]);
    const names = data[25].split('/');
    names.forEach((d, i) => {
      const e = d.split('|');
      if (!e.length) return;
      const b = e[5].split(',').length > 2 || !nameBases[i] ? e[5] : nameBases[i].b;
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
        populationRate: parseInt(settings[12]),
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
