export const mutateData = (data: MapInfo) => {
  // Mutate Map Data to Terra-Logger Format //

  const createTerraLoggerMap = (): TLMapInfo => {
    return {
      cities: [],
      countries: [],
      cultures: [],
      info: {
        name: '',
        seed: '',
        width: 0,
        height: 0,
        ID: ''
      },
      nameBases: [],
      notes: [],
      npcs: [],
      params: [],
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
        populationRate: '',
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
          militaryTypes: []
        },
        hideLabels: 0,
        stylePreset: '',
        rescaleLabels: 0,
        urbanDensity: 0
      },
      SVG: '',
      svgMod: ''
    };
  };

  const terraLoggerMap: TLMapInfo = createTerraLoggerMap();

  // begin mutating data //

  console.log(terraLoggerMap);
  console.log(data);
  return data;
};
