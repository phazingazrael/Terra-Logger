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
