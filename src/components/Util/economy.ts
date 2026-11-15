import type {
  TLCountryProduction,
  TLDeal,
  TLDealAttributionIssue,
  TLEconomyParty,
  TLGood,
  TLMapEconomy,
  TLMarket,
  TLTradeEntry,
} from "../../definitions/Economy";
import type { TLCity, TLCountry } from "../../definitions/TerraLogger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isTradeEntry(value: unknown): value is TLTradeEntry {
  if (!isRecord(value) || !isRecord(value.good)) return false;

  const good = value.good;
  const hasId = Number.isInteger(good.goodId) && Number(good.goodId) >= 0;
  const hasName = typeof good.name === "string";
  const hasUnits = typeof value.units === "number" &&
    Number.isFinite(value.units) && value.units >= 0;

  if (value.source === "afmg") {
    return hasId && !("name" in good) && hasUnits &&
      Array.isArray(value.dealIds) &&
      value.dealIds.every((id) => Number.isInteger(id) && id >= 0);
  }

  if (value.source !== "manual" && value.source !== "legacy") return false;
  if (!(hasId && !("name" in good)) && !(hasName && !("goodId" in good))) {
    return false;
  }

  return value.units === undefined || hasUnits;
}

export function normalizeTradeEntries(value: unknown): TLTradeEntry[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new Error("Economy imports and exports must be lists.");
  }

  return value.map((entry, index): TLTradeEntry => {
    if (typeof entry === "string") {
      return { source: "legacy", good: { name: entry } };
    }
    if (isTradeEntry(entry)) return entry;

    throw new Error(`Invalid economy trade entry at index ${index}.`);
  });
}

export function isEconomyTradePath(path?: string): boolean {
  return path === "economy.imports" || path === "economy.exports";
}

const economyNumberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

export function formatEconomyNumber(value: number): string {
  if (value !== 0 && Math.abs(value) < 0.01) return value < 0 ? ">-0.01" : "<0.01";
  return economyNumberFormat.format(value === 0 ? 0 : value);
}

export function formatTradeEntry(
  entry: TLTradeEntry,
  good?: { name: string; unit: string },
): string {
  const name = "name" in entry.good
    ? entry.good.name
    : good?.name ?? `Unknown good #${entry.good.goodId}`;
  if (entry.units === undefined) return name;

  return `${name}: ${formatEconomyNumber(entry.units)}${good?.unit ? ` ${good.unit}` : ""}`;
}

export function aggregateCountryProduction(
  cities: readonly TLCity[],
): Map<number, TLCountryProduction> {
  const countries = new Map<number, TLCountryProduction>();
  const goodsByCountry = new Map<
    number,
    Map<number, TLCountryProduction["goods"][number]>
  >();
  const cityIds = new Set<number>();

  // Use canonical cities, not the snapshots stored inside country records.
  for (const city of cities) {
    if (cityIds.has(city.id)) {
      throw new Error(`Duplicate city ID in production totals: ${city.id}.`);
    }
    cityIds.add(city.id);

    const countryId = city.country.id;
    if (countryId === 0) continue;

    let country = countries.get(countryId);
    if (!country) {
      country = { cityCount: 0, reportedCityCount: 0, goods: [] };
      countries.set(countryId, country);
      goodsByCountry.set(countryId, new Map());
    }
    country.cityCount += 1;

    const production = city.economy?.production;
    if (production === undefined) continue;
    country.reportedCityCount += 1;

    const goods = goodsByCountry.get(countryId);
    if (!goods) throw new Error(`Missing production goods for country ${countryId}.`);
    for (const entry of production) {
      if (entry.type === "deal") continue;

      let good = goods.get(entry.goodId);
      if (!good) {
        good = {
          goodId: entry.goodId,
          localUnits: 0,
          manufacturedUnits: 0,
        };
        goods.set(entry.goodId, good);
      }

      // Output quantities already include AFMG's production modifiers.
      // Recipe inputs are consumption, so they do not enter these totals.
      if (entry.type === "local") {
        good.localUnits += entry.units;
      } else {
        good.manufacturedUnits += entry.units;
      }
      if (!Number.isFinite(good.localUnits) ||
        !Number.isFinite(good.manufacturedUnits)) {
        throw new Error("Production total exceeds the supported numeric range.");
      }
    }
  }

  for (const [countryId, country] of countries) {
    const goods = goodsByCountry.get(countryId);
    if (!goods) throw new Error(`Missing production goods for country ${countryId}.`);
    country.goods = [...goods.values()]
      .sort((a, b) => a.goodId - b.goodId);
  }
  return countries;
}

type AFMGTradeEntry = Extract<TLTradeEntry, { source: "afmg" }>;

type TradeTotals = {
  imports: AFMGTradeEntry[];
  exports: AFMGTradeEntry[];
};

