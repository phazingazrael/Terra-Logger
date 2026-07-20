import type { TLCity } from "../../../definitions/TerraLogger";

export const createEmptyCity = (): TLCity => ({
  _id: "",
  aliases: [],
  capital: false,
  coa: {
    charges: [
      {
        charge: "",
        t: "",
        p: "",
        size: 0,
      },
    ],
    division: {
      division: "",
      t: "",
      line: "",
    },
    shield: "",
    t1: "",
  },
  coaSVG: "",
  content: {
    schema: "atlas/content/v1",
    kind: "AtlasContent",
    version: 1,
    id: "",
    layout: {
      preset: "content-grid",
    },
    meta: {
      title: "",
    },
    sections: [],
    source: {
      entityId: "",
      type: "city",
    },
  },
  country: {
    _id: "",
    govForm: "",
    govName: "",
    id: 0,
    name: "",
    nameFull: "",
  },
  culture: {
    _id: "",
    id: "",
    name: "",
  },
  defenses: "",
  description: "",
  economy: {
    description: "",
    imports: [],
    exports: [],
  },
  features: [],
  id: 0,
  leaders: [],
  mapLink: "",
  mapSeed: "",
  name: "",
  population: "",
  pronounced: "",
  religions: [],
  rulers: [],
  size: "",
  tags: [],
  terrain: "",
  theme: "",
  type: "",
});
