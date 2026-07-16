import Mustache from "mustache";
import type { ExportContext, MarkdownBlock } from "./exportTypes";
import { renderEntityDescriptionBodyToMarkdown } from "./atlasContentMarkdown";

type MustacheContext = Record<string, unknown>;

const mustacheContextCache = new WeakMap<ExportContext, MustacheContext>();

export function createMustacheMarkdownBlock({
  id,
  template,
}: {
  id: string;
  template: string;
}): MarkdownBlock {
  return {
    id,

    render(context) {
      return renderMarkdownMustache(template, createMustacheContext(context));
    },
  };
}

function renderMarkdownMustache(
  template: string,
  context: Record<string, unknown>,
): string {
  const previousEscape = Mustache.escape;

  try {
    // Markdown templates should preserve apostrophes, brackets, links, etc.
    Mustache.escape = (value) => String(value ?? "");
    return Mustache.render(template, context);
  } finally {
    Mustache.escape = previousEscape;
  }
}

function createMustacheContext(context: ExportContext): MustacheContext {
  const cached = mustacheContextCache.get(context);

  if (cached) return cached;

  const singular = getSingularContextKey(context.sourceType);
  const overrides = createTemplateOverrides(context);

  const entity = {
    ...context.entity,
    ...overrides,
  };

  const result: MustacheContext = {
    ...context.data,
    ...entity,
    [singular]: entity,
  };

  mustacheContextCache.set(context, result);

  return result;
}

function createTemplateOverrides(
  context: ExportContext,
): Record<string, unknown> {
  switch (context.sourceType) {
    case "culture":
      return {
        origins: resolveCultureOrigins(context),
      };

    case "religion":
      return {
        description: renderEntityDescriptionBodyToMarkdown({
          entity: context.entity,
          sourceType: "religion",
          data: context.data,
        }),
        center: resolveReligionCenter(context),
        origins: resolveReligionOrigins(context),
      };

    case "city":
      return {
        country: resolveCityCountry(context),
        description: renderEntityDescriptionBodyToMarkdown({
          entity: context.entity,
          sourceType: "city",
          data: context.data,
        }),
      };
    case "country":
      return {
        description: renderEntityDescriptionBodyToMarkdown({
          entity: context.entity,
          sourceType: "country",
          data: context.data,
        }),
        cities: resolveCountryCities(context),
        population: resolveCountryPopulation(context),
        political: resolveCountryPolitical(context),
        warCampaigns: resolveCountryWarCampaigns(context),
      };

    default:
      return {};
  }
}

function resolveCultureOrigins(context: ExportContext): string[] {
  const rawOrigins =
    context.entity.origins ??
    context.entity.origin ??
    context.entity.originsIds ??
    context.entity.originIds;

  const originValues = Array.isArray(rawOrigins)
    ? rawOrigins
    : rawOrigins == null
      ? []
      : [rawOrigins];

  return originValues
    .map((origin) => resolveCultureOrigin(origin, context))
    .filter(Boolean);
}

function resolveCultureOrigin(
  origin: unknown,
  context: ExportContext,
): string {
  if (origin == null) return "";

  if (typeof origin === "object") {
    const record = origin as Record<string, unknown>;
    const name = readString(record, "name") || readString(record, "Name");

    if (name) return wikiLink(name);

    const id = readString(record, "id") || readString(record, "_id");
    if (id) return resolveCultureOriginById(id, context);
  }

  return resolveCultureOriginById(String(origin), context);
}

function resolveCultureOriginById(
  id: string,
  context: ExportContext,
): string {
  const cultures = Array.isArray(context.data.Cultures)
    ? context.data.Cultures
    : [];

  const match = cultures.find((culture) => {
    if (!culture || typeof culture !== "object") return false;

    const record = culture as Record<string, unknown>;

    return (
      String(record.id ?? "") === id ||
      String(record._id ?? "") === id
    );
  });

  if (!match || typeof match !== "object") return id;

  const record = match as Record<string, unknown>;
  const name =
    readString(record, "name") ||
    readString(record, "Name") ||
    readString(record, "title");

  return name ? wikiLink(name) : id;
}

function resolveReligionCenter(
  context: ExportContext,
): Record<string, unknown> {
  const rawCenter =
    context.entity.center ??
    context.entity.cultureCenter ??
    context.entity.originCenter;

  if (!rawCenter) return { name: "" };

  const centerName = resolveReligionCenterName(rawCenter, context);

  return {
    name: centerName,
  };
}

