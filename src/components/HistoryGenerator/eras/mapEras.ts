import { validateEraEvents } from "./eraEvents";
import { v7 as uuidv7 } from "uuid";
import type { TLDevelopmentalEra, TLDevelopmentalEraPlacement, TLDevelopmentSummary, TLMapEra, TLHistoryEraReference } from "../../../definitions/History";
import type { MapInf, TLNPC, TLCity, TLCountry, TLMapEconomy } from "../../../definitions/TerraLogger";
import { reflowPreviousEras, resolveHistoryEra } from "./model";

export function reflowMapEras(map: MapInf): MapInf {
  const history = map.historyGenerator ?? { currentEraMinimumYear: 0, previousEras: [] };
  const minimumYear = map.settings.options.year > 0 ? 1 : history.currentEraMinimumYear;
  return { ...map, historyGenerator: {
    ...history, currentEraMinimumYear: minimumYear,
    previousEras: reflowPreviousEras(history.previousEras, minimumYear),
  } };
}

export function currentMapEraId(map: MapInf): string {
  return map.historyGenerator?.currentEra?.id ?? uuidv7();
}

export function getMapEras(source: MapInf): TLMapEra[] {
  const map = reflowMapEras(source);
  const minimumYear = map.historyGenerator?.currentEraMinimumYear ?? 0;
  const currentYear = map.settings.options.year;
  const current = map.historyGenerator?.currentEra;
  const currentId = currentMapEraId(map);
  const previous = (map.historyGenerator?.previousEras ?? []).map((era): TLMapEra => ({
    ...era, _id: era.id, mapId: map.mapId, status: "previous",
  }));
  const eras: TLMapEra[] = [
    ...previous,
    {
      id: currentId, _id: currentId, mapId: map.mapId, status: "current",
      name: map.settings.options.era, shortName: map.settings.options.eraShort,
      firstYear: minimumYear, finalYear: currentYear,
      length: currentYear - minimumYear + 1,
      timelineStartYear: minimumYear, timelineEndYear: currentYear,
      events: current?.events, description: current?.description, content: current?.content,
      createdAt: current?.createdAt, updatedAt: current?.updatedAt,
    },
  ];
  return eras.sort((left, right) => left.timelineStartYear - right.timelineStartYear);
}

export function validateMapEras(eras: readonly TLMapEra[], mapId: string): void {
  const ids = new Set<string>();
  let currentCount = 0;
  const ordered = [...eras].sort((left, right) => left.timelineStartYear - right.timelineStartYear);
  for (const era of ordered) {
    if (!era.id || era._id !== era.id || era.mapId !== mapId || ids.has(era.id)) {
      throw new Error("Eras require unique, matching IDs and must belong to this map.");
    }
    ids.add(era.id);
    if (era.status !== "current" && era.status !== "previous") {
      throw new Error("Only current and previous eras are supported.");
    }
    if (era.status === "current") currentCount++;
    if (!era.name.trim() || !era.shortName.trim()) {
      throw new Error("Every era requires a name and abbreviation.");
    }
    if (![era.firstYear, era.finalYear, era.timelineStartYear, era.timelineEndYear, era.length]
      .every(Number.isSafeInteger)) {
      throw new Error("Era years and lengths must be safe whole numbers.");
    }
    const length = era.finalYear - era.firstYear + 1;
    if (!Number.isSafeInteger(length) || length < 1 || era.length !== length ||
      era.timelineEndYear - era.timelineStartYear + 1 !== length) {
      throw new Error("Era local years, timeline years, and length must describe the same positive duration.");
    }
    validateEraEvents(era);
    if (era.status === "current" &&
      (era.firstYear !== era.timelineStartYear || era.finalYear !== era.timelineEndYear)) {
      throw new Error("The current era uses the map's existing year numbering.");
    }
  }
  if (currentCount !== 1 || ordered[ordered.length - 1]?.status !== "current") {
    throw new Error("A map requires exactly one current era, after its previous eras.");
  }
  for (let index = 1; index < ordered.length; index++) {
    if (ordered[index].timelineStartYear <= ordered[index - 1].timelineEndYear) {
      throw new Error("Era timeline ranges cannot overlap.");
    }
  }
}

function sameEraReference(left: TLHistoryEraReference | undefined, right: TLHistoryEraReference | undefined) {
  return left === right || Boolean(left && right && left.id === right.id &&
    left.name === right.name && left.shortName === right.shortName && left.year === right.year);
}

// Refresh date labels without changing event years, titles, descriptions, or generation metadata.
export function refreshNPCEraReferences(npcs: readonly TLNPC[], eras: readonly TLMapEra[]): TLNPC[] {
  return npcs.map((npc) => {
    let changed = false;
    const history = npc.history.map((entry) => {
      const era = entry.year === undefined ? undefined : resolveHistoryEra(entry.year, eras);
      if (sameEraReference(entry.era, era)) return entry;
      changed = true;
      return { ...entry, era };
    });
    return changed ? { ...npc, history } : npc;
  });
}