export function aggregateEconomyTrade(
  cities: readonly TLCity[],
  countries: readonly TLCountry[],
  economy: TLMapEconomy,
): {
  cities: Map<number, TradeTotals>;
  countries: Map<number, TradeTotals>;
  unresolvedDealIds: number[];
  unresolvedDealIssues: TLDealAttributionIssue[];
} | undefined {
  if (economy.deals === undefined) return undefined;

  const cityById = new Map<number, TLCity>();
  const countryIds = new Set(countries.map((country) => country.id));
  const cityTotals = new Map<number, TradeTotals>();
  const countryTotals = new Map<number, TradeTotals>();
  for (const city of cities) {
    if (cityById.has(city.id)) {
      throw new Error(`Duplicate city ID in trade totals: ${city.id}.`);
    }
    cityById.set(city.id, city);
    cityTotals.set(city.id, { imports: [], exports: [] });
  }
  for (const country of countries) {
    if (countryTotals.has(country.id)) {
      throw new Error(`Duplicate country ID in trade totals: ${country.id}.`);
    }
    countryTotals.set(country.id, { imports: [], exports: [] });
  }

  const marketsById = new Map<number, TLMarket>();
  for (const market of economy.markets ?? []) {
    if (marketsById.has(market.id)) {
      throw new Error(`Duplicate market ID in trade totals: ${market.id}.`);
    }
    marketsById.set(market.id, market);
  }

  const unresolvedDealIssues: TLDealAttributionIssue[] = [];
  function getCountry(
    party: TLEconomyParty,
    side: "seller" | "buyer",
    dealId: number,
  ): number | undefined {
    function unresolved(
      reason: TLDealAttributionIssue["reason"],
      referenceId: number,
    ): undefined {
      unresolvedDealIssues.push({ dealId, party: side, reason, referenceId });
      return undefined;
    }

    let cityId = party.id;
    if (party.type === "market") {
      const market = marketsById.get(party.id);
      if (!market) return unresolved("missing-market", party.id);
      cityId = market.centerCityId;
    }
    const city = cityById.get(cityId);
    if (!city) return unresolved(
      party.type === "market" ? "missing-market-center" : "missing-city", cityId,
    );

    // AFMG identifies the center's country as the market owner and uses it for
    // market sales tax. This resolves current party ownership, not goods origin
    // or ownership when a historical deal was made.
    const id = city.country.id;
    // Zero is a valid unaffiliated classification, not a shared trade owner.
    if (id === 0) return 0;
    if (!countryIds.has(id)) return unresolved("missing-country", id);
    return id;
  }

  function addTrade(entries: AFMGTradeEntry[], deal: TLDeal) {
    let entry = entries.find((entry) => entry.good.goodId === deal.goodId);
    if (!entry) {
      entry = {
        source: "afmg",
        good: { goodId: deal.goodId },
        units: 0,
        dealIds: [],
      };
      entries.push(entry);
    }
    entry.units += deal.units;
    if (!Number.isFinite(entry.units)) {
      throw new Error("Trade total exceeds the supported numeric range.");
    }
    entry.dealIds.push(deal.id);
  }

  const unresolvedDealIds: number[] = [];
  const dealIds = new Set<number>();
  for (const deal of economy.deals) {
    if (dealIds.has(deal.id)) {
      throw new Error(`Duplicate deal ID in trade totals: ${deal.id}.`);
    }
    dealIds.add(deal.id);

    if (deal.seller.type === "city") {
      const totals = cityTotals.get(deal.seller.id);
      if (totals) addTrade(totals.exports, deal);
    }
    if (deal.buyer.type === "city") {
      const totals = cityTotals.get(deal.buyer.id);
      if (totals) addTrade(totals.imports, deal);
    }

    const seller = getCountry(deal.seller, "seller", deal.id);
    const buyer = getCountry(deal.buyer, "buyer", deal.id);
    if (seller === undefined || buyer === undefined) {
      unresolvedDealIds.push(deal.id);
      continue;
    }
    if (seller === buyer) continue;
    // City totals above retain neutral-to-neutral trade. Only affiliated
    // parties contribute to country totals; never pool neutral City trade.
    if (seller !== 0) {
      const sellerTotals = countryTotals.get(seller);
      if (!sellerTotals) throw new Error(`Missing seller country trade totals for deal ${deal.id}.`);
      addTrade(sellerTotals.exports, deal);
    }
    if (buyer !== 0) {
      const buyerTotals = countryTotals.get(buyer);
      if (!buyerTotals) throw new Error(`Missing buyer country trade totals for deal ${deal.id}.`);
      addTrade(buyerTotals.imports, deal);
    }
  }

  for (const totals of [...cityTotals.values(), ...countryTotals.values()]) {
    totals.imports.sort((a, b) => a.good.goodId - b.good.goodId);
    totals.exports.sort((a, b) => a.good.goodId - b.good.goodId);
    for (const entry of [...totals.imports, ...totals.exports]) {
      entry.dealIds.sort((a, b) => a - b);
    }
  }
  unresolvedDealIds.sort((a, b) => a - b);
  unresolvedDealIssues.sort((a, b) => a.dealId - b.dealId ||
    (a.party === b.party ? 0 : a.party === "seller" ? -1 : 1));

  return {
    cities: cityTotals,
    countries: countryTotals,
    unresolvedDealIds,
    unresolvedDealIssues,
  };
}

