export interface Culture {
  base: number;
  center?: number;
  code?: string;
  color?: string;
  expansionism?: number;
  i: number;
  name: string;
  origins: number[];
  shield: string;
  type?: string;
}

export interface Country {
  alert?: number;
  area: number;
  burgs: number;
  campaigns?: { name: string; start: number; end: number }[];
  capital?: number;
  cells: number;
  center?: number;
  coa?: {
    t1: string;
    ordinaries: { ordinary: string; t: string; line: string }[];
    charges: { charge: string; t: string; p: string; size: number }[];
    shield: string;
  };
  color?: string;
  culture?: number;
  diplomacy: string[];
  expansionism?: number;
  form?: string;
  formName?: string;
  fullName?: string;
  i: number;
  military?: {
    i: number;
    a: number;
    cell: number;
    x: number;
    y: number;
    bx: number;
    by: number;
    u: {
      archers?: number;
      cavalry?: number;
      infantry?: number;
      artillery?: number;
      fleet?: number;
    };
    n: number;
    name: string;
    state: number;
    icon: string;
  }[];
  name: string;
  neighbors: number[];
  pole?: number[];
  provinces: number[];
  rural: number;
  type?: string;
  urban: number;
}

export interface City {
  capital: number;
  cell: number;
  citadel: number;
  coa: {
    t1: string;
    ordinaries: {
      ordinary: string;
      t: string;
      line: string;
    }[];
    charges: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield: string;
  };
  culture: number;
  feature: number;
  i: number;
  name: string;
  plaza: number;
  population: number;
  port: number;
  shanty: number;
  state: number;
  temple: number;
  type: string;
  walls: number;
  x: number;
  y: number;
}

export interface Religion {
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
}

export interface Note {
  id: string;
  legend: string;
  name: string;
}

export interface Option {
  pinNotes: boolean;
  showMFCGMap: boolean;
  winds: number[];
  temperatureEquator: number;
  temperatureNorthPole: number;
  temperatureSouthPole: number;
  stateLabelsMode: string;
  year: number;
  era: string;
  eraShort: string;
  military: Military[];
}

interface Military {
  crew: number;
  icon: string;
  name: string;
  power: number;
  rural: number;
  separate: number;
  type: string;
  urban: number;
}

export interface NameBase {
  name: string;
  min: string;
  max: string;
  d: string;
  m: string;
  b: string;
}
