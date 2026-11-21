import type { TLMapHistoryConfiguration } from "./History";
// src/definitions/TerraLogger.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

// TL_Map Interfaces
import type { Tag } from "./Common";
import type { AtlasContent } from "./Atlas";
import type { TLHistoryEraReference } from "./History";

export type TLOrdinary = {
  ordinary?: string;
  t?: string;
  t2?: string;
  stretch?: number;
  x?: number;
  y?: number;
  angle?: number;
  stroke?: string;
  strokeWidth?: number;
  compony?: number;
  gyronny?: number;
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
  stretch?: number;
  x?: number;
  y?: number;
  angle?: number;
  layered?: boolean;
  outside?: "above" | "below" | "around";
};

export type TLDivision = {
  division?: string;
  t?: string;
  line?: string;
};

export type TLCoAInscription = {
  text: string;
  font: string;
  size: number;
  color: string;
  path: string;
  bold?: boolean;
  italic?: boolean;
  spacing?: number;
  shadow?: { x: number; y: number; blur: number; color: string };
};

export type TLCoA = {
  icon?: string;
  custom?: boolean;
  size?: number;
  x?: number;
  y?: number;
  t1?: string;
  division?: TLDivision;
  ordinaries?: TLOrdinary[];
  charges?: TLCharge[];
  shield?: string;
  line?: string;
  inscriptions?: TLCoAInscription[];
  diaper?: string;
  zoom?: number;
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
  importedNote?: { name: string; legend: string };
  importedTravel?: {
    name: string;
    legend: string;
    color?: string;
  };
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
  cellId?: number;
  aliases?: string[];
  capital: boolean;
  coa?: TLCoA;
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
    exports?: TLTradeEntry[];
    imports?: TLTradeEntry[];
    production?: TLCityProduction[];
    marketId?: number;
    treasury?: number;
    product?: number;
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
  coa?: TLCoA;
  coaSVG: string;
  color: string;
  content?: AtlasContent;
  culture: { _id: string; id: string; };
  description: string;
  economy: {
    description: string;
    exports: TLTradeEntry[];
    imports: TLTradeEntry[];
    production?: TLCountryProduction;
    treasury?: number;
    salesTax?: number;
    pollTax?: number;
  };
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

export type NPCCatalogRecordSnapshot = {
  id: string;
  name: string;
  source: "default" | "user";
  version: number;
};

export type NPCDisplayReference = {
  id: string;
  name: string;
};

export type NPCEntityType = "country" | "city" | "culture" | "religion" | "npc";

export type NPCRelationship = {
  id: string;
  relatedEntityType: NPCEntityType;
  relatedEntityId: string;
  relationshipType: string;
  roleTitle?: string;
  primary?: boolean;
  createdAt: string;
  updatedAt: string;
  source: "manual" | "contextual" | "map-generation" | "history";
};

export type NPCHistoryEntry = {
  id: string;
  year?: number;
  era?: TLHistoryEraReference;
  title: string;
  description: string;
  category?: string;
  source: "generated" | "authored";
  createdAt: string;
};

export type NPCPortrait =
  | { kind: "placeholder" }
  | { kind: "url"; value: string }
  | {
    kind: "uploaded";
    data: string;
    mimeType: string;
    originalFileName?: string;
  };

export type NPCGenerationTrace = {
  generator: "terra-logger/npc";
  generatorVersion: string;
  generatedAt: string;
  mode: "manual" | "contextual" | "map-population" | "migration";
  constraints?: Record<string, string>;
  catalogs: {
    ancestry?: NPCCatalogRecordSnapshot;
    gender?: NPCCatalogRecordSnapshot;
    profession?: NPCCatalogRecordSnapshot;
    government?: NPCCatalogRecordSnapshot;
    governmentRole?: NPCDisplayReference;
  };
};

export type TLNPC = {
  _id: string;
  mapId: string;
  name: string;
  fullName: string;
  nickName: string;
  aliases: string[];
  pronouns: string[];
  pronounced: string;
  ancestry?: NPCDisplayReference;
  heritage: string;
  gender?: NPCDisplayReference;
  age: number | "";
  sexuality: string;
  alignment: string;
  condition: string;
  profession?: NPCDisplayReference & { description?: string };
  appearance: {
    build?: string;
    skinTone?: string;
    complexion?: string;
    eyeShape?: string;
    eyeColor?: string;
    hairStyle?: string;
    hairColor?: string;
    facialHair?: string;
    descriptors?: string;
  };
  personality: {
    demeanor?: string;
    activities?: string;
  };
  background: string;
  aspirationsMotivations: string;
  publicPerception: string;
  hiddenDetails: string;
  currentLocation?: NPCDisplayReference;
  ownedLocations: NPCDisplayReference[];
  groups: NPCDisplayReference[];
  religions: NPCDisplayReference[];
  notes: NPCDisplayReference[];
  tags: Tag[];
  portrait: NPCPortrait;
  relationships: NPCRelationship[];
  content?: AtlasContent;
  history: NPCHistoryEntry[];
  generation?: NPCGenerationTrace;
  createdAt: string;
  updatedAt: string;
};


// Independent Terra-Logger records; older saved maps retain list-based icon pools.
export type TLBiome = {
  i: number;
  name: string;
  color: string;
  habitability: number;
  iconsDensity: number;
  icons: string[] | Record<string, { weight: number; size?: number }>;
  cost: number;
  removed?: boolean;
};

export type TLCustomIcon = {
  id: string;
  kind: "svg" | "image";
  content: string;
  viewBox: string;
};

// Cell assignments share the map biome catalog; country IDs are AFMG source IDs.
export type TLMapGeography = {
  cells: {
    biome: number[];
    country: number[];
  };
};

// Original AFMG rendering inputs, kept separate from editable Atlas entities.
// Keys are zero-based .map section indexes; values retain their source encoding.
export type TLMapRenderingSource = {
  version: string;
  sections: Partial<Record<number, string>>;
};

// Render-ready placement, constructed independently from AFMG source types.
export type TLMapEmblem = {
  id: string;
  entityId: number;
  type: "burg" | "province" | "state";
  x: number;
  y: number;
  size: number;
  fx?: number;
  fy?: number;
};

export interface TLMapInfo {
  renderingSource?: TLMapRenderingSource;
  biomes?: TLBiome[];
  geography?: TLMapGeography;
  economy?: TLMapEconomy;
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
  npcs: TLNPC[];
  religions: TLReligion[];
  historyGenerator?: TLMapHistoryConfiguration;
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
      [option: string]: unknown;
      pinNotes: boolean;
      winds: Array<number>;
      temperatureEquator: number;
      temperatureNorthPole: number;
      temperatureSouthPole: number;
      stateLabelsMode?: string;
      year: number;
      era: string;
      eraShort: string;
      militaryTypes: TLMilitaryType[];
      customIcons?: TLCustomIcon[];
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
  renderingSource?: TLMapRenderingSource;
  biomes?: TLBiome[];
  geography?: TLMapGeography;
  economy?: TLMapEconomy;
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
  historyGenerator?: TLMapHistoryConfiguration;
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
      [option: string]: unknown;
      pinNotes: boolean;
      winds: Array<number>;
      temperatureEquator: number;
      temperatureNorthPole: number;
      temperatureSouthPole: number;
      stateLabelsMode?: string;
      year: number;
      era: string;
      eraShort: string;
      militaryTypes: TLMilitaryType[];
      customIcons?: TLCustomIcon[];
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
  [option: string]: unknown;
  mapSize?: number;
  latitude?: number;
  prec?: number;
  pinNotes: boolean;
  winds: number[];
  temperatureEquator: number;
  temperatureNorthPole: number;
  temperatureSouthPole: number;
  stateLabelsMode?: string;
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

export type TLGoodReference =
  | { goodId: number }
  | { name: string };

export type TLTradeEntry =
  | {
      source: "afmg";
      good: { goodId: number };
      units: number;
      dealIds: number[];
    }
  | {
      source: "manual" | "legacy";
      good: TLGoodReference;
      units?: number;
    };

export type TLDemandCategory = "food" | "utilities" | "construction" | "military" | "luxury";

export type TLGood = {
  id: number;
  name: string;
  tags: string[];
  value: number;
  unit: string;
  icon: string;
  color: string;
  visible?: boolean;
  chance?: number;
  distribution?: string;
  biomeOutput?: Partial<Record<number, number>>;
  recipes?: Record<number, number>[];
  multipliers?: {
    cultureType?: Record<string, number>;
    culture?: Partial<Record<number, number>>;
    state?: Partial<Record<number, number>>;
    religion?: Partial<Record<number, number>>;
    biome?: Partial<Record<number, number>>;
    zone?: Partial<Record<number, number>>;
  };
  demandCoverage?: Partial<Record<TLDemandCategory, number>>;
};

export type TLMarket = {
  id: number;
  centerCityId: number;
  color: string;
  name?: string;
  goods: { goodId: number; stock: number; price: number }[];
};

export type TLEconomyParty = {
  type: "city" | "market";
  id: number;
};

export type TLDeal = {
  id: number;
  seller: TLEconomyParty;
  buyer: TLEconomyParty;
  goodId: number;
  units: number;
  price: number;
  tax?: number;
};

export type TLDealAttributionIssue = {
  dealId: number;
  party: "seller" | "buyer";
  reason:
    | "missing-city"
    | "missing-market"
    | "missing-market-center"
    | "unaffiliated-party"
    | "missing-country";
  referenceId: number;
};

export type TLMapEconomy = {
  goods?: TLGood[];
  markets?: TLMarket[];
  deals?: TLDeal[];
  unresolvedDealIds?: number[];
  unresolvedDealIssues?: TLDealAttributionIssue[];
  tradeAttribution?: "current-party-ownership";
  cells: {
    good?: number[];
    market?: number[];
    country: number[];
  };
};

export type TLProductionCandidate = {
  goodId: number;
  units: number;
  sellPrice: number;
  ingredientCost: number;
  cultureModifier: number;
  demandCategory: TLDemandCategory | null;
  demandMultiplier: number;
  score: number;
  ingredients: { goodId: number; amount: number }[];
  goalGoodId?: number;
  isPreparation?: boolean;
  gainPerWorker?: number;
  workersNeeded?: number;
};

export type TLCityProduction =
  | { type: "local"; goodId: number; units: number }
  | {
      type: "manufacturing";
      goodId: number;
      units: number;
      recipe: { goodId: number; units: number }[];
      productionModifier?: number;
      candidates?: TLProductionCandidate[];
    }
  | { type: "deal"; dealId: number };

export type TLCountryProduction = {
  cityCount: number;
  reportedCityCount: number;
  goods: {
    goodId: number;
    localUnits: number;
    manufacturedUnits: number;
  }[];
};