export function resolveTradeGood(
  entry: TLTradeEntry,
  goods?: readonly TLGood[],
): TLGood | undefined {
  if (!("goodId" in entry.good)) return undefined;
  const id = entry.good.goodId;
  return goods?.find((good) => good.id === id);
}

export function refreshCountryEconomies(
  cities: readonly TLCity[],
  countries: readonly TLCountry[],
  economy?: TLMapEconomy,
): {
  countries: TLCountry[];
  unresolvedDealIds: number[] | undefined;
  unresolvedDealIssues: TLDealAttributionIssue[] | undefined;
  tradeAttribution: TLMapEconomy["tradeAttribution"];
} {
  const production = aggregateCountryProduction(cities);
  const trade = economy ? aggregateEconomyTrade(cities, countries, economy) : undefined;

  return {
    countries: countries.map((country) => {
      const summary = production.get(country.id);
      const totals = trade?.countries.get(country.id);
      return {
        ...country,
        cities: cities.filter((city) => city.country.id === country.id),
        economy: {
          ...country.economy,
          production: summary && summary.reportedCityCount > 0 ? summary : undefined,
          imports: [
            ...normalizeTradeEntries(country.economy.imports)
              .filter((entry) => entry.source !== "afmg"),
            ...(totals?.imports ?? []),
          ],
          exports: [
            ...normalizeTradeEntries(country.economy.exports)
              .filter((entry) => entry.source !== "afmg"),
            ...(totals?.exports ?? []),
          ],
        },
      };
    }),
    unresolvedDealIds: trade?.unresolvedDealIds,
    unresolvedDealIssues: trade?.unresolvedDealIssues,
    tradeAttribution: trade ? "current-party-ownership" : undefined,
  };
}

export function formatDealAttributionIssue(issue: TLDealAttributionIssue): string {
  const labels: Record<TLDealAttributionIssue["reason"], string> = {
    "missing-city": "Missing City",
    "missing-market": "Missing market",
    "missing-market-center": "Missing market center City",
    "unaffiliated-party": "Party has no country (country ID)",
    "missing-country": "Missing Country",
  };
  return `${issue.party}: ${labels[issue.reason]} #${issue.referenceId}`;
}

export function hasEconomyBinding(value: unknown, path: string): boolean {
  if (Array.isArray(value)) return value.some((item) => hasEconomyBinding(item, path));
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.valueMode !== "static" &&
    (record.entityPath === path || record.path === path ||
      record.valuePath === path || record.childrenPath === path ||
      ((record.valueMode === "entity" || record.valueMode === "path") &&
        record.value === path))) return true;
  return Object.values(record).some((item) => hasEconomyBinding(item, path));
}

export function editImportedTradeDeals(
  economy: TLMapEconomy,
  entry: Extract<TLTradeEntry, { source: "afmg" }>,
  change: { type: "remove" } | { type: "update"; goodId?: number; units?: number },
): TLMapEconomy {
  const ids = new Set(entry.dealIds);
  if (change.type === "remove") {
    return { ...economy, deals: economy.deals?.filter((deal) => !ids.has(deal.id)) };
  }
  if (change.goodId !== undefined && (!Number.isInteger(change.goodId) || change.goodId < 0)) {
    throw new Error("Good ID must be a non-negative integer.");
  }
  if (change.units !== undefined && (!Number.isFinite(change.units) || change.units < 0)) {
    throw new Error("Trade quantity must be a finite non-negative number.");
  }
  const deals = economy.deals ?? [];
  const linked = deals.filter((deal) => ids.has(deal.id));
  if (linked.length === 0 || linked.length !== ids.size) {
    throw new Error("The linked deals are unavailable. Remove this entry or repair its deal references first.");
  }
  let originalRemaining = linked.reduce((total, deal) => total + deal.units, 0);
  if (!Number.isFinite(originalRemaining)) throw new Error("Linked trade quantity exceeds the supported range.");
  let remaining = change.units ?? originalRemaining;
  let count = linked.length;
  return { ...economy, deals: deals.map((deal) => {
    if (!ids.has(deal.id)) return deal;
    let units = deal.units;
    if (change.units !== undefined) {
      units = count === 1 ? remaining : originalRemaining > 0
        ? Math.min(remaining, remaining * (deal.units / originalRemaining)) : remaining / count;
      remaining -= units;
      originalRemaining = Math.max(0, originalRemaining - deal.units);
      count--;
    }
    return { ...deal, goodId: change.goodId ?? deal.goodId, units };
  }) };
}
