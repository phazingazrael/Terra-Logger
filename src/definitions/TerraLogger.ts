// src/definitions/TerraLogger.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

// TL_Map Interfaces
import type { Tag } from "./Common";
import type { AtlasContent } from "./Atlas";

export type TLOrdinary = {
  ordinary?: string;
  t?: string;
  line?: string;
  size?: number;
  above?: boolean;
  divided?: string;
};

export type TLCharge = {
  charge?: string;
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
  aliases?: string[];
  architecture?: string;
  arts?: string;
  base: number;
  code: string;
  color: string;
  content?: AtlasContent;
  cuisine?: string;
  description: string;
  dress?: string;
  ethnicGroups?: string[];
  expansionism: number;
  government?: string;
  id: number;
  language?: string;
  mapId?: string;
  name: string;
  notableFigures?: string[];
  origins: number[];
  pronounced?: string;
  region?: string;
  religions?: string[];
  ruralPop: string;
  shield: string;
  tags: Tag[];
  technologyLevel?: string;
  theme?: string;
  traditions?: string[];
  type: string;
  urbanPop: string;
  values?: string[];
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
  _id: string;
  content?: AtlasContent;
  id: string;
  legend: string;
  mapId?: string;
  name: string;
  tags: Tag[];
  type: string;
};

export type TLReligion = {
  _id: string;
  aliases?: string[];
  center: {
    i: number;
    _id: string;
    name: string;
  };
  code: string;
  content?: AtlasContent;
  culture: {
    _id: string;
    id: string;
  };
  deities?: string[];
  deity: string;
  description: string;
  domains?: string[];
  form: string;
  headquarters?: string;
  i: number;
  members: {
    rural: number;
    urban: number;
  };
  name: string;
  origins: string[];
  pronounced?: string;
  symbols?: string[];
  tags: Tag[];
  theme?: string;
  type: string;
};

export type TLNameBase = {
  _id: string;
  credit: string;
  d: string;
  m: string;
  mapId?: string;
  max: string;
  min: string;
  name: string;
  names: string[];
};

export type TLCity = {
  _id: string;
  aliases?: string[];
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
      p: string; size: number;
    }[];
    shield: string;
  };
  coaSVG: string;
  content?: AtlasContent;
  country: {
    _id: string;
    govForm: string;
    govName: string;
    id: number;
    name: string;
    nameFull: string;
  };
  culture: {
    _id: string;
    id: string;
    name: string;
  };
  defenses?: string;
  description: string;
  economy?: {
    description: string;
    exports?: string[];
    imports?: string[];
  };
  features: string[];
  id: number;
  leaders?: string[];
  mapId?: string;
  mapLink: string;
  mapSeed: string;
  name: string;
  population: string;
  pronounced?: string;
  religions?: string[];
  rulers?: string[];
  size: string;
  tags: Tag[];
  terrain?: string;
  theme?: string;
  type: string;
};

export type TLCountry = {
  _id: string;
  aliases?: string[];
  cities: TLCity[];
  coa?: { t1?: string; division?: { division: string; t: string; line: string; }; charges?: { charge: string; t: string; p: string; size: number; }[]; shield?: string; };
  coaSVG: string;
  color: string;
  content?: AtlasContent;
  culture: { _id: string; id: string; };
  description: string;
  economy: { description: string; exports: string[]; imports: string[]; };
  history: { details: string; events: string[]; };
  id: number;
  languages: string[];
  location: string;
  mapId?: string;
  name: string;
  nameFull: string;
  planetPlane?: string;
  political: { diplomacy: TLDiplomacy[]; form: string; formName: string; leaders: string[]; military: TLMilitary[]; neighbors: TLNeighbor[]; ruler: string[]; };
  population: { total: string; rural: string; urban: string; };
  pronounced?: string;
  religions?: string[];
  tags: Tag[];
  terrain?: string;
  theme?: string;
  type: string;
  warCampaigns: { title: string; start: number; end: number; }[];
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

export interface SettingsOpts {
  pinNotes: boolean;
  winds: number[];
  temperatureEquator: number;
  temperatureNorthPole: number;
  temperatureSouthPole: number;
  stateLabelsMode: string;
  year: number;
  era: string;
  eraShort: string;
  military: {
    icon: string;
    name: string;
    rural: number;
    urban: number;
    crew: number;
    power: number;
    type: string;
    separate: number;
  }[];
}
