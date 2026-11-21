import type {
  TLCityProduction,
  TLDeal,
  TLDemandCategory,
  TLEconomyParty,
  TLGood,
  TLMapEconomy,
  TLMarket,
  TLTariffRule,
  TLProductionCandidate,
  TLMapInfo,
} from "../../../definitions/TerraLogger";

import {
  aggregateCountryProduction,
  aggregateEconomyTrade,
  formatDealAttributionIssue,
  normalizeTradeEntries,
} from "../../Util/economy";

function readRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function readList(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${label} must be a list.`);
  return value;
}

function readText(value: unknown, label: string): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string.`);
  return value;
}

function readNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number.`);
  }
  return value;
}

function readAmount(value: unknown, label: string): number {
  const amount = readNumber(value, label);
  if (amount < 0) throw new Error(`${label} cannot be negative.`);
  return amount;
}

function readId(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer.`);
  }
  return value;
}

function readNumberMap(
  value: unknown,
  label: string,
  numericKeys = false,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(readRecord(value, label)).map(([key, amount]) => {
      if (numericKeys) readId(Number(key), `${label} key`);
      return [key, readNumber(amount, `${label}[${key}]`)];
    }),
  );
}

function normalizeGood(value: unknown): TLGood {
  const source = readRecord(value, "Good");
  const good: TLGood = {
    id: readId(source.i, "Good ID"),
    name: readText(source.name, "Good name"),
    tags: readList(source.tags, "Good tags").map((tag) => readText(tag, "Good tag")),
    value: readAmount(source.value, "Good value"),
    unit: readText(source.unit, "Good unit"),
    icon: readText(source.icon, "Good icon"),
    color: readText(source.color, "Good color"),
  };

  if (source.visible !== undefined) {
    if (typeof source.visible !== "boolean") {
      throw new Error("Good visibility must be a boolean.");
    }
    good.visible = source.visible;
  }
  if (source.chance !== undefined) good.chance = readNumber(source.chance, "Good chance");
  if (source.distribution !== undefined) {
    good.distribution = readText(source.distribution, "Good distribution");
  }
  if (source.biomeOutput !== undefined) {
    good.biomeOutput = readNumberMap(source.biomeOutput, "Biome output", true);
  }
  if (source.recipes !== undefined) {
    good.recipes = readList(source.recipes, "Good recipes")
      .map((recipe) => readNumberMap(recipe, "Good recipe", true));
  }
  if (source.multipliers !== undefined) {
    const multipliers = readRecord(source.multipliers, "Good multipliers");
    good.multipliers = {};
    for (const field of ["cultureType", "culture", "state", "religion", "biome", "zone"] as const) {
      if (multipliers[field] !== undefined) {
        good.multipliers[field] = readNumberMap(
          multipliers[field], `Good ${field} multipliers`, field !== "cultureType",
        );
      }
    }
  }
  if (source.demandCoverage !== undefined) {
    const coverage = readNumberMap(source.demandCoverage, "Demand coverage");
    const categories: readonly string[] = ["food", "utilities", "construction", "military", "luxury"];
    good.demandCoverage = {};
    for (const [category, amount] of Object.entries(coverage)) {
      if (!categories.includes(category)) {
        throw new Error(`Unknown demand category: ${category}.`);
      }
      good.demandCoverage[category as TLDemandCategory] = amount;
    }
  }

  return good;
}

function normalizeMarket(value: unknown): TLMarket {
  const source = readRecord(value, "Market");
  const goods = Object.entries(readRecord(source.goods, "Market goods"))
    .map(([goodId, value]) => {
      const stock = readRecord(value, "Market good");
      return {
        goodId: readId(Number(goodId), "Market good ID"),
        stock: readAmount(stock.stock, "Market stock"),
        price: readAmount(stock.price, "Market price"),
      };
    });
  const ids = new Set<number>();
  for (const good of goods) {
    if (ids.has(good.goodId)) throw new Error(`Duplicate market good ID: ${good.goodId}.`);
    ids.add(good.goodId);
  }

  return {
    id: readId(source.i, "Market ID"),
    centerCityId: readId(source.centerBurgId, "Market center city ID"),
    color: readText(source.color, "Market color"),
    ...(source.name === undefined ? {} : { name: readText(source.name, "Market name") }),
    goods,
  };
}

