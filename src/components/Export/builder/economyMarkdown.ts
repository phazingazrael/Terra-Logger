import type { TLCity, TLCountry } from "../../../definitions/TerraLogger";
import type { ExportContext } from "./exportTypes";
import { isAtlasContent } from "../../atlas/core/validators";
import {
  formatDealAttributionIssue,
  formatEconomyNumber,
  formatTradeEntry,
  hasEconomyBinding,
  normalizeTradeEntries,
} from "../../Util/economy";
import { renderAtlasSectionByLabelToMarkdown } from "./atlasContentMarkdown";
import { markdownList, markdownTable } from "./markdownUtils";

export function renderEconomySection(
  context: ExportContext,
  options: { calloutBody?: boolean } = {},
): string {
  if (context.sourceType !== "city" && context.sourceType !== "country") return "";
  const city = context.sourceType === "city"
    ? context.entity as unknown as TLCity : undefined;
  const country = context.sourceType === "country"
    ? context.entity as unknown as TLCountry : undefined;
  const economy = city?.economy ?? country?.economy;
  const shared = context.data.MapInfo.economy;
  const imports = normalizeTradeEntries(economy?.imports);
  const exports = normalizeTradeEntries(economy?.exports);
  const content = context.entity.content;
  const section = isAtlasContent(content) ? content.sections.find((section) =>
    /^(economy|economy & trade)$/i.test(section.title.trim()) ||
    /economy/i.test(section.wrapper.className ?? "")) : undefined;
  const authored = renderAtlasSectionByLabelToMarkdown({
    entity: context.entity,
    sourceType: context.sourceType,
    data: context.data,
    labels: ["Economy & Trade", "Economy"],
  }).replace(/^#{1,6} [^\n]+\n*/, "");
  const hasImported = shared !== undefined || economy?.treasury !== undefined ||
    city?.economy?.production !== undefined || city?.economy?.product !== undefined ||
    city?.economy?.marketId !== undefined || country?.economy.production !== undefined ||
    country?.economy.salesTax !== undefined || country?.economy.pollTax !== undefined;
  if (!authored && !hasImported && imports.length === 0 &&
    exports.length === 0 && !economy?.description) return "";

  const goods = new Map((shared?.goods ?? []).map((good) => [good.id, good]));
  const deals = new Map((shared?.deals ?? []).map((deal) => [deal.id, deal]));
  const unresolvedReasons = new Map<number, string[]>();
  for (const issue of shared?.unresolvedDealIssues ?? []) {
    const reasons = unresolvedReasons.get(issue.dealId) ?? [];
    reasons.push(formatDealAttributionIssue(issue));
    unresolvedReasons.set(issue.dealId, reasons);
  }
  const cities = new Map(context.data.Cities.map((city) => [city.id, city]));
  function formatGood(id: number, units?: number) {
    return formatTradeEntry(
      { source: "manual", good: { goodId: id }, units }, goods.get(id),
    );
  }
  function formatDeal(id: number) {
    const deal = deals.get(id);
    if (!deal) return `Unavailable deal #${id}`;
    const seller = deal.seller.type === "city"
      ? cities.get(deal.seller.id)?.name ?? `City #${deal.seller.id}`
      : `Market #${deal.seller.id}`;
    const buyer = deal.buyer.type === "city"
      ? cities.get(deal.buyer.id)?.name ?? `City #${deal.buyer.id}`
      : `Market #${deal.buyer.id}`;
    return "Deal #" + id + ": " + seller + " → " + buyer + "; " +
      formatGood(deal.goodId, deal.units) + "; price: " + deal.price +
      (deal.tax === undefined ? "" : `; tax: ${deal.tax}`);
  }

  const parts = [authored];
  if (economy?.description && !hasEconomyBinding(section, "economy.description")) {
    parts.push(economy.description);
  }
  for (const [label, path, entries] of [
    ["Imports", "economy.imports", imports],
    ["Exports", "economy.exports", exports],
  ] as const) {
    if (hasEconomyBinding(section, path)) continue;
    if (entries.length === 0 && shared?.deals === undefined) continue;
    parts.push(`### ${label}`, entries.length === 0 ? "No recorded entries." :
      markdownList(entries.map((entry) => {
        const good = "goodId" in entry.good ? goods.get(entry.good.goodId) : undefined;
        return formatTradeEntry(entry, good) + " (" + entry.source + ")" +
          (entry.source === "afmg" ? `; deals: ${entry.dealIds.join(", ")}` : "");
      })));
  }

  const finances: string[][] = [];
  if (economy?.treasury !== undefined) finances.push(["Treasury", String(economy.treasury)]);
  if (city?.economy?.product !== undefined) {
    finances.push(["Product", String(city.economy.product)]);
  }
  if (country?.economy.salesTax !== undefined) {
    finances.push(["Sales tax (source value)", String(country.economy.salesTax)]);
  }
  if (country?.economy.pollTax !== undefined) {
    finances.push(["Poll tax (source value)", String(country.economy.pollTax)]);
  }
  if (finances.length > 0) {
    parts.push("### AFMG finances", markdownTable(["Field", "Value"], finances));
  }

  if (city && hasImported) {
    const production = city.economy?.production;
    parts.push("### AFMG production");
    if (production === undefined) parts.push("Production data unavailable.");
    else if (production.length === 0) parts.push("No recorded production.");
    else parts.push(markdownList(production.map((entry) => {
      if (entry.type === "deal") return formatDeal(entry.dealId);
      const output = formatGood(entry.goodId, entry.units);
      if (entry.type === "local") return `${output} — local`;
      return output + " — manufactured; recipe inputs: " +
        (entry.recipe.map((input) => formatGood(input.goodId, input.units)).join(", ") ||
          "None recorded") +
        (entry.productionModifier === undefined ? "" :
          `; production modifier: ${entry.productionModifier}`);
    })));

    const marketId = city.economy?.marketId;
    if (marketId !== undefined) {
      const market = shared?.markets?.find((market) => market.id === marketId);
      parts.push(`### Market #${marketId}`);
      if (!market) parts.push("Market data unavailable.");
      else parts.push(
        `Center: ${cities.get(market.centerCityId)?.name ?? `City #${market.centerCityId}`}`,
        "Inventory belongs to the shared market.",
        markdownTable(["Good", "Stock", "Price"], market.goods.map((stock) => [
          formatGood(stock.goodId),
          formatEconomyNumber(stock.stock) + (goods.get(stock.goodId)?.unit
            ? ` ${goods.get(stock.goodId)?.unit}` : ""),
          String(stock.price),
        ])),
      );
    }
  }

  if (country && hasImported) {
    const production = country.economy.production;
    parts.push("### AFMG city production totals");
    if (!production) parts.push("Production data unavailable.");
    else parts.push(
      production.reportedCityCount + " of " + production.cityCount +
        " cities supplied production records. Rural production is not included.",
      markdownTable(["Good", "Local", "Manufactured", "Unit"],
        production.goods.map((good) => [
          formatGood(good.goodId), formatEconomyNumber(good.localUnits),
          formatEconomyNumber(good.manufacturedUnits), goods.get(good.goodId)?.unit ?? "",
        ])),
    );
    if (shared?.unresolvedDealIds?.length) {
      parts.push("### Map-wide unresolved country trade",
        "These deals have unresolved party countries and are not assigned to this country.",
        markdownList(shared.unresolvedDealIds.map((id) => [
          formatDeal(id), ...(unresolvedReasons.get(id) ?? []),
        ].join("; "))));
    }
  }
  if (hasImported) parts.push(shared?.deals === undefined
    ? "Imported trade data unavailable."
    : city
      ? "City imports are recorded purchases; exports are recorded sales."
      : "Country totals use current party ownership: City countries and AFMG market owners. " +
        "Goods origin and historical ownership are not recorded.");

  const body = parts.filter(Boolean).join("\n\n").trim();
  if (options.calloutBody) {
    return body.split("\n").map((line) => line ? `> ${line}` : ">").join("\n");
  }
  return `## Economy & Trade\n\n${body}`;
}
