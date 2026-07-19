import { handleSvgReplace } from "../Util/handleSvgReplace";
import { createTerraLoggerMap } from "../Util/mkEmpty/tlMap";

import {
  mutateCities,
  mutateCountries,
  mutateCultures,
  mutateReligions,
  mutateNameBases,
  mutateNotes,
} from "../Util/mutations";

import type { TLMapInfo } from "../../definitions/TerraLogger";

export type MutateProgress = {
  section: string;
  item?: string;
  completed: number;
  total: number;
  percent: number;
  message: string;
};

export type MutateProgressHandler = (progress: MutateProgress) => void;

const assignMapInfo = (tempMap: TLMapInfo, data: MapInfo) => {
  // add map info that doesn't need mutating.
  tempMap.info = data.info;
  tempMap.settings = data.settings;
  tempMap.SVG = data.SVG;
};

const mutateData = async (
  data: MapInfo,
  Pack: Pack,
  onProgress?: MutateProgressHandler,
) => {
  const { populationRate, urbanization, urbanDensity } = data.settings;

  const tempMap: TLMapInfo = createTerraLoggerMap();

  const mutationSteps = [
    "Map Info",
    "Cultures",
    "Cities",
    "Countries",
    "Name Bases",
    "Notes",
    "Religions",
    "Relationships",
    "Culture Population",
    "SVG",
  ];

  let completedMutationSteps = 0;

  const reportMutationProgress = (section: string, item?: string) => {
    completedMutationSteps += 1;

    const percent = Math.min(
      60,
      30 + Math.round((completedMutationSteps / mutationSteps.length) * 30),
    );

    onProgress?.({
      section,
      item,
      completed: completedMutationSteps,
      total: mutationSteps.length,
      percent,
      message: item
        ? `Importing ${section} - ${item}`
        : `Importing ${section}...`,
    });
  };

  // Mutate Map Data to Terra-Logger Format //

  try {
    reportMutationProgress("Map Info", data.info?.name);
    assignMapInfo(tempMap, data);
  } catch (error) {
    console.error("Error assigning Map Info", error);
  }

  try {
    reportMutationProgress("Cultures");
    const Cultures = await mutateCultures(
      data,
      tempMap,
      populationRate,
      urbanization,
    );

    tempMap.cultures = Cultures;
  } catch (error) {
    console.error("Error mutating cultures:", error);
  }

  try {
    reportMutationProgress("Cities");
    const Cities = await mutateCities(
      data,
      tempMap,
      populationRate,
      urbanization,
      urbanDensity,
      tempMap.SVG,
    );

    tempMap.cities = Cities;
  } catch (error) {
    console.error("Error mutating cities:", error);
  }

  try {
    reportMutationProgress("Countries");
    const Countries = await mutateCountries(
      data,
      tempMap,
      populationRate,
      urbanization,
      tempMap.SVG,
    );

    tempMap.countries = Countries;
  } catch (error) {
    console.error("Error mutating countries:", error);
  }

  try {
    reportMutationProgress("Name Bases");
    const NameBases = await mutateNameBases(tempMap);

    tempMap.nameBases = NameBases;
  } catch (error) {
    console.error("Error mutating name bases:", error);
  }

  try {
    reportMutationProgress("Notes");
    const Notes = await mutateNotes(data, tempMap);

    tempMap.notes = Notes;
  } catch (error) {
    console.error("Error mutating notes:", error);
  }

  try {
    reportMutationProgress("Religions");
    const Religions = await mutateReligions(
      data,
      tempMap,
      Pack,
      populationRate,
      urbanization,
    );

    tempMap.religions = Religions;
  } catch (error) {
    console.error("Error mutating religions:", error);
  }

  reportMutationProgress("Relationships");

  // associate cities with countries and cultures
  tempMap.cities.forEach((city) => {
    if (city.country) {
      const tempCountry = tempMap.countries.find(
        (c) => c.id === city.country.id,
      );

      if (tempCountry) {
        city.country = {
          _id: tempCountry._id,
          govForm: tempCountry.political.form,
          govName: tempCountry.political.formName,
          id: tempCountry.id,
          name: tempCountry.name,
          nameFull: tempCountry.nameFull,
        };
      }
    }

    if (city.culture) {
      const tempCulture = tempMap.cultures.find(
        (c) => (c.id as unknown as string) === city.culture.id,
      );

      if (tempCulture) {
        city.culture = {
          id: tempCulture.id as unknown as string,
          _id: tempCulture._id,
          name: tempCulture.name,
        };
      }
    }
  });

  reportMutationProgress("Culture Population");

  for (const culture of tempMap.cultures) {
    const cultureCountries = tempMap.countries.filter(
      (country) => country.culture.id === (culture.id as unknown as string),
    );

    let urbPop = 0;
    let rurPop = 0;

    for (const country of cultureCountries) {
      const urbValue = Number.parseInt(
        country.population.urban.replace(/,/g, ""),
        10,
      );
      const rurValue = Number.parseInt(
        country.population.rural.replace(/,/g, ""),
        10,
      );

      urbPop += urbValue;
      rurPop += rurValue;
    }

    culture.urbanPop = urbPop.toLocaleString("en-US");
    culture.ruralPop = rurPop.toLocaleString("en-US");
  }

  reportMutationProgress("SVG");

  handleSvgReplace({
    svg: data.SVG,
    height: data.info.height,
    width: data.info.width,
  });

  return tempMap;
};

export default mutateData;