// The generation helpers use a temporary map projection; era records are stored separately.
export function mapWithEraRecords(map: MapInf, eras: readonly TLMapEra[]): MapInf {
  validateMapEras(eras, map.mapId);
  const current = eras.find((era) => era.status === "current");
  if (!current) throw new Error("The map has no current era.");
  return { ...map, settings: { ...map.settings, options: { ...map.settings.options,
    era: current.name, eraShort: current.shortName,
  } }, historyGenerator: {
    currentEraMinimumYear: current.firstYear,
    currentEra: { id: current._id, events: current.events, description: current.description, content: current.content,
      createdAt: current.createdAt, updatedAt: current.updatedAt },
    previousEras: eras.filter((era) => era.status === "previous").map((era) => ({
      ...era, createdAt: era.createdAt ?? new Date().toISOString(),
    })),
  } };
}

export function mapWithoutEraRecords(map: MapInf): MapInf {
  const result = { ...map };
  delete result.historyGenerator;
  return result;
}

// Used once when importing a new map or migrating embedded era documents.
export function createMapEraRecords(map: MapInf): {
  eras: TLMapEra[];
  ids: Map<string, string>;
} {
  const ids = new Map<string, string>();
  const eras = getMapEras(map).map((era) => {
    const id = uuidv7();
    ids.set(era.id, id);
    if (era.status === "current") ids.set(`era:current:${map.mapId}`, id);
    return { ...era, id, _id: id, createdAt: era.createdAt ?? new Date().toISOString(),
      content: era.content ? { ...era.content,
        source: { ...era.content.source, type: "era" as const, entityId: id, mapId: map.mapId },
      } : undefined,
    };
  });
  validateMapEras(eras, map.mapId);
  return { eras, ids };
}

// Development thresholds are independent of historical chronology and NPC dates.
export function validateDevelopmentalEras(eras: readonly TLDevelopmentalEra[], mapId: string): void {
  const ids = new Set<string>();
  const levels = new Set<number>();
  const placements = new Set<string>();
  for (const era of eras) {
    if (!era.id || era._id !== era.id || era.mapId !== mapId || ids.has(era.id) ||
      typeof era.name !== "string" || !era.name.trim() || typeof era.description !== "string" ||
      typeof era.active !== "boolean" || !Number.isInteger(era.level) || era.level < 1 || era.level > 100 ||
      (era.active && levels.has(era.level))) throw new Error("Invalid developmental era identity, name or threshold.");
    ids.add(era.id);
    if (era.active) levels.add(era.level);
    if (!era.estimateBasis || !Number.isSafeInteger(era.estimateBasis.startYear) ||
      !Number.isSafeInteger(era.estimateBasis.endYear) || era.estimateBasis.startYear > era.estimateBasis.endYear) {
      throw new Error("Invalid developmental-era estimation basis.");
    }
    if (era.source && (!Number.isInteger(era.source.level) || era.source.level < 1 || era.source.level > 100 ||
      typeof era.source.name !== "string" || !era.source.name.trim() || typeof era.source.present !== "boolean")) {
      throw new Error("Invalid developmental-era source reference.");
    }
    if (era.regionalEstimatesInitialized !== undefined && typeof era.regionalEstimatesInitialized !== "boolean") {
      throw new Error("Invalid regional-estimate initialization flag.");
    }
    if (!Array.isArray(era.placements)) throw new Error("Developmental-era placements must be a list.");
    for (const placement of era.placements) {
      if (!placement.id || placements.has(placement.id) || !Number.isSafeInteger(placement.startYear) ||
        !Number.isSafeInteger(placement.endYear) || placement.startYear > placement.endYear ||
        typeof placement.estimated !== "boolean") throw new Error("Invalid developmental-era placement.");
      if (placement.subject && ((placement.subject.type !== "country" && placement.subject.type !== "city") ||
        typeof placement.subject.entityId !== "string" || !placement.subject.entityId.trim())) {
        throw new Error("Invalid developmental-era regional association.");
      }
      placements.add(placement.id);
    }
  }
}

