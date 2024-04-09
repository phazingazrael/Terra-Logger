/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import { nanoid } from 'nanoid';

import nameBaseJSON from './NameBases.json';

const mutateData = (data: MapInfo) => {
  const { populationRate, urbanization, urbanDensity } = data.settings;

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
      name: '',
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
      neighbors: [],
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
      name: '',
      description: '',
      _id: '',
    },
    features: [],
    id: 0,
    mapLink: '',
    mapSeed: '',
    name: '',
    population: '',
    size: '',
    tags: [],
    type: '',
    description: '',
  });

  const createEmptyReligion = (): TLReligion => ({
    _id: '',
    code: '',
    culture: {
      _id: '',
      name: '',
      description: '',
    },
    deity: '',
    description: '',
    form: '',
    i: 0,
    name: '',
    origins: [],
    type: '',
  });

  const terraLoggerMap: TLMapInfo = createTerraLoggerMap();

  const tempMap: TLMapInfo = createTerraLoggerMap();

  // begin mutating data //
  // add map info that doesn't need mutating.
  tempMap.info = data.info;
  tempMap.settings = data.settings;
  tempMap.SVG = data.SVG;

  function findCultureByID(id: number) {
    return tempMap.cultures.find((culture) => culture.id === id);
  }
  // function findCountryByID(id: number) {
  //   return tempMap.countries.find((culture) => culture.id === id);
  // }
  // function findCityByID(id: number) {
  //   return tempMap.cities.find((city) => city.id === id);
  // }

  // minmax from numberUtils.js from Azgaar.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/utils/numberUtils.js#L10C1-L12C2
  function minmax(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

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
    newCulture._id = nanoid();
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
    newCulture.tags.push({
      _id: '3za6JbQcWqraNj0guhnqk',
      Default: true,
      Description:
        "The customs, arts, social institutions, and achievements of the world's inhabitants.",
      Name: 'Culture',
      Type: 'WorldOverview',
    });
    newCulture.urbanPop = urbanValue;

    tempMap.cultures.push(newCulture);
  });

  // mutate cities
  data.cities.forEach((city) => {
    // define new city object
    const newCity: TLCity = createEmptyCity();

    // add city data to new city object
    newCity._id = nanoid();
    newCity.capital = !!city.capital;
    newCity.coa = city.coa;
    newCity.country.id = city.state;
    newCity.description = '';
    newCity.id = city.i;
    newCity.mapLink = city.link;
    newCity.mapSeed = city.MFCG as unknown as string;
    newCity.name = city.name;
    newCity.population = Math.round(
      city.population * Number(populationRate) * Number(urbanization),
    ).toLocaleString('en-US');
    newCity.size = ''; // population based
    newCity.tags.push({
      _id: '1IZunX27kOFP-ff4kpeLQ',
      Default: true,
      Description: 'A large and permanent human settlement within the world.',
      Name: 'City',
      Type: 'Locations',
    });
    newCity.type = city.type;

    // size & sizeRaw from editors.js from Azgaar.
    // https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/ui/editors.js#L306C1-L307C51
    const sizeRaw = 2.13 * Math.pow((city.population * populationRate) / urbanDensity, 0.385);
    const size = minmax(Math.ceil(sizeRaw), 6, 100);

    if (city.i !== undefined) {
      const paddedId = city.i.toString().padStart(4, '0');
      if (city.link === undefined) {
        newCity.mapSeed = paddedId;
        let seed = data.info.seed + paddedId;
        newCity.mapLink = `https://watabou.github.io/city-generator/?size=${size}&seed=${seed}&name=${newCity.name}&population=${city.population}&greens=0&citadel=${city.citadel}&urban_castle=${city.citadel}&plaza=${city.plaza}&temple=${city.temple}&walls=${city.walls}&shantytown=${city.shanty}&coast=${city.port}&river=${city.port}&hub=${city.capital}&sea=0`;
      }
    } else {
      newCity.mapSeed = '0000';
      let seed = data.info.seed + '0000';
      newCity.id = 0;
      newCity.mapLink = `https://watabou.github.io/city-generator/?size=${size}&seed=${seed}&name=${newCity.name}&population=${city.population}&greens=0&citadel=${city.citadel}&urban_castle=${city.citadel}&plaza=${city.plaza}&temple=${city.temple}&walls=${city.walls}&shantytown=${city.shanty}&coast=${city.port}&river=${city.port}&hub=${city.capital}&sea=0`;
    }

    // city features switch
    switch (true) {
      case city.citadel === 1:
        newCity.features.push('Citadel');
        newCity.tags.push({
          _id: 'lTnDEGrVvLDS2feESzZPV',
          Default: true,
          Description: 'A fortress, typically on high ground, protecting or dominating a city.',
          Name: 'Citadel',
          Type: 'Maps',
        });
        break;
      case city.plaza === 1:
        newCity.features.push('Plaza');
        newCity.tags.push({
          _id: '4CoOX8cSxMIjSBOzlcWzT',
          Default: true,
          Description: 'An open public square, especially in a city or town.',
          Name: 'Plaza',
          Type: 'Maps',
        });
        break;
      case city.port === 1:
        newCity.features.push('Port');
        newCity.tags.push({
          _id: '3OVpUylcH9JCUZMSX9nK4',
          Default: true,
          Description:
            'Locations designated for harboring and facilitating the arrival, departure, and storage of ships and vessels. Ports are key points of trade, transportation, and naval activities within the world, often situated along coastlines or major waterways.',
          Name: 'Port',
          Type: 'Maps',
        });
        break;
      case city.shanty === 1:
        newCity.features.push('Shanty Town(s)');
        newCity.tags.push({
          _id: 'tgFP5-2syOFdgXGQS11hB',
          Default: true,
          Description:
            'A deprived area on the outskirts of a town consisting of makeshift dwellings.',
          Name: 'Shanty Town',
          Type: 'Maps',
        });
        break;
      case city.temple === 1:
        newCity.features.push('Temple');
        newCity.tags.push({
          _id: 'FeS5jSkiM7N6-yhVccuwZ',
          Default: true,
          Description:
            'A building dedicated to the worship of deities or a place of religious practices.',
          Name: 'Temple',
          Type: 'Maps',
        });
        break;
      case city.walls === 1:
        newCity.features.push('Walls');
        newCity.tags.push({
          _id: '7SfAGH2dfmCZVsaU8JNbt',
          Default: true,
          Description: 'Defensive barriers or fortifications enclosing a city or settlement.',
          Name: 'Walls',
          Type: 'Maps',
        });
    }

    let Culture = findCultureByID(city.culture);
    if (Culture) {
      newCity.culture = {
        _id: Culture._id,
        description: '',
        name: Culture.name,
      };
    }

    let populationvalue = parseInt(newCity.population);

    // city size switch
    switch (true) {
      case populationvalue < 21:
        newCity.size = 'Thorp';
        newCity.tags.push({
          _id: 'PUnkFCYQe8ELfmDdLnQ9j',
          Default: true,
          Description: 'A small village or hamlet within the world.',
          Name: 'Thorp',
          Type: 'Locations',
        });
        break;
      case populationvalue > 21 && populationvalue < 60:
        newCity.size = 'Hamlet';
        newCity.tags.push({
          _id: 'E8a2ZY3L1YMejfutQ-SSX',
          Default: true,
          Description: 'A small settlement, often smaller than a village, within the world.',
          Name: 'Hamlet',
          Type: 'Locations',
        });
        break;
      case populationvalue > 61 && populationvalue < 200:
        newCity.size = 'Village';
        newCity.tags.push({
          _id: 'VdgVjS1N0DGbOe1rPAwOU',
          Default: true,
          Description: 'A clustered human settlement larger than a hamlet but smaller than a town.',
          Name: 'Village',
          Type: 'Locations',
        });
        break;
      case populationvalue > 201 && populationvalue < 2000:
        newCity.size = 'Small Town';
        newCity.tags.push({
          _id: 'vlcbcyj423BS-BNTdD3ba',
          Default: true,
          Description:
            'A compact and organized human settlement, larger than a village but smaller than a large town.',
          Name: 'Small Town',
          Type: 'Locations',
        });
        break;
      case populationvalue > 2001 && populationvalue < 5000:
        newCity.size = 'Large Town';
        newCity.tags.push({
          _id: 'dA8K690AX0izlvr53lB6z',
          Default: true,
          Description:
            'A sizable and populated human settlement, larger than a small town but smaller than a city.',
          Name: 'Large Town',
          Type: 'Locations',
        });
        break;
      case populationvalue > 5001 && populationvalue < 10000:
        newCity.size = 'Small City';
        newCity.tags.push({
          _id: 'fHIeZ74EP4dDv5kzIG2w4',
          Default: true,
          Description:
            'A compact and urbanized human settlement, larger than a large town but smaller than a metropolis.',
          Name: 'Small City',
          Type: 'Locations',
        });
        break;
      case populationvalue > 10001 && populationvalue < 25000:
        newCity.size = 'Large City';
        newCity.tags.push({
          _id: 'grZI1ZhAH783TnF3lgOqv',
          Default: true,
          Description: 'A densely populated and highly developed urban center within the world.',
          Name: 'Large City',
          Type: 'Locations',
        });
        break;
      case populationvalue > 25000:
        newCity.size = 'Metropolis';
        newCity.tags.push({
          _id: '9Zx94oEYkSJ1gncBTfPMt',
          Default: true,
          Description:
            'An extremely large and highly populated urban center, often a major hub of commerce and culture.',
          Name: 'Metropolis',
          Type: 'Locations',
        });
        break;
      default:
        newCity.size = 'uknown';
        break;
    }

    newCity.type = 'City - ' + newCity.size;

    tempMap.cities.push(newCity);
  });

  // mutate countries
  data.countries.forEach((country) => {
    // define new country object
    const newCountry: TLCountry = createEmptyCountry();

    // add country data to new country object
    newCountry._id = nanoid();
    // newCountry.cities = []; //will be pushed to later.
    newCountry.coa = country.coa;
    newCountry.color = country.color;
    let Culture = findCultureByID(country.culture);
    //console.log(Culture);
    if (Culture) {
      newCountry.culture = {
        _id: Culture._id,
        description: '',
        name: Culture.name,
      };
    }
    newCountry.location = data.info.name;
    newCountry.name = country.name;
    newCountry.nameFull = country.fullName;
    newCountry.political.form = country.form;
    newCountry.political.formName = country.formName;
    if (country.military) {
      country.military.forEach((military) => {
        newCountry.political.military.push({
          _id: nanoid(),
          id: military.i,
          a: military.a,
          cell: military.cell,
          x: military.x,
          y: military.y,
          bx: military.bx,
          by: military.by,
          u: {
            cavalry: military.u.cavalry,
            archers: military.u.archers,
            infantry: military.u.infantry,
            artillery: military.u.artillery,
          },
          n: military.n,
          name: military.name,
          state: military.state,
          icon: military.icon,
        });
      });
    }
    if (country.neighbors) {
      country.neighbors.forEach((neighbor) => {
        newCountry.political.neighbors.push({
          name: data.countries[neighbor].fullName || data.countries[neighbor].name,
          id: data.countries[neighbor].i,
          _id: '',
        });
      });
    }
    if (country.diplomacy) {
      country.diplomacy.map((Diplomat, index) => {
        if (Diplomat === 'Suspicion') {
          Diplomat = 'Suspicious';
        }
        if (index === country.i) {
          Diplomat = '-';
        }

        const dipObj: TLDiplomacy = {
          name: data.countries[index].fullName || data.countries[index].name,
          status: Diplomat,
          id: data.countries[index].i,
        };
        newCountry.political.diplomacy.push(dipObj);
      });
    }

    const urbanvalue = Math.round(country.urban * Number(populationRate) * Number(urbanization));
    newCountry.population.urban = urbanvalue.toLocaleString('en-US') || '';

    const ruralvalue = Math.round(country.rural * Number(populationRate) * Number(urbanization));
    newCountry.population.rural = ruralvalue.toLocaleString('en-US') || '';

    newCountry.population.total = Math.round(ruralvalue + urbanvalue).toLocaleString('en-US') || '';

    newCountry.tags.push({
      _id: 'TJaHO2uqBFZcoXWIfc5hJ',
      Default: true,
      Description: 'A distinct and sovereign nation within the world, often with defined borders.',
      Name: 'Country',
      Type: 'Locations',
    });
    newCountry.type.push('Country', country.type);

    tempMap.countries.push(newCountry);
  });

  // mutate name bases
  nameBaseJSON.forEach((name: NameBase) => {
    name._id = nanoid();
    if (name.b !== undefined) {
      let names = name.b.split(',') as unknown as string[];
      name.names = names;
      tempMap.nameBases.push(name as unknown as TLNameBase);
    }
  });

  // mutate notes
  data.notes.forEach((note) => {
    const newNote: TLNote = {
      _id: nanoid(),
      legend: note.legend,
      id: note.id,
      name: note.name,
    };
    tempMap.notes.push(newNote);
  });

  // mutate religions - needs touching up.
  data.religions.forEach((religion) => {
    const newReligion: TLReligion = createEmptyReligion();
    const Culture = findCultureByID(religion.culture);
    newReligion._id = nanoid();
    newReligion.code = religion.code;
    if (Culture) {
      newReligion.culture.name = Culture.name;
      newReligion.culture._id = Culture._id;
    }
    newReligion.deity = religion.deity;
    newReligion.form = religion.form;
    newReligion.i = religion.i;
    newReligion.name = religion.name;
    newReligion.origins = religion.origins;
    newReligion.type = religion.type;

    tempMap.religions.push(newReligion);
  });

  // mutate SVGs

  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.remove();
  }


  // set svg data
  const svgData = data.SVG;

  // Get current window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Get original dimensions from data
  const originalWidth = data.info.width;
  const originalHeight = data.info.height;

  // Insert 'modifiedSvgString' into the DOM or use it as needed
  document.body.insertAdjacentHTML('afterbegin', svgData);

  const mapItem = document.getElementById('map');
  const viewBox = document.getElementById('viewbox');
  if (mapItem) {
    if (viewBox) {
      mapItem.setAttribute('height', windowHeight as unknown as string);
      mapItem.setAttribute('width', windowWidth as unknown as string);
      viewBox.setAttribute('height', windowHeight as unknown as string);
      viewBox.setAttribute('width', windowWidth as unknown as string);

      if (innerHeight > originalHeight) {
        viewBox.classList.add('svgScaledUp');
      } else if (innerHeight < originalHeight) {
        viewBox.classList.add('svgScaledDown');
      }
      // Apply transformation to scale content
      viewBox.setAttribute(
        'transform',
        `scale(${innerWidth / originalWidth},${innerHeight / originalHeight})`,
      );
    }
  }

  console.log(terraLoggerMap);
  console.log(tempMap);
  console.log(data);
  return data;
};

export default mutateData;
