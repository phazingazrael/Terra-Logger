// src/definitions/TerraLogger.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

// TL_Map Interfaces
interface TLMapInfo {
  cities: TLCity[];
  countries: TLCountry[];
  cultures: TLCulture[];
  info: {
    name: string;
    seed: string;
    width: number;
    height: number;
    ID: string;
  };
  nameBases: TLNameBase[];
  notes: TLNote[];
  npcs: {
    name: string;
  }[];
  params: string[];
  religions: TLReligion[];
  settings: {
    mapName: string;
    distanceUnit: string;
    distanceScale: string;
    areaUnit: string;
    heightUnit: string;
    heightExponent: string;
    temperatureScale: string;
    barSize: string;
    barLabel: string;
    barBackOpacity: string;
    barPosX: string;
    barPosY: string;
    populationRate: string;
    urbanization: string;
    mapSize: string;
    latitude0: string;
    prec: string;
    options: {
      pinNotes: boolean;
      winds: Array<number>;
      temperatureEquator: number;
      temperatureNorthPole: number;
      temperatureSouthPole: number;
      stateLabelsMode: string;
      year: number;
      era: string;
      eraShort: string;
      militaryTypes: TLMilitaryType[];
    };
    hideLabels: number;
    stylePreset: string;
    rescaleLabels: number;
    urbanDensity: number;
  };
  SVG: string;
  svgMod: string;
}

type TLCity = {
  _id: string;
  capital: boolean;
  coa: {
    t1: string;
    division: {
      division: string;
      t: string;
      line: string;
    };
    charges: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield: string;
  };
  country: {
    _id: string;
    govForm: string;
    govName: string;
    id: number;
    name: string;
    nameFull: string;
  };
  culture: string;
  features: string[];
  id: number;
  mapLink: string;
  name: string;
  population: string;
  size: string;
  tags: Tag[];
  type: string;
  description: string;
};
type TLCountry = {
  _id: string;
  cities: TLCity[];
  coa?: {
    t1: string;
    division: {
      division: string;
      t: string;
      line: string;
    };
    charges: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield: string;
  };
  color: string;
  culture: {
    origin: string;
    description: string;
  };
  description: string;
  economy: {
    description: string;
    exports: string[];
    imports: string[];
  };
  history: {
    details: string;
    events: string[];
  };
  id: number;
  location: string;
  languages: string[];
  name: string;
  nameFull: string;
  political: {
    diplomacy: TLDiplomacy[];
    form: string;
    formName: string;
    leaders: string[];
    military: TLMilitary[];
    neighbors: {
      name: string;
      id: number;
      _id: string;
    };
    ruler: string[];
  };
  population: {
    total: string;
    rural: string;
    urban: string;
  };
  tags: Tag[];
  type: string[];
  warCampaigns: {
    name: string;
    start: number;
    end: number;
  }[];
};

type TLCulture = {
  urbanPop: string;
  ruralPop: string;
  tags: Tag[];
  name: string;
  base: number;
  shield: string;
  id: number;
  color: string;
  type: string;
  expansionism: number;
  origins: number[];
  code: string;
  _id: string;
};

type TLDiplomacy = {
  name: string;
  status: string;
  id: number;
  _id: string;
};

type TLMilitaryType = {
  icon: string;
  name: string;
  rural: number;
  urban: number;
  crew: number;
  power: number;
  type: string;
  separate: number;
};

type TLMilitary = {
  i: number;
  a: number;
  cell: number;
  x: number;
  y: number;
  bx: number;
  by: number;
  u: {
    cavalry: number;
    archers: number;
    infantry: number;
    artillery: number;
  };
  n: number;
  name: string;
  state: number;
  icon: string;
};
type TLNote = {
  id: string;
  legend: string;
  name: string;
  _id: string;
};

type TLReligion = {
  i: number;
  name: string;
  culture: number;
  type: string;
  form: string;
  deity: string;
  origins: number[];
  code: string;
  _id: string;
};

type TLNameBase = {
  name: string;
  min: string;
  max: string;
  d: string;
  m: string;
  b: string;
  credit: string;
  _id: string;
};