function resolveReligionCenterName(
  rawCenter: unknown,
  context: ExportContext,
): string {
  if (rawCenter == null) return "";

  if (typeof rawCenter === "string" || typeof rawCenter === "number") {
    return resolveNamedEntityReference(rawCenter, context);
  }

  if (typeof rawCenter !== "object") {
    return String(rawCenter);
  }

  const centerRecord = rawCenter as Record<string, unknown>;

  const directName = readString(centerRecord, "name") ||
    readString(centerRecord, "Name") ||
    readString(centerRecord, "title");

  if (directName && directName !== "[object Object]") {
    return wikiLink(directName);
  }

  const centerI = readString(centerRecord, "i");

  if (centerI) {
    const resolvedByI = resolveCenterByI(centerI, context);

    if (resolvedByI) return resolvedByI;
  }

  const centerId =
    readString(centerRecord, "id") ||
    readString(centerRecord, "_id");

  if (centerId) {
    return resolveNamedEntityReference(centerId, context);
  }

  return "";
}

function resolveCenterByI(
  centerI: string,
  context: ExportContext,
): string {
  const collections = [
    context.data.Cultures,
    context.data.Religions,
    context.data.Cities,
    context.data.Countries,
  ].filter(Array.isArray) as unknown[][];

  for (const collection of collections) {
    const match = collection.find((item) => {
      if (!item || typeof item !== "object") return false;

      const record = item as Record<string, unknown>;

      return String(record.i ?? "") === centerI;
    });

    if (!match || typeof match !== "object") continue;

    const record = match as Record<string, unknown>;

    const name =
      readString(record, "name") ||
      readString(record, "Name") ||
      readString(record, "nameFull") ||
      readString(record, "title");

    if (name) return wikiLink(name);
  }

  return "";
}

function resolveReligionOrigins(
  context: ExportContext,
): Array<{ origin: string }> {
  const rawOrigins =
    context.entity.origins ??
    context.entity.origin ??
    context.entity.originIds ??
    context.entity.originsIds;

  const originValues = Array.isArray(rawOrigins)
    ? rawOrigins
    : rawOrigins == null
      ? []
      : [rawOrigins];

  return originValues
    .map((origin) => resolveReligionOrigin(origin, context))
    .filter(Boolean)
    .map((origin) => ({ origin }));
}

function resolveReligionOrigin(
  origin: unknown,
  context: ExportContext,
): string {
  if (origin == null) return "";

  if (typeof origin === "object") {
    const record = origin as Record<string, unknown>;

    const name =
      readString(record, "name") ||
      readString(record, "Name") ||
      readString(record, "title");

    if (name) return wikiLink(name);

    const id = readString(record, "id") || readString(record, "_id");

    if (id) return resolveReligionOriginById(id, context);
  }

  return resolveReligionOriginById(String(origin), context);
}

function resolveReligionOriginById(
  id: string,
  context: ExportContext,
): string {
  const religions = Array.isArray(context.data.Religions)
    ? context.data.Religions
    : [];

  const match = religions.find((religion) => {
    if (!religion || typeof religion !== "object") return false;

    const record = religion as Record<string, unknown>;

    return (
      String(record.id ?? "") === id ||
      String(record._id ?? "") === id
    );
  });

  if (!match || typeof match !== "object") return id;

  const record = match as Record<string, unknown>;

  const name =
    readString(record, "name") ||
    readString(record, "Name") ||
    readString(record, "title");

  return name ? wikiLink(name) : id;
}

function resolveNamedEntityReference(
  value: unknown,
  context: ExportContext,
): string {
  if (value == null) return "";

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    const name =
      readString(record, "name") ||
      readString(record, "Name") ||
      readString(record, "nameFull") ||
      readString(record, "title");

    if (name) return wikiLink(name);

    const i = readString(record, "i");
    if (i) {
      const resolvedByI = resolveCenterByI(i, context);
      if (resolvedByI) return resolvedByI;
    }

    const id = readString(record, "id") || readString(record, "_id");
    if (id) return resolveNamedEntityReference(id, context);

    return "";
  }

  if (typeof value === "string" && value.trim().startsWith("[[")) {
    return value.trim();
  }

  const id = String(value).trim();

  if (!id || id === "[object Object]") return "";

  const collections = [
    context.data.Cultures,
    context.data.Countries,
    context.data.Cities,
    context.data.Religions,
    context.data.Notes,
  ].filter(Array.isArray) as unknown[][];

  for (const collection of collections) {
    const match = collection.find((item) => {
      if (!item || typeof item !== "object") return false;

      const record = item as Record<string, unknown>;

      return (
        String(record.id ?? "") === id ||
        String(record._id ?? "") === id ||
        String(record.i ?? "") === id ||
        readString(record, "name") === id ||
        readString(record, "Name") === id
      );
    });

    if (!match || typeof match !== "object") continue;

    const record = match as Record<string, unknown>;
    const name =
      readString(record, "name") ||
      readString(record, "Name") ||
      readString(record, "nameFull") ||
      readString(record, "title");

    if (name) return wikiLink(name);
  }

  return id;
}