// Source thresholds have no IDs. Match their exact original level; never guess by a name.
// Source levels describe current development, not historical adoption dates.
export function createDevelopmentalEraRecords(mapId: string, definitions: readonly { level: number; name: string }[], historical: readonly TLMapEra[], existing: readonly TLDevelopmentalEra[] = []): TLDevelopmentalEra[] {
  validateMapEras(historical, mapId);
  validateDevelopmentalEras(existing, mapId);
  const ordered = [...definitions].sort((a, b) => a.level - b.level);
  if (ordered.some((era, index) => !Number.isInteger(era.level) || era.level < 1 || era.level > 100 ||
    typeof era.name !== "string" || !era.name.trim() || ordered[index - 1]?.level === era.level)) {
    throw new Error("Development definitions require unique thresholds from 1 to 100 and nonempty names.");
  }
  const basis = { startYear: Math.min(...historical.map((era) => era.timelineStartYear)), endYear: Math.max(...historical.map((era) => era.timelineEndYear)) };
  const span = basis.endYear - basis.startYear;
  if (!Number.isSafeInteger(span)) throw new Error("The historical span is too large to estimate development dates.");
  const sources = new Map<number, TLDevelopmentalEra>();
  for (const era of existing) {
    if (era.source) {
      if (sources.has(era.source.level)) throw new Error("Duplicate developmental-era source threshold.");
      sources.set(era.source.level, era);
    }
  }
  const matched = new Set<string>();
  const now = new Date().toISOString();
  const stamp = (old: TLDevelopmentalEra, next: TLDevelopmentalEra): TLDevelopmentalEra =>
    JSON.stringify(old) === JSON.stringify(next) ? old : { ...next, updatedAt: now };
  const records = ordered.map((definition): TLDevelopmentalEra => {
    const previous = sources.get(definition.level);
    const source = { ...definition, present: true };
    if (previous) {
      matched.add(previous._id);
      return stamp(previous, { ...previous, source,
        name: previous.name === previous.source?.name ? definition.name : previous.name });
    }
    const id = uuidv7();
    return { id, _id: id, mapId, name: definition.name, level: definition.level, active: true, description: "",
      estimateBasis: { ...basis }, source, createdAt: now, updatedAt: now,
      placements: [],
    };
  });
  // Preserve authored documents and dates when a source threshold disappears.
  for (const era of existing) {
    if (matched.has(era._id)) continue;
    records.push(era.source ? stamp(era, { ...era, active: false, source: { ...era.source, present: false } }) : era);
  }
  validateDevelopmentalEras(records, mapId);
  return records;
}

// Seed regional estimates once: subsequent reimports must preserve edits and removals.
export function estimateDevelopmentalEraPlacements(
  records: readonly TLDevelopmentalEra[], historical: readonly TLMapEra[],
  cities: readonly TLCity[], countries: readonly TLCountry[], economy: TLMapEconomy | undefined,
): TLDevelopmentalEra[] {
  if (!economy?.cells?.development) return [...records];
  const summaries = refreshDevelopmentSummaries(cities, countries, economy, records);
  const countryById = new Map(summaries.countries.filter((country) => country.id !== 0).map((country) => [country._id, country]));
  const active = records.filter((era) => era.active).sort((a, b) => a.level - b.level);
  return records.map((era) => {
    if (!era.source?.present || !era.active || era.regionalEstimatesInitialized) return era;
    const subjects: NonNullable<TLDevelopmentalEraPlacement["subject"]>[] = [];
    for (const country of countryById.values()) {
      if (country.development?.eraId === era._id) subjects.push({ type: "country", entityId: country._id });
    }
    for (const city of summaries.cities) {
      if (city.development?.eraId !== era._id) continue;
      const parent = city.country.id === 0 ? undefined : countryById.get(city.country._id);
      if (parent?.development?.eraId !== era._id) subjects.push({ type: "city", entityId: city._id });
    }
    const start = Math.min(...historical.map((item) => item.timelineStartYear));
    const end = Math.max(...historical.map((item) => item.timelineEndYear));
    const span = end - start;
    if (!Number.isSafeInteger(span) || span < 0) throw new Error("Invalid historical span for regional estimates.");
    const nextLevel = active.find((item) => item.level > era.level)?.level ?? 100;
    const estimate = (level: number) => start + Math.round(span * level / 100);
    const placements = [...era.placements];
    for (const subject of subjects) {
      if (placements.some((placement) => placement.subject?.type === subject.type && placement.subject.entityId === subject.entityId)) continue;
      placements.push({ id: uuidv7(), subject, startYear: estimate(era.level), endYear: estimate(nextLevel), estimated: true });
    }
    return { ...era, placements, regionalEstimatesInitialized: true, updatedAt: new Date().toISOString() };
  });
}

export function developmentalPlacementSubject(
  placement: TLDevelopmentalEraPlacement, cities: readonly TLCity[] = [], countries: readonly TLCountry[] = [],
): string {
  const subject = placement.subject;
  if (!subject) return "Unassigned";
  const entity = (subject.type === "city" ? cities : countries).find((item) => item._id === subject.entityId);
  return entity ? `${subject.type === "city" ? "City" : "Country"}: ${entity.name}`
    : `Unavailable ${subject.type} (${subject.entityId})`;
}

