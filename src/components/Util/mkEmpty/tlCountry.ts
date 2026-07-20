import type { TLCountry } from "../../../definitions/TerraLogger";

export const createEmptyCountry = (): TLCountry => ({
  _id: "",
  cities: [],
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
  color: "",
  content: {
    schema: "atlas/content/v1",
    kind: "AtlasContent",
    version: 1,
    id: "",
    source: {
      type: "country",
      entityId: "",
    },
    meta: {
      title: "",
    },
    layout: {
      preset: "content-grid",
    },
    sections: []
  },
  culture: {
    _id: "",
    id: "",
  },
  description: "",
  economy: {
    description: "",
    exports: [],
    imports: [],
  },
  history: {
    details: "",
    events: [],
  },
  id: 0,
  location: "",
  languages: [],
  name: "",
  nameFull: "",
  political: {
    diplomacy: [],
    form: "",
    formName: "",
    leaders: [],
    military: [],
    neighbors: [],
    ruler: [],
  },
  population: {
    total: "",
    rural: "",
    urban: "",
  },
  tags: [],
  type: "",
  warCampaigns: [],
  aliases: [],
  pronounced: "",
  theme: "",
  planetPlane: "",
  religions: [],
  terrain: "",
});
