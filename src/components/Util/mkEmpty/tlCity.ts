import type { TLCity } from "../../../definitions/TerraLogger";

export const createEmptyCity = (): TLCity => ({
  _id: "",
  capital: false,
  coa: {
    t1: "",
    division: {
      division: "",
      t: "",
      line: "",
    },
    charges: [
      {
        charge: "",
        t: "",
        p: "",
        size: 0,
      },
    ],
    shield: "",
  },
  coaSVG: "",
  content: {
    children: [],
    type: "View",
    sourceType: "city",
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
    id: "",
    _id: "",
    name: "",
  },
  features: [],
  id: 0,
  mapLink: "",
  mapSeed: "",
  name: "",
  population: "",
  size: "",
  tags: [],
  type: "",
  description: "",
});