// City periods replace inherited Country periods for this developmental era only.
export function developmentalPlacementsForEntity(
  era: TLDevelopmentalEra, entity: TLCity | TLCountry, type: "city" | "country",
): TLDevelopmentalEraPlacement[] {
  const own = era.placements.filter((placement) =>
    placement.subject?.type === type && placement.subject.entityId === entity._id);
  if (type === "country" || own.length) return own;
  const city = entity as TLCity;
  return city.country.id === 0 ? [] : era.placements.filter((placement) =>
    placement.subject?.type === "country" && placement.subject.entityId === city.country._id);
}

export function developmentSummary(level: number, eras: readonly TLDevelopmentalEra[]): TLDevelopmentSummary | undefined {
  if (!Number.isFinite(level) || level <= 0 || level > 100) return undefined;
  const era = eras.filter((era) => era.active && era.level <= level).sort((a, b) => b.level - a.level)[0];
  return { level, eraId: era?._id, eraName: era?.name };
}

export function refreshDevelopmentSummaries(cities: readonly TLCity[], countries: readonly TLCountry[], economy: TLMapEconomy | undefined, eras: readonly TLDevelopmentalEra[]): { cities: TLCity[]; countries: TLCountry[] } {
  const cells = economy?.cells;
  const levels = cells?.development;
  const population = cells?.population;
  if (levels && (!cells || levels.length !== cells.country.length || levels.some((level) => !Number.isInteger(level) || level < 0 || level > 100))) {
    throw new Error("Invalid cell development assignments.");
  }
  if (population && (!cells || population.length !== cells.country.length || population.some((value) => !Number.isFinite(value) || value < 0))) {
    throw new Error("Invalid cell population assignments.");
  }
  // Cell population is rural; also include populated City cells, once each.
  const urbanCells = new Set(cities.filter((city) => city.cellId !== undefined &&
    typeof city.population === "string" && Number.parseFloat(city.population.replace(/,/g, "")) > 0).map((city) => city.cellId));
  const byCountry = new Map<number, { total: number; count: number }>();
  if (levels && population && cells) {
    for (let cell = 0; cell < levels.length; cell++) {
      const countryId = cells.country[cell];
      if (!countryId || (population[cell] <= 0 && !urbanCells.has(cell)) || levels[cell] === 0) continue;
      const tally = byCountry.get(countryId) ?? { total: 0, count: 0 };
      tally.total += levels[cell]; tally.count += 1;
      byCountry.set(countryId, tally);
    }
  }
  const nextCities = cities.map((city) => ({ ...city, development:
    city.cellId === undefined ? undefined : developmentSummary(levels?.[city.cellId] ?? 0, eras) }));
  return { cities: nextCities, countries: countries.map((country) => {
    const tally = byCountry.get(country.id);
    return { ...country, development: tally ? developmentSummary(tally.total / tally.count, eras) : undefined,
      cities: nextCities.filter((city) => city.country.id === country.id) };
  }) };
}

export function developmentalDefinitions(map: MapInf): { level: number; name: string }[] | undefined {
  const value = map.settings.options.eras;
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error("Stored developmental-era definitions must be a list.");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object" || typeof entry.level !== "number" || typeof entry.name !== "string") {
      throw new Error("Stored developmental-era definitions require numeric levels and text names.");
    }
    return { level: entry.level, name: entry.name };
  });
}

// Maps imported before population retention can recover it from the original cell section.
export function mapWithDevelopmentPopulation(map: MapInf): MapInf {
  const economy = map.economy;
  if (!economy?.cells.development || economy.cells.population !== undefined) return map;
  const raw = map.renderingSource?.sections[21];
  if (!raw?.trim()) throw new Error("Cell population data is unavailable. Reimport this map to calculate developmental summaries.");
  const tokens = raw.split(",");
  const population = tokens.map(Number);
  if (population.length !== economy.cells.country.length || tokens.some((token) => !token.trim()) ||
    population.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Retained cell population data is invalid.");
  }
  return { ...map, economy: { ...economy, cells: { ...economy.cells, population } } };
}

export function historicalYearLabel(year: number, eras: readonly TLMapEra[]): string {
  if (!Number.isSafeInteger(year)) return "Choose a whole-number year";
  const era = eras.find((item) => year >= item.timelineStartYear && year <= item.timelineEndYear);
  if (era) return `Year ${era.firstYear + year - era.timelineStartYear} ${era.shortName || era.name}`;
  const first = [...eras].sort((a, b) => a.timelineStartYear - b.timelineStartYear)[0];
  const last = [...eras].sort((a, b) => b.timelineEndYear - a.timelineEndYear)[0];
  if (first && year < first.timelineStartYear) return `${first.timelineStartYear - year} years before ${first.name}`;
  if (last && year > last.timelineEndYear) return `${year - last.timelineEndYear} years after ${last.name}`;
  return `Timeline year ${year}`;
}
