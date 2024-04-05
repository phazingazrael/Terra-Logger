/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
import { nanoid } from 'nanoid';

const mutateData = (data: MapInfo) => {
  // check to make sure data.settings exists
  if (!data.settings) throw new Error('MapInfo.settings does not exist');

  const { populationRate, urbanization } = data.settings;

  // Mutate Map Data to Terra-Logger Format //

  const createTerraLoggerMap = (): TLMapInfo => ({
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

  const createEmptyCountry = (): TLCountry => ({
    _id: nanoid(),
    cities: [],
    coa: {
      t1: '',
      division: {
        division: '',
        t: '',
        line: '',
      },
      charges: [
        {
          charge: '',
          t: '',
          p: '',
          size: 0,
        },
      ],
      shield: '',
    },
    color: '',
    culture: {
      origin: '',
      description: '',
      _id: '',
    },
    description: '',
    economy: {
      description: '',
      exports: [],
      imports: [],
    },
    history: {
      details: '',
      events: [],
    },
    id: 0,
    location: '',
    languages: [],
    name: '',
    nameFull: '',
    political: {
      diplomacy: [],
      form: '',
      formName: '',
      leaders: [],
      military: [],
      neighbors: {
        name: '',
        id: 0,
        _id: '',
      },
      ruler: [],
    },
    population: {
      total: '',
      rural: '',
      urban: '',
    },
    tags: [],
    type: [],
    warCampaigns: [],
  });
  const createEmptyCulture = (): TLCulture => ({
    urbanPop: '',
    ruralPop: '',
    tags: [],
    name: '',
    base: 0,
    shield: '',
    id: 0,
    color: '',
    type: '',
    expansionism: 0,
    origins: [],
    code: '',
    _id: '',
  });

  const createEmptyCity = (): TLCity => ({
    _id: nanoid(),
    capital: false,
    coa: {
      t1: '',
      division: {
        division: '',
        t: '',
        line: '',
      },
      charges: [
        {
          charge: '',
          t: '',
          p: '',
          size: 0,
        },
      ],
      shield: '',
    },
    country: {
      _id: '',
      govForm: '',
      govName: '',
      id: 0,
      name: '',
      nameFull: '',
    },
    culture: {
      origin: '',
      description: '',
      _id: '',
    },
    features: [],
    id: 0,
    mapLink: '',
    name: '',
    population: '',
    size: '',
    tags: [],
    type: '',
    description: '',
  });
  const terraLoggerMap: TLMapInfo = createTerraLoggerMap();
  const tempMap: TLMapInfo = createTerraLoggerMap();

  // begin mutating data //
  // log terraLoggerMap to console
  console.log('defaultMap', terraLoggerMap);
  // add map info that doesn't need mutating.
  terraLoggerMap.info = data.info;
  terraLoggerMap.settings = data.settings;
  terraLoggerMap.SVG = data.SVG;

  // mutate cultures
  data.cultures.forEach((culture) => {
    // define new culture object
    const newCulture: TLCulture = createEmptyCulture();

    // define urban and rural population values
    const urbanValue = Math.round(
      culture.urban * Number(populationRate) * Number(urbanization),
    ).toLocaleString('en-US');

    const ruralValue = Math.round(
      culture.rural * Number(populationRate) * Number(urbanization),
    ).toLocaleString('en-US');

    // add culture data to new culture object
    newCulture.base = culture.base;
    newCulture.code = culture.code;
    newCulture.color = culture.color ?? '';
    newCulture.expansionism = culture.expansionism;
    newCulture.id = culture.i;
    newCulture.name = culture.name;
    newCulture.origins = culture.origins;
    newCulture.ruralPop = ruralValue;
    newCulture.shield = culture.shield;
    newCulture.type = culture.type;
    newCulture.tags = [
      {
        _id: '3za6JbQcWqraNj0guhnqk',
        Default: true,
        Description:
          "The customs, arts, social institutions, and achievements of the world's inhabitants.",
        Name: 'Culture',
        Type: 'WorldOverview',
      },
    ];
    newCulture.urbanPop = urbanValue;

    tempMap.cultures.push(newCulture);
  });

  // mutate cities
  data.cities.forEach((city) => {
    // console.log(city);
    // define new city object
    const newCity: TLCity = createEmptyCity();

    // define urban and rural population values
    const popValue = Math.round(
      city.population * Number(populationRate) * Number(urbanization),
    ).toLocaleString('en-US');

    // add city data to new city object
    newCity._id = nanoid();
    newCity.capital = !!city.capital;
    // newCity.cell = city.cell; unused?
    // newCity.citadel boolean, if true push tag
    newCity.coa = city.coa;
    newCity.country = {
      _id: '',
      govForm: '',
      govName: '',
      id: 0,
      name: '',
      nameFull: '',
    };
    newCity.culture = {
      // map over id to find culture information.
      origin: '',
      description: '',
      _id: '',
    };
    newCity.description = '';
    newCity.features = [];
    newCity.id = city.i;
    newCity.mapLink = '';
    newCity.name = city.name;
    // newCity.plaza boolean, if true push tag
    newCity.population = popValue;
    // newCity.port boolean, if true push
    // newCity.shanty boolean, if true push tag
    newCity.size = ''; // population based
    newCity.tags = [];
    newCity.type = '';

    // console.log(newCity)
  });

  // mutate countries
  data.countries.forEach((country) => {
    // console.log(country);
    // define new country object
    const newCountry: TLCountry = createEmptyCountry();

    console.log(newCountry);
    // define urban and rural population values
  });

  console.log(tempMap);
  console.log(data);
  return data;
};

export default mutateData;
