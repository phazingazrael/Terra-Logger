/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-underscore-dangle */
import { customAlphabet } from 'nanoid'

import { handleSvgReplace } from '../Util/handleSvgReplace';
import { createEmptyCountry } from '../Util/mkEmpty/tlCountry';
import { createEmptyCulture } from '../Util/mkEmpty/tlCulture';
import { createTerraLoggerMap } from '../Util/mkEmpty/tlMap';
import { createEmptyReligion } from '../Util/mkEmpty/tlReligion';
import nameBaseJSON from './NameBases.json';

import { minmax } from "../Util";

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 25);

const mutateData = async (data: MapInfo) => {
  const { populationRate, urbanization, urbanDensity } = data.settings;

  // Mutate Map Data to Terra-Logger Format //
  const tempMap: TLMapInfo = createTerraLoggerMap();

  // begin mutating data //
  // add map info that doesn't need mutating.
  tempMap.info = data.info;
  tempMap.settings = data.settings;
  tempMap.SVG = data.SVG;

  function findCultureByID(id: number) {
    return data.cultures.find((culture) => culture.i === id);
  }

  // mutate cities
  for (const city of data.cities) {
    // add city data to new city object
    let newCity: TLCity = {
      _id: nanoid(), // unique id,
      capital: !!city.capital, // if city is capital
      coa: city.coa, // set CoA data
      coaSVG:'',
      country: {
        _id: '',
        govForm: '',
        govName: '',
        id: city.state, // set country id,
        name: '',
        nameFull: '',
      },
      culture: {
        _id: '',
        id:''
      },
      features: [],
      id: city.i, // set city id
      mapLink: city.link, // set map link
      mapSeed: city.MFCG as unknown as string, // set map seed
      name: city.name, // set city name
      population: Math.round(
        city.population * Number(populationRate) * Number(urbanization),
      ).toLocaleString('en-US'),
      size: '',
      tags: [{
        _id: '1IZunX27kOFP-ff4kpeLQ',
        Default: true,
        Description: 'A large and permanent human settlement within the world.',
        Name: 'City',
        Type: 'Locations',
      }],
      type: city.type, // set city type
      description: '', // no description
    }

    if (city.coa) {
      // get coa svg from armoria and save to string inside of city data
      let coa = city.coa;
      let url: string | undefined;

      // check if coa is an object and if it has more than 0 keys
      if (typeof coa === 'object' && Object.keys(coa).length > 0) {
        // if so, encode the coa data to a string and add it to the url
        url = `https://armoria.herokuapp.com/?coa=${encodeURIComponent(JSON.stringify(coa))}`;
      } else if (coa === undefined) {
        console.log(coa, city._id);
        // if not, add the default url
        url = 'https://armoria.herokuapp.com/?size=500&format=svg';
      }

      if (url !== undefined) {
        try {
          const response = await fetch(url);
          const svg = await response.text();
          newCity.coaSVG = svg;
        } catch (error) {
          console.error('Error fetching SVG:', error);
        }
      }
    }


    // size & sizeRaw from editors.js from Azgaar.
    // https://github.com/Azgaar/Fantasy-Map-Generator/blob/master/modules/ui/editors.js#L306C1-L307C51
    const sizeRaw = 2.13 * Math.pow((city.population * populationRate) / urbanDensity, 0.385);
    const size = minmax(Math.ceil(sizeRaw), 6, 100);

    /**
     * Set map seed and link based on the city data.
     * If city.i is defined, use it to set the map seed and link.
     * Otherwise, use the default map seed and link.
     */
    if (city.i !== undefined) {
      const paddedId = city.i.toString().padStart(4, '0');
      if (city.link === undefined) {
        // Use the city id as the map seed
        newCity.mapSeed = paddedId;
        // Generate a new map link using the city data
        let seed = data.info.seed + paddedId;
        newCity.mapLink = `https://watabou.github.io/city-generator/?size=${size}&seed=${seed}&name=${newCity.name}&population=${city.population}&greens=0&citadel=${city.citadel}&urban_castle=${city.citadel}&plaza=${city.plaza}&temple=${city.temple}&walls=${city.walls}&shantytown=${city.shanty}&coast=${city.port}&river=${city.port}&hub=${city.capital}&sea=0`;
      }
    } else {
      // Use the default map seed and link
      const randomNumber = Math.floor(Math.random() * (9999 - 0 + 1)) + 0;
      const paddedRandomNumber = randomNumber.toString().padStart(4, '0');
      newCity.mapSeed = paddedRandomNumber;
      let seed = data.info.seed + paddedRandomNumber;
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
        _id: '',
        id: Culture.i as unknown as string,
      };
    }

    let populationValue = parseInt(newCity.population.replace(/,/g, ''));

    // city size switch
    // city size data loosely interpreted from "Medieval Demographics Made Easy" by S. John Ross (last known email sjohn@cumberlandgames.com)
    // plans to implement further data from the demographics based on https://www.rpglibrary.org/utils/meddemog/ by Brandon Blackmoor
    switch (true) {
      case populationValue < 21:
        newCity.size = 'Thorp';
        newCity.tags.push({
          _id: 'PUnkFCYQe8ELfmDdLnQ9j',
          Default: true,
          Description: 'A small village or hamlet within the world.',
          Name: 'Thorp',
          Type: 'Locations',
        });
        break;
      case populationValue > 21 && populationValue < 60:
        newCity.size = 'Hamlet';
        newCity.tags.push({
          _id: 'E8a2ZY3L1YMejfutQ-SSX',
          Default: true,
          Description: 'A small settlement, often smaller than a village, within the world.',
          Name: 'Hamlet',
          Type: 'Locations',
        });
        break;
      case populationValue > 61 && populationValue < 200:
        newCity.size = 'Village';
        newCity.tags.push({
          _id: 'VdgVjS1N0DGbOe1rPAwOU',
          Default: true,
          Description: 'A clustered human settlement larger than a hamlet but smaller than a town.',
          Name: 'Village',
          Type: 'Locations',
        });
        break;
      case populationValue > 201 && populationValue < 2000:
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
      case populationValue > 2001 && populationValue < 5000:
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
      case populationValue > 5001 && populationValue < 10000:
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
      case populationValue > 10001 && populationValue < 25000:
        newCity.size = 'Large City';
        newCity.tags.push({
          _id: 'grZI1ZhAH783TnF3lgOqv',
          Default: true,
          Description: 'A densely populated and highly developed urban center within the world.',
          Name: 'Large City',
          Type: 'Locations',
        });
        break;
      case populationValue > 25000:
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

  // mutate countries
  data.countries.forEach((country) => {
    // define new country object
    const newCountry: TLCountry = createEmptyCountry();

    // add country data to new country object
    newCountry._id = nanoid();
    newCountry.id = country.i;
    // newCountry.cities = []; //will be pushed to later.
    newCountry.coa = country.coa;
    newCountry.color = country.color;
    newCountry.location = data.info.name;
    newCountry.name = country.name;
    newCountry.nameFull = country.fullName;
    newCountry.political.form = country.form;
    newCountry.political.formName = country.formName;

    let Culture = findCultureByID(country.culture);

    if (Culture) {
      newCountry.culture = {
        _id: '',
        id: Culture.i as unknown as string
      };
    }

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
    newCountry.type = country.type;

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
    let Culture = tempMap.cultures.find((c) => c.id === religion.culture);
    newReligion._id = nanoid();
    newReligion.code = religion.code;
    if (Culture) {
      newReligion.culture = {
        id: Culture.id as unknown as string,
        _id: Culture._id,
    }
    }
    newReligion.deity = religion.deity;
    newReligion.form = religion.form;
    newReligion.i = religion.i;
    newReligion.name = religion.name;
    newReligion.origins = religion.origins;
    newReligion.type = religion.type;

    tempMap.religions.push(newReligion);
  });

  //associate cities with countries
  tempMap.cities.forEach(async (city) => {

    if (city.country) {
      const tempCountry = tempMap.countries.find((c) => c.id === city.country.id);
      if (tempCountry) {

        city.country = {
          _id: tempCountry._id,
          govForm: tempCountry.political.form,
          govName: tempCountry.political.formName,
          id: tempCountry.id,
          name: tempCountry.name,
          nameFull: tempCountry.nameFull,
        }
      }
    }
    if (city.culture) {
      const tempCulture = tempMap.cultures.find((c) => c.id as unknown as string === city.culture.id);
      if (tempCulture) {

        city.culture = {
          id: tempCulture.id as unknown as string,
          _id: tempCulture._id,
        }
      }
    }
  });

  // mutate cultures
  tempMap.cultures.forEach((culture) => {
    let cultureCountries = tempMap.countries.filter((country) => country.culture.id === culture.id as unknown as string);
    let urbPop = 0;
    let rurPop = 0;

    cultureCountries.forEach((country) => {
      let urbValue = parseInt(country.population.urban.replace(/,/g, ''));
      let rurValue = parseInt(country.population.rural.replace(/,/g, ''));

      urbPop += urbValue;
      rurPop += rurValue;
    });
    culture.urbanPop = urbPop.toLocaleString('en-US');
    culture.ruralPop = rurPop.toLocaleString('en-US');
  });



  handleSvgReplace({ svg: data.SVG, height: data.info.height, width: data.info.width });

  return tempMap;
};

export default mutateData;
