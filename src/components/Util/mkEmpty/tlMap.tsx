export const createTerraLoggerMap = (): TLMapInfo => ({
  cities: [],
  countries: [],
  cultures: [],
  info: {
    name: '',
    seed: '',
    width: 0,
    height: 0,
    ID: '',
  },
  nameBases: [],
  notes: [],
  npcs: [],
  religions: [],
  settings: {
    mapName: '',
    distanceUnit: '',
    distanceScale: '',
    areaUnit: '',
    heightUnit: '',
    heightExponent: '',
    temperatureScale: '',
    barSize: '',
    barLabel: '',
    barBackOpacity: '',
    barPosX: '',
    barPosY: '',
    populationRate: 0,
    urbanization: '',
    mapSize: '',
    latitude0: '',
    prec: '',
    options: {
      pinNotes: false,
      winds: [],
      temperatureEquator: 0,
      temperatureNorthPole: 0,
      temperatureSouthPole: 0,
      stateLabelsMode: '',
      year: 0,
      era: '',
      eraShort: '',
      militaryTypes: [],
    },
    hideLabels: 0,
    stylePreset: '',
    rescaleLabels: 0,
    urbanDensity: 0,
  },
  SVG: '',
  svgMod: '',
});