function normalizeParty(type: unknown, id: unknown): TLEconomyParty {
  if (type !== "burg" && type !== "market") {
    throw new Error("Deal party type must be burg or market.");
  }
  return { type: type === "burg" ? "city" : "market", id: readId(id, "Deal party ID") };
}

function normalizeDeal(value: unknown): TLDeal {
  const source = readRecord(value, "Deal");
  return {
    id: readId(source.i, "Deal ID"),
    seller: normalizeParty(source.sellerType, source.seller),
    buyer: normalizeParty(source.buyerType, source.buyer),
    goodId: readId(source.good, "Deal good ID"),
    units: readAmount(source.units, "Deal units"),
    price: readAmount(source.price, "Deal price"),
    tax: source.tax === undefined ? undefined : readAmount(source.tax, "Deal tax"),
    tariff: source.tariff === undefined ? undefined : readAmount(source.tariff, "Deal tariff"),
  };
}

// https://github.com/Azgaar/Fantasy-Map-Generator/blob/4536054599811565ee63fff365f28644ddcd29b7/src/generators/states-generator.ts
function normalizeTariffs(value: unknown): TLTariffRule[] | undefined {
  if (value === undefined) return undefined;
  const selector = (value: unknown, label: string): number[] | "all" =>
    value === "all" ? "all" : readList(value, label).map((id) => readId(id, label));
  return readList(value, "Country tariffs").map((value, index) => {
    const label = `Country tariff rule ${index}`;
    const rule = readRecord(value, label);
    const rate: TLTariffRule["rate"] = rule.rate === "embargo" ? "embargo" : readAmount(rule.rate, label);
    if (typeof rate === "number" && rate > 10) throw new Error(`${label} rate cannot exceed 10.`);
    return {
      countryIds: selector(rule.states, `${label} states`),
      goodIds: selector(rule.goods, `${label} goods`),
      rate,
    };
  });
}

function readCellIds(value: unknown, label: string): number[] {
  if (!Array.isArray(value) && !(value instanceof Uint16Array)) {
    throw new Error(`${label} must be a cell ID list.`);
  }
  return Array.from(value, (id) => readId(id, label));
}

