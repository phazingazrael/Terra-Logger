import type {
  AtlasComputedFieldMap,
  AtlasEntityFieldCatalog,
  AtlasEntityFieldSchema,
} from "./entityFieldTypes";

import {
  CITY_FEATURE_OPTIONS,
  CITY_SIZE_OPTIONS,
  CITY_TYPE_OPTIONS,
} from "../../../Util/cityUtils";

function toOptions(values: readonly string[]) {
  return values.map((value) => ({
    label: value,
    value,
  }));
}

const diplomacyStatusOptions = [
  "Ally",
  "Friendly",
  "Neutral",
  "Suspicion",
  "Rival",
  "Enemy",
].map((status) => ({
  label: status,
  value: status,
}));

export const entityFieldCatalog: AtlasEntityFieldCatalog = {
  country: [
    { path: "aliases", label: "Aliases", editor: "stringList", itemLabel: "Alias" },
    { path: "color", label: "Color", editor: "text" },
    { path: "culture", label: "Culture", editor: "reference", referenceCollection: "cultures", referenceSerializer: "countryCultureRef", },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "economy.description", label: "Economic Description", editor: "textarea", },
    { path: "economy.exports", label: "Exports", editor: "stringList", itemLabel: "Export", },
    { path: "economy.imports", label: "Imports", editor: "stringList", itemLabel: "Import", },
    { path: "history.details", label: "Historical Overview", editor: "textarea", },
    { path: "history.events", label: "Historical Events", editor: "stringList", itemLabel: "Event", },
    { path: "languages", label: "Languages", editor: "stringList", itemLabel: "Language", },
    { path: "location", label: "Location", editor: "text" },
    { path: "name", label: "Short Name", editor: "text" },
    { path: "nameFull", label: "Full Name", editor: "text" },
    { path: "planetPlane", label: "Planet / Plane", editor: "text", },
    { path: "political.diplomacy", label: "Diplomacy", editor: "objectList", itemLabel: "Relation", itemFields: [{ path: "name", label: "Country Name", editor: "text" }, { path: "id", label: "Country ID", editor: "number" }, { path: "status", label: "Status", editor: "select", options: diplomacyStatusOptions, },], },
    { path: "political.form", label: "Government Form", editor: "text" },
    { path: "political.formName", label: "Government Name", editor: "text", },
    { path: "political.leaders", label: "Leaders", editor: "stringList", itemLabel: "Leader", },
    { path: "political.military", label: "Military Units", editor: "objectList", itemLabel: "Unit", itemFields: [{ path: "name", label: "Name", editor: "text" }, { path: "icon", label: "Icon", editor: "text" }, { path: "a", label: "Strength", editor: "number" }, { path: "n", label: "Quantity", editor: "number" }, { path: "cell", label: "Cell", editor: "number" }, { path: "x", label: "X", editor: "number" }, { path: "y", label: "Y", editor: "number" }, { path: "u.infantry", label: "Infantry", editor: "number" }, { path: "u.cavalry", label: "Cavalry", editor: "number" }, { path: "u.archers", label: "Archers", editor: "number" }, { path: "u.artillery", label: "Artillery", editor: "number" },], },
    { path: "political.neighbors", label: "Neighbors", editor: "objectList", itemLabel: "Neighbor", itemFields: [{ path: "name", label: "Name", editor: "text" }, { path: "id", label: "ID", editor: "number" }, { path: "_id", label: "Database ID", editor: "text" },], },
    { path: "political.ruler", label: "Rulers", editor: "stringList", itemLabel: "Ruler", },
    { path: "population.rural", label: "Rural Population", editor: "readonly", },
    { path: "population.total", label: "Total Population", editor: "readonly", },
    { path: "population.urban", label: "Urban Population", editor: "readonly", },
    { path: "pronounced", label: "Pronounced", editor: "text" },
    { path: "religions", label: "Religions", editor: "stringList", itemLabel: "Religion", },
    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "terrain", label: "Terrain", editor: "text", },
    { path: "theme", label: "Theme", editor: "text" },
    { path: "type", label: "Country Type", editor: "select" },
    { path: "warCampaigns", label: "War Campaigns", editor: "objectList", itemLabel: "Campaign", itemFields: [{ path: "title", label: "Title", editor: "text" }, { path: "start", label: "Start Year", editor: "number" }, { path: "end", label: "End Year", editor: "number" },], },
  ],

  city: [
    { path: "aliases", label: "Aliases", editor: "stringList", itemLabel: "Alias" },
    { path: "capital", label: "Capital", editor: "boolean" },
    { path: "country", label: "Country", editor: "reference", referenceCollection: "countries", referenceSerializer: "cityCountryRef", },
    { path: "culture", label: "Culture", editor: "reference", referenceCollection: "cultures", referenceSerializer: "cityCultureRef", },
    { path: "defenses", label: "Defenses", editor: "textarea" },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "economy.description", label: "Economic Description", editor: "textarea", },
    { path: "economy.exports", label: "Exports", editor: "stringList", itemLabel: "Export", },
    { path: "economy.imports", label: "Imports", editor: "stringList", itemLabel: "Import", },
    { path: "features", label: "Features", editor: "stringList", itemLabel: "Feature", options: toOptions(CITY_FEATURE_OPTIONS), },
    { path: "leaders", label: "Leaders", editor: "stringList", itemLabel: "Leader" },
    { path: "mapLink", label: "Map Link", editor: "text" },
    { path: "mapSeed", label: "Map Seed", editor: "text" },
    { path: "name", label: "Name", editor: "text" },
    { path: "population", label: "Population", editor: "text" },
    { path: "pronounced", label: "Pronounced", editor: "text" },
    { path: "religions", label: "Religions", editor: "stringList", itemLabel: "Religion" },
    { path: "rulers", label: "Rulers", editor: "stringList", itemLabel: "Ruler" },
    { path: "size", label: "Size", editor: "select", options: toOptions(CITY_SIZE_OPTIONS), },
    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "terrain", label: "Terrain", editor: "text" },
    { path: "theme", label: "Theme", editor: "text" },
    { path: "type", label: "Type", editor: "select", options: toOptions(CITY_TYPE_OPTIONS), },
  ],

  culture: [
    { path: "aliases", label: "Aliases", editor: "stringList", itemLabel: "Alias" },
    { path: "architecture", label: "Architecture", editor: "textarea", },
    { path: "arts", label: "Arts", editor: "textarea", },
    { path: "color", label: "Color", editor: "text" },
    { path: "cuisine", label: "Cuisine", editor: "textarea", },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "dress", label: "Dress", editor: "textarea", },
    { path: "ethnicGroups", label: "Ethnic Groups", editor: "stringList", itemLabel: "Ethnic Group", },
    { path: "expansionism", label: "Expansionism", editor: "number" },
    { path: "government", label: "Government", editor: "text", },
    { path: "language", label: "Language", editor: "text", },
    { path: "name", label: "Name", editor: "text" },
    { path: "notableFigures", label: "Notable Figures", editor: "stringList", itemLabel: "Notable Figure", },
    { path: "origins", label: "Origins", editor: "referenceList", referenceCollection: "cultures", referenceSerializer: "numericId", },
    { path: "pronounced", label: "Pronounced", editor: "text" },
    { path: "region", label: "Region", editor: "text", },
    { path: "religions", label: "Religions", editor: "stringList", itemLabel: "Religion", },
    { path: "ruralPop", label: "Rural Population", editor: "text" },
    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "technologyLevel", label: "Technology Level", editor: "text", },
    { path: "theme", label: "Theme", editor: "text" },
    { path: "traditions", label: "Traditions", editor: "stringList", itemLabel: "Tradition", },
    { path: "type", label: "Type", editor: "text" },
    { path: "urbanPop", label: "Urban Population", editor: "text" },
    { path: "values", label: "Values", editor: "stringList", itemLabel: "Value", },
  ],

  religion: [
    { path: "aliases", label: "Aliases", editor: "stringList", itemLabel: "Alias" },
    { path: "center.name", label: "Center / Holy City", editor: "text", },
    { path: "center", label: "Center", editor: "reference", referenceCollection: "cities", referenceSerializer: "religionCenterRef", },
    { path: "culture", label: "Culture", editor: "reference", referenceCollection: "cultures", referenceSerializer: "religionCultureRef", },
    { path: "deities", label: "Deities", editor: "stringList", itemLabel: "Deity", },
    { path: "deity", label: "Primary Deity", editor: "text", },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "domains", label: "Domains", editor: "stringList", itemLabel: "Domain", },
    { path: "form", label: "Form", editor: "text" },
    { path: "headquarters", label: "Headquarters", editor: "text", },
    { path: "name", label: "Name", editor: "text" },
    { path: "origins", label: "Origins", editor: "stringList", itemLabel: "Origin", },
    { path: "pronounced", label: "Pronounced", editor: "text" },
    { path: "symbols", label: "Symbols", editor: "stringList", itemLabel: "Symbol", },
    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "theme", label: "Theme", editor: "text" },
    { path: "type", label: "Type", editor: "text" },
  ],

  note: [
    { path: "legend", label: "Body", editor: "textarea" },
    { path: "name", label: "Name", editor: "text" },
    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "type", label: "Type", editor: "readonly", },
  ],
};

