import { v7 as uuidv7 } from "uuid";
import { createEmptyCulture } from "../mkEmpty/tlCulture";

import type { TLMapInfo, TLCulture } from "../../../definitions/TerraLogger";
import { cultureAdapter } from "../../atlas/adapters/cultureAdapter";
export const mutateCultures = async (
  data: MapInfo,
  tempMap: TLMapInfo,
  populationRate: number,
  urbanization: string,
) => {
  for (const culture of data.cultures) {
    // define new culture object
    const newCulture: TLCulture = createEmptyCulture();

    // define urban and rural population values
    const urbanValue = Math.round(
      culture.urban * Number(populationRate) * Number(urbanization),
    ).toLocaleString("en-US");

    const ruralValue = Math.round(
      culture.rural * Number(populationRate) * Number(urbanization),
    ).toLocaleString("en-US");

    // add culture data to new culture object
    newCulture._id = uuidv7();
    newCulture.aliases = [newCulture.name];
    newCulture.architecture = "";
    newCulture.arts = "";
    newCulture.base = culture.base;
    newCulture.code = culture.code;
    newCulture.color = culture.color ?? "";
    newCulture.cuisine = "";
    newCulture.dress = "";
    newCulture.ethnicGroups = [];
    newCulture.expansionism = culture.expansionism;
    newCulture.government = "";
    newCulture.id = culture.i;
    newCulture.language = "";
    newCulture.name = culture.name;
    newCulture.notableFigures = [];
    newCulture.origins = culture.origins;
    newCulture.pronounced = newCulture.name;
    newCulture.region = "";
    newCulture.religions = [];
    newCulture.ruralPop = ruralValue;
    newCulture.shield = culture.shield;
    newCulture.technologyLevel = "";
    newCulture.theme = newCulture.type;
    newCulture.traditions = [];
    newCulture.type = culture.type;
    newCulture.urbanPop = urbanValue;
    newCulture.values = [];
    newCulture.tags.push({
      _id: "0192be16-c07d-7897-8ee1-0e117f5d2b9a",
      Default: true,
      Description: "The customs, arts, social institutions, and achievements of the world's inhabitants.",
      Name: "Culture",
      Type: "WorldOverview",
    });

    newCulture.content = cultureAdapter.createDefaultContent(newCulture);

    tempMap.cultures.push(newCulture);
  }
  return tempMap.cultures;
};