function collectIds(records: readonly { id: number }[], label: string): Set<number> {
  const ids = new Set<number>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate ${label} ID: ${record.id}.`);
    ids.add(record.id);
  }
  return ids;
}

export function normalizeMapEconomy(
  pack: Pack,
  onIssue: (message: string) => void,
): TLMapEconomy | undefined {
  if (pack.goods === undefined && pack.markets === undefined && pack.deals === undefined &&
    pack.cells.good === undefined && pack.cells.market === undefined) return undefined;

  const economy: TLMapEconomy = {
    goods: pack.goods === undefined ? undefined : readList(pack.goods, "Goods").map(normalizeGood),
    markets: pack.markets === undefined ? undefined : readList(pack.markets, "Markets").map(normalizeMarket),
    deals: pack.deals === undefined ? undefined : readList(pack.deals, "Deals").map(normalizeDeal),
    cells: {
      good: pack.cells.good === undefined ? undefined : readCellIds(pack.cells.good, "Cell goods"),
      market: pack.cells.market === undefined ? undefined : readCellIds(pack.cells.market, "Cell markets"),
      country: readCellIds(pack.cells.state, "Cell countries"),
    },
  };

  const goodIds = collectIds(economy.goods ?? [], "good");
  const marketIds = collectIds(economy.markets ?? [], "market");
  collectIds(economy.deals ?? [], "deal");
  const cityIds = new Set(pack.burgs.filter((city) => city?.i && !city.removed).map((city) => city.i));

  const issues = new Set<string>();
  function reportIssue(message: string) {
    if (issues.has(message)) return;
    issues.add(message);
    onIssue(message);
  }

  function checkGood(id: number, label: string) {
    if (economy.goods === undefined) {
      reportIssue("Goods section is absent; good references cannot be resolved.");
      return;
    }
    if (!goodIds.has(id)) reportIssue(`${label} refers to missing good ${id}.`);
  }

  for (const good of economy.goods ?? []) {
    for (const recipe of good.recipes ?? []) {
      for (const id of Object.keys(recipe)) checkGood(Number(id), `Good ${good.id} recipe`);
    }
  }
  for (const market of economy.markets ?? []) {
    if (!cityIds.has(market.centerCityId)) {
      reportIssue(`Market ${market.id} refers to missing city ${market.centerCityId}.`);
    }
    for (const good of market.goods) checkGood(good.goodId, `Market ${market.id}`);
  }
  for (const deal of economy.deals ?? []) {
    checkGood(deal.goodId, `Deal ${deal.id}`);
    for (const party of [deal.seller, deal.buyer]) {
      if (party.type === "market" && economy.markets === undefined) {
        reportIssue("Markets section is absent; market references cannot be resolved.");
        continue;
      }
      const ids = party.type === "city" ? cityIds : marketIds;
      if (!ids.has(party.id)) {
        reportIssue(`Deal ${deal.id} refers to missing ${party.type} ${party.id}.`);
      }
    }
  }
  for (const id of economy.cells.good ?? []) {
    if (id !== 0) checkGood(id, "Cell resource");
  }
  for (const id of economy.cells.market ?? []) {
    if (id === 0) continue;
    if (economy.markets === undefined) {
      reportIssue("Markets section is absent; market references cannot be resolved.");
    } else if (!marketIds.has(id)) {
      reportIssue(`Cell refers to missing market ${id}.`);
    }
  }
  if (economy.cells.good && economy.cells.good.length !== economy.cells.country.length) {
    reportIssue("Cell goods count differs from the country assignment count.");
  }
  if (economy.cells.market && economy.cells.market.length !== economy.cells.country.length) {
    reportIssue("Cell market count differs from the country assignment count.");
  }

  return economy;
}

function normalizeProductionCandidate(value: unknown): TLProductionCandidate {
  const source = readRecord(value, "Production candidate");
  const category = source.demandCategory;
  if (category !== null && category !== "food" && category !== "utilities" &&
    category !== "construction" && category !== "military" && category !== "luxury") {
    throw new Error("Invalid production candidate demand category.");
  }

  const candidate: TLProductionCandidate = {
    goodId: readId(source.goodId, "Candidate good ID"),
    units: readAmount(source.units, "Candidate units"),
    sellPrice: readNumber(source.sellPrice, "Candidate sell price"),
    ingredientCost: readNumber(source.ingredientCost, "Candidate ingredient cost"),
    cultureModifier: readNumber(source.cultureModifier, "Candidate culture modifier"),
    demandCategory: category,
    demandMultiplier: readNumber(source.demandMultiplier, "Candidate demand multiplier"),
    score: readNumber(source.score, "Candidate score"),
    ingredients: readList(source.ingredients, "Candidate ingredients").map((value) => {
      const ingredient = readRecord(value, "Candidate ingredient");
      return {
        goodId: readId(ingredient.goodId, "Candidate ingredient good ID"),
        amount: readAmount(ingredient.amount, "Candidate ingredient amount"),
      };
    }),
  };

  if (source.goalGoodId !== undefined) {
    candidate.goalGoodId = readId(source.goalGoodId, "Candidate goal good ID");
  }
  if (source.isPreparation !== undefined) {
    if (typeof source.isPreparation !== "boolean") {
      throw new Error("Candidate preparation flag must be a boolean.");
    }
    candidate.isPreparation = source.isPreparation;
  }
  if (source.gainPerWorker !== undefined) {
    candidate.gainPerWorker = readNumber(source.gainPerWorker, "Candidate gain per worker");
  }
  if (source.workersNeeded !== undefined) {
    candidate.workersNeeded = readAmount(source.workersNeeded, "Candidate workers needed");
  }

  return candidate;
}

export function normalizeCityProduction(
  value: unknown,
): TLCityProduction[] | undefined {
  if (value === undefined) return undefined;

  return readList(value, "City production").map((value): TLCityProduction => {
    const source = readRecord(value, "City production entry");

    // Deal references do not contain production quantities or recipe inputs.
    if ("dealId" in source) {
      if ("goodId" in source || "units" in source || "recipe" in source ||
        "cultureModifier" in source || "candidates" in source) {
        throw new Error("A production deal reference cannot also contain production output.");
      }
      return {
        type: "deal",
        dealId: readId(source.dealId, "Production deal ID"),
      };
    }

    const goodId = readId(source.goodId, "Production good ID");
    const units = readAmount(source.units, "Production units");

    // An empty recipe still identifies manufacturing in the source format.
    if ("recipe" in source) {
      const production: Extract<TLCityProduction, { type: "manufacturing" }> = {
        type: "manufacturing",
        goodId,
        units,
        recipe: readList(source.recipe, "Production recipe").map((value) => {
          const ingredient = readRecord(value, "Production ingredient");
          return {
            goodId: readId(ingredient.goodId, "Production ingredient good ID"),
            units: readAmount(ingredient.units, "Production ingredient units"),
          };
        }),
      };

      // AFMG stores the combined production multiplier under this source name.
      if (source.cultureModifier !== undefined) {
        production.productionModifier = readNumber(
          source.cultureModifier, "Production modifier",
        );
      }
      if (source.candidates !== undefined) {
        production.candidates = readList(source.candidates, "Production candidates")
          .map(normalizeProductionCandidate);
      }
      return production;
    }

    if ("cultureModifier" in source || "candidates" in source) {
      throw new Error("Manufacturing details require a production recipe.");
    }
    return { type: "local", goodId, units };
  });
}

export function applyImportedEconomy(
  map: TLMapInfo,
  data: MapInfo,
  pack: Pack,
  onIssue: (message: string) => void,
): void {
  const issues = new Set<string>();
  function reportIssue(message: string) {
    if (issues.has(message)) return;
    issues.add(message);
    onIssue(message);
  }

  map.economy = normalizeMapEconomy(pack, reportIssue);
  const sourceCities = new Map(data.cities.map((city) => [city.i, city]));
  const sourceCountries = new Map(data.countries.map((country) => [country.i, country]));
  let hadImportedTrade = false;

  function retainAuthoredTrade(value: unknown) {
    return normalizeTradeEntries(value).filter((entry) => {
      if (entry.source !== "afmg") return true;
      hadImportedTrade = true;
      return false;
    });
  }

  for (const city of map.cities) {
    const source = sourceCities.get(city.id);
    if (!source) throw new Error(`Missing source economy for city ${city.id}.`);
    const current = city.economy;
    city.economy = {
      ...current,
      description: current?.description ?? "",
      imports: retainAuthoredTrade(current?.imports),
      exports: retainAuthoredTrade(current?.exports),
      production: normalizeCityProduction(source.production),
      marketId: source.market === undefined
        ? undefined : readId(source.market, "City market ID"),
      treasury: source.treasury === undefined
        ? undefined : readNumber(source.treasury, "City treasury"),
      product: source.product === undefined
        ? undefined : readAmount(source.product, "City product"),
    };
  }

  for (const country of map.countries) {
    const source = sourceCountries.get(country.id);
    if (!source) throw new Error(`Missing source economy for country ${country.id}.`);
    country.economy = {
      ...country.economy,
      imports: retainAuthoredTrade(country.economy.imports),
      exports: retainAuthoredTrade(country.economy.exports),
      production: undefined,
      treasury: source.treasury === undefined
        ? undefined : readNumber(source.treasury, "Country treasury"),
      tariffs: normalizeTariffs(source.tariffs),
      salesTax: source.salesTax === undefined
        ? undefined : readAmount(source.salesTax, "Country sales tax"),
      pollTax: source.pollTax === undefined
        ? undefined : readAmount(source.pollTax, "Country poll tax"),
    };
  }

  const production = aggregateCountryProduction(map.cities);
  for (const country of map.countries) {
    const summary = production.get(country.id);
    country.economy.production = summary && summary.reportedCityCount > 0
      ? summary : undefined;
  }

  const economy = map.economy;
  if (economy) {
    const goods = new Set((economy.goods ?? []).map((good) => good.id));
    const markets = new Set((economy.markets ?? []).map((market) => market.id));
    const deals = new Set((economy.deals ?? []).map((deal) => deal.id));
    function checkGood(id: number, cityId: number) {
      if (economy?.goods === undefined) {
        reportIssue("Goods section is absent; good references cannot be resolved.");
      } else if (!goods.has(id)) {
        reportIssue(`City ${cityId} production refers to missing good ${id}.`);
      }
    }

    for (const city of map.cities) {
      const marketId = city.economy?.marketId;
      if (marketId !== undefined && marketId !== 0 && !markets.has(marketId)) {
        reportIssue(`City ${city.id} refers to missing market ${marketId}.`);
      }
      for (const entry of city.economy?.production ?? []) {
        if (entry.type === "deal") {
          if (!deals.has(entry.dealId)) {
            reportIssue(
              "City " + city.id + " production refers to unavailable deal " +
              entry.dealId + ".",
            );
          }
        } else {
          checkGood(entry.goodId, city.id);
          if (entry.type === "manufacturing") {
            for (const ingredient of entry.recipe) checkGood(ingredient.goodId, city.id);
          }
        }
      }
    }

    const trade = aggregateEconomyTrade(map.cities, map.countries, economy);
    economy.unresolvedDealIds = trade?.unresolvedDealIds;
    economy.unresolvedDealIssues = trade?.unresolvedDealIssues;
    economy.tradeAttribution = trade ? "current-party-ownership" : undefined;
    if (trade) {
      for (const city of map.cities) {
        const totals = trade.cities.get(city.id);
        if (!totals || !city.economy) throw new Error(`Missing trade totals for city ${city.id}.`);
        city.economy.imports = [...(city.economy.imports ?? []), ...totals.imports];
        city.economy.exports = [...(city.economy.exports ?? []), ...totals.exports];
      }
      for (const country of map.countries) {
        const totals = trade.countries.get(country.id);
        if (!totals) throw new Error(`Missing trade totals for country ${country.id}.`);
        country.economy.imports.push(...totals.imports);
        country.economy.exports.push(...totals.exports);
      }
      if (trade.unresolvedDealIds.length > 0) {
        reportIssue(
          trade.unresolvedDealIds.length +
          " deals have unresolved party countries and are excluded from country trade totals.",
        );
        const reportedReasons = new Set<string>();
        for (const issue of trade.unresolvedDealIssues) {
          if (reportedReasons.has(issue.reason)) continue;
          reportedReasons.add(issue.reason);
          reportIssue(`Example — Deal #${issue.dealId}: ${formatDealAttributionIssue(issue)}`);
        }
      }
    } else {
      reportIssue("Deals section is absent; imported trade totals are unavailable.");
    }
  } else if (hadImportedTrade) {
    reportIssue(
      "The uploaded map has no shared economy; previous AFMG trade summaries were removed. Authored entries were retained.",
    );
  }

  // Keep embedded snapshots aligned with the canonical cities after aggregation.
  for (const country of map.countries) {
    country.cities = map.cities.filter((city) => city.country.id === country.id);
  }
}