export const computedBlockEditableFields: AtlasComputedFieldMap = {
  country: {
    countryHeader: [
      "name",
      "nameFull",
      "type",
      "location",
      "culture",
      "population.total",
      "population.rural",
      "population.urban",
    ],
    countryMilitary: ["political.military"],
    countryDiplomacy: ["political.diplomacy"],
    countryPopulation: [
      "population.total",
      "population.rural",
      "population.urban",
    ],
  },

  city: {
    cityHeader: [
      "name",
      "country",
      "capital",
      "culture",
      "type",
      "size",
      "population",
    ],
  },

  culture: {
    cultureHeader: [
      "name",
      "type",
      "description",
      "color",
      "expansionism",
      "ruralPop",
      "urbanPop",
    ],
    populationBlock: ["ruralPop", "urbanPop"],
  },

  religion: {
    religionHeader: [
      "name",
      "type",
      "form",
      "deity",
      "description",
      "culture",
      "center",
    ],
    populationBlock: ["members.rural", "members.urban"],
  },

  note: {
    noteHeader: ["name", "type"],
    noteBody: ["legend"],
  },
};

export function getEntityFieldSchema(
  sourceType: keyof typeof entityFieldCatalog,
  path: string,
): AtlasEntityFieldSchema | undefined {
  return entityFieldCatalog[sourceType].find((field) => field.path === path);
}

export function getEntityFieldSchemas(
  sourceType: keyof typeof entityFieldCatalog,
  paths: string[],
): AtlasEntityFieldSchema[] {
  return paths
    .map((path) => getEntityFieldSchema(sourceType, path))
    .filter((schema): schema is AtlasEntityFieldSchema => Boolean(schema));
}
