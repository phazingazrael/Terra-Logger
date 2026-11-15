export type EconomyField = {
  label?: string;
  optional?: boolean;
} & (
  | { type: "text" }
  | { type: "boolean" }
  | { type: "number"; integer?: boolean; signed?: boolean }
  | { type: "choice"; values: readonly (string | null)[] }
  | { type: "object"; fields: Record<string, EconomyField> }
  | { type: "array"; item: EconomyField }
  | { type: "map"; numericKeys?: boolean; item: EconomyField }
  | { type: "variant"; variants: Record<string, EconomyField> }
);

const number: EconomyField = { type: "number" };
const id: EconomyField = { type: "number", integer: true };
const text: EconomyField = { type: "text" };
const optionalNumber: EconomyField = { ...number, optional: true };
const numberMap: EconomyField = { type: "map", numericKeys: true, item: number };
const ingredient: EconomyField = { type: "object", fields: { goodId: id, units: number } };
const party: EconomyField = { type: "object", fields: {
  type: { type: "choice", values: ["city", "market"] }, id,
} };
const candidate: EconomyField = { type: "object", fields: {
  goodId: id, units: number, sellPrice: number, ingredientCost: number,
  cultureModifier: { type: "number", signed: true },
  demandCategory: { type: "choice", values: [null, "food", "utilities", "construction", "military", "luxury"] },
  demandMultiplier: { type: "number", signed: true }, score: { type: "number", signed: true },
  ingredients: { type: "array", item: { type: "object", fields: { goodId: id, amount: number } } },
  goalGoodId: { ...id, optional: true }, isPreparation: { type: "boolean", optional: true },
  gainPerWorker: { ...number, signed: true, optional: true }, workersNeeded: optionalNumber,
} };

export const productionField: EconomyField = { type: "array", item: {
  type: "variant", variants: {
    local: { type: "object", fields: { goodId: id, units: number } },
    manufacturing: { type: "object", fields: {
      goodId: id, units: number, recipe: { type: "array", item: ingredient },
      productionModifier: { type: "number", signed: true, optional: true },
      candidates: { type: "array", item: candidate, optional: true },
    } },
    deal: { type: "object", fields: { dealId: id } },
  },
} };

export const cityEconomyField: EconomyField = { type: "object", fields: {
  treasury: { type: "number", signed: true, optional: true }, product: optionalNumber,
  marketId: { ...id, optional: true }, production: { ...productionField, optional: true },
} };
export const countryEconomyField: EconomyField = { type: "object", fields: {
  treasury: { type: "number", signed: true, optional: true }, salesTax: optionalNumber, pollTax: optionalNumber,
} };

export const sharedEconomyField: EconomyField = { type: "object", fields: {
  goods: { type: "array", optional: true, item: { type: "object", fields: {
    id, name: text, tags: { type: "array", item: text }, value: number, unit: text, icon: text, color: text,
    visible: { type: "boolean", optional: true },
    chance: { type: "number", signed: true, optional: true }, distribution: { ...text, optional: true },
    biomeOutput: { ...numberMap, optional: true },
    recipes: { type: "array", item: numberMap, optional: true },
    multipliers: { type: "object", optional: true, fields: {
      cultureType: { type: "map", item: { type: "number", signed: true }, optional: true },
      ...Object.fromEntries(["culture", "state", "religion", "biome", "zone"].map((key) =>
        [key, { type: "map", numericKeys: true, item: { type: "number", signed: true }, optional: true } as EconomyField])),
    } },
    demandCoverage: { type: "object", optional: true, fields: Object.fromEntries(
      ["food", "utilities", "construction", "military", "luxury"].map((key) => [key, optionalNumber])),
    },
  } } },
  markets: { type: "array", optional: true, item: { type: "object", fields: {
    id, centerCityId: id, color: text,
    name: { ...text, optional: true },
    goods: { type: "array", item: { type: "object", fields: { goodId: id, stock: number, price: number } } },
  } } },
  deals: { type: "array", optional: true, item: { type: "object", fields: {
    id, seller: party, buyer: party, goodId: id, units: number, price: number, tax: optionalNumber,
  } } },
  cells: { type: "object", fields: {
    good: { type: "array", item: id, optional: true },
    market: { type: "array", item: id, optional: true }, country: { type: "array", item: id },
  } },
} };

export function defaultEconomyValue(field: EconomyField): unknown {
  switch (field.type) {
    case "text": return "";
    case "number": return 0;
    case "boolean": return false;
    case "choice": return field.values[0];
    case "array": return [];
    case "map": return {};
    case "object": return Object.fromEntries(Object.entries(field.fields)
      .filter(([, item]) => !item.optional).map(([key, item]) => [key, defaultEconomyValue(item)]));
    case "variant": {
      const type = Object.keys(field.variants)[0];
      return { ...defaultEconomyValue(field.variants[type]) as object, type };
    }
  }
}

export function validateEconomyValue(value: unknown, field: EconomyField, path: string): void {
  if (value === undefined && field.optional) return;
  const fail: () => never = () => { throw new Error(`Invalid economy value: ${path}.`); };
  if (field.type === "text") { if (typeof value !== "string") fail(); return; }
  if (field.type === "boolean") { if (typeof value !== "boolean") fail(); return; }
  if (field.type === "number") {
    if (typeof value !== "number" || !Number.isFinite(value) ||
      (!field.signed && value < 0) || (field.integer && !Number.isInteger(value))) fail();
    return;
  }
  if (field.type === "choice") { if (!field.values.includes(value as string | null)) fail(); return; }
  if (field.type === "array") {
    if (!Array.isArray(value)) fail();
    value.forEach((item, index) => {
      validateEconomyValue(item, field.item, `${path}[${index}]`);
    });
    return;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail();
  const record = value as Record<string, unknown>;
  if (field.type === "variant") {
    const variant = typeof record.type === "string" ? field.variants[record.type] : undefined;
    if (!variant) fail();
    validateEconomyValue(value, variant, path);
  } else if (field.type === "object") {
    for (const [key, item] of Object.entries(field.fields)) validateEconomyValue(record[key], item, `${path}.${key}`);
  } else {
    for (const [key, item] of Object.entries(record)) {
      if (field.numericKeys && (!/^\d+$/.test(key) || !Number.isSafeInteger(Number(key)))) fail();
      validateEconomyValue(item, field.item, `${path}.${key}`);
    }
  }
}
