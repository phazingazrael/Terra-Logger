import { City, Country, Culture, Note, Option, Religion } from './Interfaces';

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
  // Parse Map Parameters //
  const params = data[0].split('|');

  let seed;
  if (params[3]) {
    seed = params[3];
  }
  let graphWidth, graphHeight;

  if (params[4]) graphWidth = +params[4];
  if (params[5]) graphHeight = +params[5];
  const mapId = params[6];

  // Parse Map Settings //
  const settings = data[1].split('|');

  let mapName,
    distanceUnit,
    distanceScale,
    areaUnit,
    heightUnit,
    heightExponent,
    temperatureScale,
    barSize,
    barLabel,
    barBackOpacity,
    barBackColor,
    barPosX,
    barPosY,
    populationRate,
    urbanization,
    mapSize,
    latitude0,
    prec,
    hideLabels,
    stylePreset,
    rescaleLabels,
    urbanDensity;

  let MapOptions: Option;

  if (settings[0]) distanceUnit = settings[0];
  if (settings[1]) distanceScale = settings[1];
  if (settings[2]) areaUnit = settings[2];
  if (settings[3]) heightUnit = settings[3];
  if (settings[4]) heightExponent = settings[4];
  if (settings[5]) temperatureScale = settings[5];
  if (settings[6]) barSize = settings[6];
  if (settings[7] !== undefined) barLabel = settings[7];
  if (settings[8] !== undefined) barBackOpacity = settings[8];
  if (settings[9]) barBackColor = settings[9];
  if (settings[10]) barPosX = settings[10];
  if (settings[11]) barPosY = settings[11];
  if (settings[12]) populationRate = settings[12];
  if (settings[13]) urbanization = settings[13];
  if (settings[14]) mapSize = settings[14];
  if (settings[15]) latitude0 = settings[15];

  if (settings[18]) prec = settings[18];
  if (settings[19]) {
    MapOptions = JSON.parse(settings[19]) as Option;
    // setting 16 and 17 (temperature) are part of options now, kept as "" in newer versions for compatibility
    // setting 16 and 17 (temperature) are part of options now, kept as "" in newer versions for compatibility
    if (settings[16]) MapOptions.temperatureEquator = +settings[16];
    if (settings[17]) MapOptions.temperatureNorthPole = MapOptions.temperatureSouthPole = +settings[17];
  }
  if (settings[20]) mapName = settings[20];
  if (settings[21]) hideLabels = +settings[21];
  if (settings[22]) stylePreset = settings[22];
  if (settings[23]) rescaleLabels = +settings[23];
  if (settings[24]) urbanDensity = +settings[24];

  // Parse Map Notes
  let notes;
  if (data[4]) notes = JSON.parse(data[4]) as Note[];

  let cultures, countries, cities, religions;
  if (data[13]) cultures = JSON.parse(data[13]) as Culture[];
  if (data[14]) countries = JSON.parse(data[14]) as Country[];
  if (data[15]) cities = JSON.parse(data[15]) as City[];
  if (data[29]) religions = JSON.parse(data[29]) as Religion[];


  const nameBases: { name: string; min: string; max: string; d: string; m: string; b: string }[] =
    [];

  if (data[31]) {
    const namesDL = data[31].split('/');
    namesDL.forEach((d, i) => {
      const e = d.split('|');
      if (!e.length) return;
      const b = e[5].split(',').length > 2 || !nameBases[i] ? e[5] : nameBases[i].b;
      nameBases[i] = { name: e[0], min: e[1], max: e[2], d: e[3], m: e[4], b };
    });
    console.log(JSON.stringify(nameBases));
  }
  let SVG;
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

  const parsed = {
    mapObject: {
      info: {
        seed: seed,
        width: graphWidth,
        height: graphHeight,
        ID: mapId,
        name: mapName
      },
      Settings: {
        mapName: mapName,
        distanceScale: distanceScale,
        distanceUnit: distanceUnit,
        areaUnit: areaUnit,
        heightUnit: heightUnit,
        heightExponent: heightExponent,
        temperatureScale: temperatureScale,
        barSize: barSize,
        barLabel: barLabel,
        barBackColor: barBackColor,
        barBackOpacity: barBackOpacity,
        barPosX: barPosX,
        barPosY: barPosY,
        populationRate: populationRate,
        urbanization: urbanization,
        mapSize: mapSize,
        latitude0: latitude0,
        prec: prec,
        options: MapOptions,
        hideLabels: hideLabels,
        stylePreset: stylePreset,
        rescaleLabels: rescaleLabels,
        urbanDensity: urbanDensity
      },
      notes: notes,
      cultures: cultures,
      countries: countries,
      cities: cities,
      religions: religions,
      nameBases: nameBases,
      SVG: SVG
    },
    params: params
  };
  localStorage.setItem('map', JSON.stringify(parsed));
  return parsed;
};
