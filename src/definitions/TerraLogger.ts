// src/definitions/TerraLogger.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

// TL_Map Interfaces
import type { Tag } from "./Common";

export type TLOrdinary = {
  ordinary?: string;
  t?: string;
  line?: string;
  size?: number;
  above?: boolean;
  divided?: string;
};

export type TLCharge = {
  charge?: string | undefined;
  t?: string;
  t2?: string;
  t3?: string;
  p?: string;
  size?: number;
  divided?: string;
  stroke?: string;
  sinister?: boolean;
  reversed?: boolean;
};

export type TLDivision = {
  division?: string;
  t?: string;
  line?: string;
};

export type TLCoA = {
  t1?: string;
  division?: TLDivision;
  ordinaries?: TLOrdinary[];
  charges?: TLCharge[];
  shield?: string;
  line?: string;
};

export type TLCulture = {
  _id: string;
  base: number;
  code: string;
  color: string;
  expansionism: number;
  id: number;
  mapId?: string;
  name: string;
  origins: number[];
  ruralPop: string;
  shield: string;
  tags: Tag[];
  type: string;
  urbanPop: string;
};

export type TLDiplomacy = {
  name: string;
  status: string;
  id: number;
};

export type TLNeighbor = {
  name: string;
  id: number;
  _id: string;
};

export type TLMilitaryType = {
  icon: string;
  name: string;
  rural: number;
  urban: number;
  crew: number;
  power: number;
  type: string;
  separate: number;
};

export type TLMilitary = {
  _id: string;
  id: number;
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
export type TLNote = {
  id: string;
  legend: string;
  mapId?: string;
  name: string;
  _id: string;
};

export type TLReligion = {
  _id: string;
  center: {
    i: number;
    _id: string;
    name: string;
  };
  code: string;
  culture: {
    _id: string;
    id: string;
  };
  deity: string;
  description: string;
  form: string;
  i: number;
  members: {
    rural: number;
    urban: number;
  };
  name: string;
  origins: string[];
  tags: Tag[];
  type: string;
};

export type TLNameBase = {
  name: string;
  min: string;
  max: string;
  d: string;
  m: string;
  mapId?: string;
  names: string[];
  credit: string;
  _id: string;
};

export type TLCity = {
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
  coaSVG: string;
  country: {
    _id: string;
    govForm: string;
    govName: string;
    id: number;
    name: string;
    nameFull: string;
  };
  culture: {
    id: string;
    _id: string;
  };
  features: string[];
  id: number;
  mapLink: string;
  mapSeed: string;
  mapId?: string;
  name: string;
  population: string;
  size: string;
  tags: Tag[];
  type: string;
  description: string;
};

export type TLCountry = {
  _id: string;
  cities: TLCity[];
  coa?: {
    t1?: string;
    division?: {
      division: string;
      t: string;
      line: string;
    };
    charges?: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield?: string;
  };
  coaSVG: string;
  color: string;
  culture: {
    _id: string;
    id: string;
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
  mapId?: string;
  name: string;
  nameFull: string;
  political: {
    diplomacy: TLDiplomacy[];
    form: string;
    formName: string;
    leaders: string[];
    military: TLMilitary[];
    neighbors: TLNeighbor[];
    ruler: string[];
  };
  population: {
    total: string;
    rural: string;
    urban: string;
  };
  tags: Tag[];
  type: string;
  warCampaigns: {
    title: string;
    start: number;
    end: number;
  }[];
};

export interface TLMapInfo {
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
    populationRate: number;
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

export interface MapInf {
  id: string;
  info: {
    name: string;
    seed: string;
    width: number;
    height: number;
    ID: string;
    ver: string;
  };
  mapId: string;
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
    populationRate: number;
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