function wikiLink(value: string): string {
  return `[[${value.trim()}]]`;
}

function readString(
  record: Record<string, unknown>,
  path: string,
): string {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;

    return (current as Record<string, unknown>)[key];
  }, record);

  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);

  return "";
}

function getSingularContextKey(sourceType: ExportContext["sourceType"]): string {
  switch (sourceType) {
    case "city":
      return "City";
    case "country":
      return "Country";
    case "culture":
      return "Culture";
    case "religion":
      return "Religion";
    case "note":
      return "Note";
    case "map":
      return "MapInfo";
    default:
      return "Entity";
  }
}

function resolveCityCountry(context: ExportContext): Record<string, unknown> {
  const rawCountry =
    context.entity.country ??
    context.entity.countryId ??
    context.entity.country_id;

  if (!rawCountry) return {};

  if (typeof rawCountry === "object") {
    const record = rawCountry as Record<string, unknown>;
    const id =
      readString(record, "id") ||
      readString(record, "_id") ||
      readString(record, "i");

    const resolved = id ? findCountryByReference(id, context) : null;

    return {
      ...(resolved ?? {}),
      ...record,
    };
  }

  return findCountryByReference(String(rawCountry), context) ?? {};
}


type ExportRecord = Record<string, unknown>;

function isRecord(value: unknown): value is ExportRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toUnknownArray(value: unknown): unknown[] {
  return Array.isArray(value) ? [...value] : [];
}

function resolveCountryCities(context: ExportContext): ExportRecord[] {
  const embeddedCities = toUnknownArray(context.entity.cities);

  const cities =
    embeddedCities.length > 0
      ? embeddedCities.flatMap((city) => {
        const normalized = normalizeCountryCity(city, context);

        return normalized ? [normalized] : [];
      })
      : findCitiesForCountry(context);

  return [...cities].sort(sortCountryCities);
}

function normalizeCountryCity(
  value: unknown,
  context: ExportContext,
): ExportRecord | null {
  if (value == null) return null;

  if (isRecord(value)) {
    const id =
      readString(value, "id") ||
      readString(value, "_id") ||
      readString(value, "i");

    const resolved = id ? findCityByReference(id, context) : null;

    const merged: ExportRecord = {
      ...(resolved ?? {}),
      ...value,
    };

    const name =
      readString(merged, "name") ||
      readString(merged, "nameFull") ||
      readString(merged, "title");

    if (!name) return null;

    return {
      ...merged,
      name,
    };
  }

  const resolved = findCityByReference(String(value), context);

  if (resolved) return resolved;

  const name = String(value).trim();

  return name ? { name } : null;
}

function findCitiesForCountry(context: ExportContext): ExportRecord[] {
  const cities = toUnknownArray(context.data.Cities);
  const countryRefs = getCountryReferenceValues(context.entity);

  return cities.flatMap((city) => {
    if (!isRecord(city)) return [];

    if (!cityBelongsToCountry(city, countryRefs)) return [];

    const name =
      readString(city, "name") ||
      readString(city, "nameFull") ||
      readString(city, "title");

    if (!name) return [];

    return [
      {
        ...city,
        name,
      },
    ];
  });
}

function findCityByReference(
  value: string,
  context: ExportContext,
): ExportRecord | null {
  const cities = toUnknownArray(context.data.Cities);

  const match = cities.find((city) => {
    if (!isRecord(city)) return false;

    return (
      String(city.id ?? "") === value ||
      String(city._id ?? "") === value ||
      String(city.i ?? "") === value ||
      readString(city, "name") === value ||
      readString(city, "nameFull") === value ||
      readString(city, "title") === value
    );
  });

  if (!isRecord(match)) return null;

  const name =
    readString(match, "name") ||
    readString(match, "nameFull") ||
    readString(match, "title");

  return name
    ? {
      ...match,
      name,
    }
    : null;
}

