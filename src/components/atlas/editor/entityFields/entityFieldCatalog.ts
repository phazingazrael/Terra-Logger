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
    { path: "name", label: "Short Name", editor: "text" },
    { path: "nameFull", label: "Full Name", editor: "text" },
    { path: "type", label: "Country Type", editor: "select" },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "location", label: "Location", editor: "text" },
    { path: "color", label: "Color", editor: "text" },
    {
      path: "culture",
      label: "Culture",
      editor: "reference",
      referenceCollection: "cultures",
      referenceSerializer: "countryCultureRef",
    },

    {
      path: "languages",
      label: "Languages",
      editor: "stringList",
      itemLabel: "Language",
    },

    { path: "tags", label: "Tags", editor: "tagList" },

    { path: "population.total", label: "Total Population", editor: "text" },
    { path: "population.rural", label: "Rural Population", editor: "text" },
    { path: "population.urban", label: "Urban Population", editor: "text" },

    {
      path: "economy.description",
      label: "Economic Description",
      editor: "textarea",
    },
    {
      path: "economy.exports",
      label: "Exports",
      editor: "stringList",
      itemLabel: "Export",
    },
    {
      path: "economy.imports",
      label: "Imports",
      editor: "stringList",
      itemLabel: "Import",
    },

    {
      path: "history.details",
      label: "Historical Overview",
      editor: "textarea",
    },
    {
      path: "history.events",
      label: "Historical Events",
      editor: "stringList",
      itemLabel: "Event",
    },

    { path: "political.form", label: "Government Form", editor: "text" },
    { path: "political.formName", label: "Government Type", editor: "text" },
    {
      path: "political.leaders",
      label: "Leaders",
      editor: "stringList",
      itemLabel: "Leader",
    },
    {
      path: "political.ruler",
      label: "Rulers",
      editor: "stringList",
      itemLabel: "Ruler",
    },

    {
      path: "political.diplomacy",
      label: "Diplomacy",
      editor: "objectList",
      itemLabel: "Relation",
      itemFields: [
        { path: "name", label: "Country Name", editor: "text" },
        { path: "id", label: "Country ID", editor: "number" },
        {
          path: "status",
          label: "Status",
          editor: "select",
          options: diplomacyStatusOptions,
        },
      ],
    },

    {
      path: "political.neighbors",
      label: "Neighbors",
      editor: "objectList",
      itemLabel: "Neighbor",
      itemFields: [
        { path: "name", label: "Name", editor: "text" },
        { path: "id", label: "ID", editor: "number" },
        { path: "_id", label: "Database ID", editor: "text" },
      ],
    },

    {
      path: "political.military",
      label: "Military Units",
      editor: "objectList",
      itemLabel: "Unit",
      itemFields: [
        { path: "name", label: "Name", editor: "text" },
        { path: "icon", label: "Icon", editor: "text" },
        { path: "a", label: "Strength", editor: "number" },
        { path: "n", label: "Quantity", editor: "number" },
        { path: "cell", label: "Cell", editor: "number" },
        { path: "x", label: "X", editor: "number" },
        { path: "y", label: "Y", editor: "number" },
        { path: "u.infantry", label: "Infantry", editor: "number" },
        { path: "u.cavalry", label: "Cavalry", editor: "number" },
        { path: "u.archers", label: "Archers", editor: "number" },
        { path: "u.artillery", label: "Artillery", editor: "number" },
      ],
    },

    {
      path: "warCampaigns",
      label: "War Campaigns",
      editor: "objectList",
      itemLabel: "Campaign",
      itemFields: [
        { path: "title", label: "Title", editor: "text" },
        { path: "start", label: "Start Year", editor: "number" },
        { path: "end", label: "End Year", editor: "number" },
      ],
    },
  ],

  city: [
    { path: "name", label: "Name", editor: "text" },
    {
      path: "type",
      label: "Type",
      editor: "select",
      options: toOptions(CITY_TYPE_OPTIONS),
    },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "population", label: "Population", editor: "text" },
    {
      path: "size",
      label: "Size",
      editor: "select",
      options: toOptions(CITY_SIZE_OPTIONS),
    },
    { path: "capital", label: "Capital", editor: "boolean" },
    {
      path: "country",
      label: "Country",
      editor: "reference",
      referenceCollection: "countries",
      referenceSerializer: "cityCountryRef",
    },
    {
      path: "culture",
      label: "Culture",
      editor: "reference",
      referenceCollection: "cultures",
      referenceSerializer: "cityCultureRef",
    },
    {
      path: "features",
      label: "Features",
      editor: "stringList",
      itemLabel: "Feature",
      options: toOptions(CITY_FEATURE_OPTIONS),
    },
    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "mapLink", label: "Map Link", editor: "text" },
    { path: "mapSeed", label: "Map Seed", editor: "text" },
  ],

  culture: [
    { path: "name", label: "Name", editor: "text" },
    { path: "type", label: "Type", editor: "text" },
    { path: "description", label: "Description", editor: "textarea" },
    { path: "color", label: "Color", editor: "text" },
    { path: "expansionism", label: "Expansionism", editor: "number" },
    { path: "ruralPop", label: "Rural Population", editor: "text" },
    { path: "urbanPop", label: "Urban Population", editor: "text" },

    {
      path: "origins",
      label: "Origins",
      editor: "referenceList",
      referenceCollection: "cultures",
      referenceSerializer: "numericId",
    },

    { path: "tags", label: "Tags", editor: "tagList" },
  ],

  religion: [
    { path: "name", label: "Name", editor: "text" },
    { path: "type", label: "Type", editor: "text" },
    { path: "form", label: "Form", editor: "text" },
    { path: "deity", label: "Deity", editor: "text" },
    { path: "description", label: "Description", editor: "textarea" },

    {
      path: "culture",
      label: "Culture",
      editor: "reference",
      referenceCollection: "cultures",
      referenceSerializer: "religionCultureRef",
    },

    {
      path: "center",
      label: "Center",
      editor: "reference",
      referenceCollection: "cities",
      referenceSerializer: "religionCenterRef",
    },

    {
      path: "origins",
      label: "Origins",
      editor: "stringList",
      itemLabel: "Origin",
    },

    { path: "tags", label: "Tags", editor: "tagList" },
    { path: "members.rural", label: "Rural Members", editor: "number" },
    { path: "members.urban", label: "Urban Members", editor: "number" },
  ],

  note: [
    { path: "name", label: "Name", editor: "text" },
    { path: "legend", label: "Body", editor: "textarea" },
    { path: "tags", label: "Tags", editor: "tagList" },
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
