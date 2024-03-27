// src/definitions/AFMG.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

// AFMG interfaces
interface MapInfo {
  cities: City[];
  countries: Country[];
  cultures: Culture[];
  info: {
    name: string;
    seed: string;
    width: number;
    height: number;
    ID: string;
  };
  nameBases: NameBase[];
  notes: Note[];
  npcs: {
    name: string;
  }[];
  params: string[];
  religions: Religion[];
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
      militaryTypes: MilitaryType[];
    };
    hideLabels: number;
    stylePreset: string;
    rescaleLabels: number;
    urbanDensity: number;
  };
  SVG: string;
  svgMod: string;
}

type City = {
  cell: number;
  x: number;
  y: number;
  state: number;
  i: number;
  culture: number;
  name: string;
  feature: number;
  capital: number;
  port: number;
  population: number;
  type: string;
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
  citadel: number;
  plaza: number;
  walls: number;
  shanty: number;
  temple: number;
  mapLink?: string;
};
type Country = {
  i: number;
  color?: string;
  name: string;
  expansionism?: number;
  capital?: number;
  type?: string;
  center?: number;
  culture?: number;
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
  description: string;
  urban: number;
  rural: number;
  burgs: number;
  area: number;
  cells: number;
  neighbors: number[];
  campaigns?: {
    name: string;
    start: number;
    end: number;
  }[];
  diplomacy: string[];
  form?: string;
  formName?: string;
  fullName?: string;
  provinces: number[];
  pole?: [number, number];
  alert?: number;
  military?: {
    i: number;
    a: number;
    cell: number;
    x: number;
    y: number;
    bx: number;
    by: number;
    u: {
      archers: number;
      cavalry: number;
      artillery: number;
      infantry: number;
    };
    n: number;
    name: string;
    state: number;
    icon: string;
  }[];
};

type Culture = {
  name: string;
  base: number;
  shield: string;
  center: number;
  i: number;
  color?: string;
  type: string;
  origins: number[];
  expansionism?: number;
  code: string;
};

type MilitaryType = {
  icon: string;
  name: string;
  rural: number;
  urban: number;
  crew: number;
  power: number;
  type: string;
  separate: number;
};
type Note = {
  id: string;
  legend: string;
  name: string;
};

type Religion = {
  center?: number;
  code?: string;
  color?: string;
  culture?: number;
  deity?: string | null;
  expansion?: string;
  expansionism?: number;
  form?: string;
  i: number;
  name: string;
  origins: number[];
  type?: string;
};

type NameBase = {
  name: string;
  min: string;
  max: string;
  d: string;
  m: string;
  b: string;
};