function cityBelongsToCountry(
  city: ExportRecord,
  countryRefs: Set<string>,
): boolean {
  const rawCountry =
    city.country ??
    city.countryId ??
    city.country_id ??
    city.state ??
    city.stateId;

  if (rawCountry == null) return false;

  if (isRecord(rawCountry)) {
    const possibleValues = [
      rawCountry.id,
      rawCountry._id,
      rawCountry.i,
      rawCountry.name,
      rawCountry.nameFull,
      rawCountry.title,
    ];

    return possibleValues.some((value) =>
      countryRefs.has(String(value ?? "").trim()),
    );
  }

  return countryRefs.has(String(rawCountry).trim());
}

function getCountryReferenceValues(country: ExportRecord): Set<string> {
  return new Set(
    [
      country.id,
      country._id,
      country.i,
      country.name,
      country.nameFull,
      country.title,
    ]
      .map((value) => String(value ?? "").trim())
      .filter(Boolean),
  );
}

function sortCountryCities(a: ExportRecord, b: ExportRecord): number {
  const aCapital = Boolean(a.capital);
  const bCapital = Boolean(b.capital);

  if (aCapital !== bCapital) return aCapital ? -1 : 1;

  return readString(a, "name").localeCompare(readString(b, "name"));
}

function resolveCountryPopulation(context: ExportContext): ExportRecord {
  const rawPopulation = context.entity.population;

  if (isRecord(rawPopulation)) {
    const rural = formatPopulationValue(
      rawPopulation.rural ??
      rawPopulation.Rural ??
      context.entity.ruralPopulation ??
      context.entity.populationRural,
    );

    const urban = formatPopulationValue(
      rawPopulation.urban ??
      rawPopulation.Urban ??
      context.entity.urbanPopulation ??
      context.entity.populationUrban,
    );

    const total =
      formatPopulationValue(
        rawPopulation.total ??
        rawPopulation.Total ??
        rawPopulation.all ??
        context.entity.totalPopulation ??
        context.entity.populationTotal,
      ) ||
      sumPopulationValues([rural, urban]) ||
      sumCountryCityPopulation(context);

    return {
      ...rawPopulation,
      total,
      rural,
      urban,
    };
  }

  const total =
    formatPopulationValue(
      rawPopulation ??
      context.entity.totalPopulation ??
      context.entity.populationTotal,
    ) || sumCountryCityPopulation(context);

  return {
    total,
    rural: formatPopulationValue(
      context.entity.ruralPopulation ?? context.entity.populationRural,
    ),
    urban: formatPopulationValue(
      context.entity.urbanPopulation ?? context.entity.populationUrban,
    ),
  };
}

function resolveCountryPolitical(context: ExportContext): ExportRecord {
  const political = isRecord(context.entity.political)
    ? context.entity.political
    : {};

  const formName =
    readString(political, "formName") ||
    readString(context.entity, "political.formName") ||
    readString(context.entity, "govName") ||
    readString(context.entity, "governmentName");

  const form =
    readString(political, "form") ||
    readString(context.entity, "political.form") ||
    readString(context.entity, "govForm") ||
    readString(context.entity, "governmentForm");

  return {
    ...political,
    formName,
    form,
    military: normalizeCountryMilitary(political.military),
    diplomacy: normalizeCountryDiplomacy(political.diplomacy),
    neighbors: normalizeCountryNeighbors(political.neighbors, context),
  };
}

function resolveCountryWarCampaigns(context: ExportContext): string[] {
  const rawCampaigns =
    context.entity.warCampaigns ??
    context.entity.campaigns ??
    context.entity.wars;

  const campaigns =
    Array.isArray(rawCampaigns)
      ? [...rawCampaigns]
      : rawCampaigns == null
        ? []
        : [rawCampaigns];

  return campaigns.map(formatCountryNamedValue).filter(Boolean);
}

function normalizeCountryMilitary(value: unknown): ExportRecord[] {
  const units = Array.isArray(value)
    ? [...value]
    : isRecord(value)
      ? Object.values(value)
      : [];

  return units.flatMap((unit) => {
    if (!isRecord(unit)) return [];

    const u = isRecord(unit.u) ? unit.u : {};

    return [
      {
        ...unit,
        id: readCountryValue(unit, "id"),
        name: readString(unit, "name") || "Unnamed Unit",
        icon: readString(unit, "icon"),
        a: readCountryValue(unit, "a"),
        u: {
          cavalry: readCountryValue(u, "cavalry"),
          archers: readCountryValue(u, "archers"),
          infantry: readCountryValue(u, "infantry"),
          artillery: readCountryValue(u, "artillery"),
        },
      },
    ];
  });
}

function normalizeCountryDiplomacy(value: unknown): ExportRecord[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      const normalized = normalizeCountryDiplomacyEntry(entry);

      return normalized ? [normalized] : [];
    });
  }

  if (!isRecord(value)) return [];

  if (readString(value, "name") || readString(value, "status")) {
    const entry = normalizeCountryDiplomacyEntry(value);

    return entry ? [entry] : [];
  }

  return Object.entries(value).flatMap(([name, status]) => {
    const entry = normalizeCountryDiplomacyEntry(status, name);

    return entry ? [entry] : [];
  });
}

function normalizeCountryDiplomacyEntry(
  value: unknown,
  fallbackName = "",
): ExportRecord | null {
  if (value == null) return null;

  if (isRecord(value)) {
    const name =
      readString(value, "name") ||
      readString(value, "country") ||
      readString(value, "countryName") ||
      fallbackName;

    const status =
      readString(value, "status") ||
      readString(value, "relation") ||
      readString(value, "relationship") ||
      readString(value, "value");

    if (!name && !status) return null;

    return {
      ...value,
      name,
      status,
    };
  }

  const status = String(value).trim();

  if (!fallbackName && !status) return null;

  return {
    name: fallbackName,
    status,
  };
}

function normalizeCountryNeighbors(
  value: unknown,
  context: ExportContext,
): ExportRecord[] {
  const neighbors = Array.isArray(value)
    ? [...value]
    : isRecord(value)
      ? Object.values(value)
      : [];

  return neighbors.flatMap((neighbor) => {
    const normalized = normalizeCountryNeighbor(neighbor, context);

    return normalized ? [normalized] : [];
  });
}

function normalizeCountryNeighbor(
  value: unknown,
  context: ExportContext,
): ExportRecord | null {
  if (value == null) return null;

  if (isRecord(value)) {
    const id =
      readString(value, "id") ||
      readString(value, "_id") ||
      readString(value, "i");

    const resolved = id ? findCountryByReference(id, context) : null;

    const merged: ExportRecord = {
      ...(resolved ?? {}),
      ...value,
    };

    const name =
      readString(merged, "name") ||
      readString(merged, "nameFull") ||
      readString(merged, "title");

    if (!name && !id) return null;

    return {
      ...merged,
      name,
      id,
    };
  }

  const resolved = findCountryByReference(String(value), context);

  if (resolved) return resolved;

  const id = String(value).trim();

  return id ? { id, name: id } : null;
}

function findCountryByReference(
  value: string,
  context: ExportContext,
): Record<string, unknown> | null {
  const countries = Array.isArray(context.data.Countries)
    ? context.data.Countries
    : [];

  const match = countries.find((country) => {
    if (!country || typeof country !== "object") return false;

    const record = country as Record<string, unknown>;

    return (
      String(record.id ?? "") === value ||
      String(record._id ?? "") === value ||
      String(record.i ?? "") === value ||
      readString(record, "name") === value ||
      readString(record, "nameFull") === value ||
      readString(record, "title") === value
    );
  });

  return match && typeof match === "object"
    ? (match as Record<string, unknown>)
    : null;
}

function formatCountryNamedValue(value: unknown): string {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value).trim();
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    return (
      readString(record, "name") ||
      readString(record, "Name") ||
      readString(record, "title") ||
      readString(record, "label") ||
      readString(record, "id") ||
      readString(record, "_id")
    );
  }

  return String(value).trim();
}

function formatPopulationValue(value: unknown): string {
  if (value == null) return "";

  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toLocaleString();
  }

  if (typeof value === "string") {
    return value.trim();
  }

  return "";
}

function sumCountryCityPopulation(context: ExportContext): string {
  const cities = resolveCountryCities(context);

  const total = cities.reduce<number>((sum, city) => {
    return sum + parsePopulationNumber(city.population);
  }, 0);

  return total > 0 ? total.toLocaleString() : "";
}

function sumPopulationValues(values: unknown[]): string {
  const total = values.reduce<number>((sum, value) => {
    return sum + parsePopulationNumber(value);
  }, 0);

  return total > 0 ? total.toLocaleString() : "";
}

function parsePopulationNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").trim());

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function readCountryValue(
  record: Record<string, unknown>,
  path: string,
): string | number {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object") return undefined;

    return (current as Record<string, unknown>)[key];
  }, record);

  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value.trim();

  return "";
}
