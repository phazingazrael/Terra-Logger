import type { TLNPC, NPCEntityType, NPCRelationship, NPCDisplayReference } from "../../../definitions/TerraLogger";
import type { TLMapInfo, TLCity, TLCountry, TLCulture, TLReligion } from "../../../definitions/TerraLogger";
import { generateNPCDraft } from "../generator/engine/generate";
import { buildGovernmentRoleAssignments } from "../generator/engine/government";
import { getGovernmentDefinition } from "../generator/governments";
import { listActiveNPCProfessions } from "../generator/professions/catalog";
import type { NPCGenerationConstraints } from "../types";
import { createPersistentNPCFromDraft } from "../persistence/fromDraft";
import { startNPCPerformanceMonitor, yieldToBrowser } from "../performance";
import type { NPCPerformanceDiagnostics } from "../performance";
import { getSupportingNPCCategory, type SupportingNPCCategoryId } from "./supportingCategories";

export type NPCPopulationPhase = "countries" | "cities" | "religions" | "cultures" | "supporting";
export type NPCPopulationProgress = { phase: NPCPopulationPhase; completed: number; total: number; message: string };
export type NPCPopulationIssue = { severity: "warning" | "error"; phase: NPCPopulationPhase; message: string; entityType?: string; entityId?: string; entityName?: string; continued: boolean };
export type NPCPopulationOptions = {
  random?: () => number;
  onProgress?: (progress: NPCPopulationProgress) => void;
  supportingCategoryIds?: SupportingNPCCategoryId[];
  supportingNPCsPerCategory?: number;
  religionLeadersPerReligion?: number;
  cultureEldersPerCulture?: number;
  onIssue?: (issue: NPCPopulationIssue) => void;
  onCount?: (name: string, amount: number) => void;
  onPerformanceDiagnostics?: (diagnostics: NPCPerformanceDiagnostics) => void;
  yieldEvery?: number;
};

function relationship(entityType: NPCEntityType, entityId: string, relationshipType: string, roleTitle: string, primary: boolean, now: string): NPCRelationship {
  return { id: `relationship:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`, relatedEntityType: entityType, relatedEntityId: entityId, relationshipType, roleTitle, primary, source: "map-generation", createdAt: now, updatedAt: now };
}

type ContextualRelationship = {
  entityType: NPCEntityType;
  entityId: string;
  relationshipType: string;
  roleTitle: string;
  primary?: boolean;
};

async function createContextualNPC(args: { mapId: string; entityType: NPCEntityType; entityId: string; relationshipType: string; roleTitle: string; primary?: boolean; additionalRelationships?: ContextualRelationship[]; currentLocation?: { id: string; name: string }; religion?: NPCDisplayReference; associateReligion?: "always" | "when-religious"; constraints?: NPCGenerationConstraints; random?: () => number }): Promise<TLNPC> {
  const now = new Date().toISOString();
  const draft = await generateNPCDraft({ constraints: args.constraints, random: args.random });
  const npc = createPersistentNPCFromDraft(draft, { mapId: args.mapId, mode: "map-population", constraints: args.constraints, now });
  npc.relationships = [
    relationship(args.entityType, args.entityId, args.relationshipType, args.roleTitle, args.primary ?? false, now),
    ...(args.additionalRelationships ?? []).map((item) =>
      relationship(item.entityType, item.entityId, item.relationshipType, item.roleTitle, item.primary ?? false, now),
    ),
  ];
  npc.currentLocation = args.currentLocation;
  if (args.religion && (args.associateReligion === "always" || isReligiousProfession(npc.profession?.name, args.roleTitle))) {
    npc.religions = [{ ...args.religion }];
  }
  return npc;
}


function isReligiousProfession(professionName?: string, roleTitle?: string): boolean {
  const value = `${professionName ?? ""} ${roleTitle ?? ""}`.toLocaleLowerCase();
  return /\b(acolyte|cleric|clergy|priest|priestess|bishop|archbishop|pontiff|imam|mullah|monk|nun|friar|abbot|abbess|inquisitor|shrine|temple|religious|theologian|cantor|chaplain|oracle|druid)\b/.test(value);
}

function resolveReligionReference(map: TLMapInfo, value: unknown): NPCDisplayReference | undefined {
  const normalized = String(value ?? "").trim().toLocaleLowerCase();
  if (!normalized) return undefined;
  const religion = map.religions.find((entry) =>
    entry._id.toLocaleLowerCase() === normalized
    || String(entry.i).toLocaleLowerCase() === normalized
    || entry.name.toLocaleLowerCase() === normalized,
  );
  return religion ? { id: religion._id, name: religion.name } : undefined;
}

function primaryReligionForCountry(map: TLMapInfo, country?: TLCountry): NPCDisplayReference | undefined {
  if (!country) return undefined;
  for (const value of country.religions ?? []) {
    const religion = resolveReligionReference(map, value);
    if (religion) return religion;
  }
  return undefined;
}

function primaryReligionForCity(map: TLMapInfo, city: TLCity): NPCDisplayReference | undefined {
  for (const value of city.religions ?? []) {
    const religion = resolveReligionReference(map, value);
    if (religion) return religion;
  }
  const country = map.countries.find((entry) => cityBelongsToCountry(city, entry));
  return primaryReligionForCountry(map, country);
}

function normalizeGovernmentType(value: unknown): string | undefined {
  const normalized = String(value ?? "").trim();
  if (!normalized || normalized.toLocaleLowerCase() === "undefined" || normalized.toLocaleLowerCase() === "null") return undefined;
  return normalized;
}
function countryGovernmentType(country: TLCountry): string | undefined {
  return normalizeGovernmentType(country.political?.formName) ?? normalizeGovernmentType(country.political?.form);
}
function numeric(value: string | number | undefined): number { return Number(String(value ?? "0").replace(/,/g, "")) || 0; }
function randomItem<T>(items: readonly T[], random = Math.random): T | undefined { return items.length ? items[Math.floor(random() * items.length)] : undefined; }

function cityBelongsToCountry(city: TLCity, country: TLCountry): boolean {
  return String(city.country?.id ?? "") === String(country.id) || city.country?._id === country._id;
}

function countryHeadquartersCity(map: TLMapInfo, country: TLCountry): TLCity | undefined {
  const cities = map.cities.filter((city) => cityBelongsToCountry(city, country));
  return cities.find((city) => city.capital)
    ?? [...cities].sort((left, right) => numeric(right.population) - numeric(left.population))[0];
}

function religionCenterCity(map: TLMapInfo, religion: TLReligion): TLCity | undefined {
  const center = religion.center;
  return map.cities.find((city) =>
    city._id === center?._id
    || String(city.id) === String(center?.i ?? "")
    || (!!center?.name && city.name.toLocaleLowerCase() === center.name.toLocaleLowerCase()),
  );
}

function religionCountry(map: TLMapInfo, religion: TLReligion, centerCity?: TLCity): TLCountry | undefined {
  if (centerCity) {
    const country = map.countries.find((entry) => cityBelongsToCountry(centerCity, entry));
    if (country) return country;
  }

  const identifiers = new Set([religion._id, String(religion.i), religion.name].filter(Boolean).map((value) => String(value).toLocaleLowerCase()));
  return map.countries.find((country) =>
    (country.religions ?? []).some((value) => identifiers.has(String(value).toLocaleLowerCase())),
  );
}

function leadershipHeadquartersRelationships(headquarters?: TLCity): ContextualRelationship[] {
  return headquarters
    ? [{ entityType: "city", entityId: headquarters._id, relationshipType: "headquartered-in", roleTitle: "National Headquarters" }]
    : [];
}

async function generateCountryPopulation(map: TLMapInfo, mapId: string, country: TLCountry, random?: () => number): Promise<TLNPC[]> {
  const governmentType = countryGovernmentType(country);
  if (!governmentType) return [];
  const assignments = buildGovernmentRoleAssignments(governmentType, { countryCount: map.countries.length, cityCount: country.cities.length, random });
  const result: TLNPC[] = [];
  const headquarters = countryHeadquartersCity(map, country);
  for (const assignment of assignments) for (let index = 0; index < assignment.count; index += 1) // NPC creation is sequential to preserve seeded random order.
    // react-doctor-disable-next-line react-doctor/async-await-in-loop
    result.push(await createContextualNPC({
      mapId,
      entityType: "country",
      entityId: country._id,
      relationshipType: assignment.classification === "leader" ? "rules" : "serves",
      roleTitle: assignment.title,
      primary: assignment.classification === "leader" || assignment.primary,
      additionalRelationships: assignment.classification === "leader"
        ? leadershipHeadquartersRelationships(headquarters)
        : [],
      currentLocation: headquarters ? { id: headquarters._id, name: headquarters.name } : undefined,
      religion: primaryReligionForCountry(map, country),
      associateReligion: "when-religious",
      constraints: { governmentDefinitionId: assignment.governmentDefinitionId, governmentRoleId: assignment.governmentRoleId, professionId: assignment.professionId },
      random,
    }));
  return result;
}

async function generateCityLeadership(map: TLMapInfo, mapId: string, city: TLCity, random?: () => number): Promise<TLNPC[]> {
  const country = map.countries.find((entry) => String(entry.id) === String(city.country?.id) || entry._id === city.country?._id);
  const governmentType = country
    ? countryGovernmentType(country)
    : normalizeGovernmentType(city.country?.govName) ?? normalizeGovernmentType(city.country?.govForm);
  const definition = governmentType ? getGovernmentDefinition(governmentType) : undefined;
  const roles = definition?.municipalLeadership?.roles ?? [];
  const effectiveRoles = roles.length ? roles : [{ id: "fallback-city-leader", title: "City Leader", description: "", classification: "leader" as const, primary: true, count: { mode: "fixed" as const, value: 1 } }];
  const result: TLNPC[] = [];
  for (const role of effectiveRoles) {
    // NPC creation is sequential to preserve seeded random order.
    // react-doctor-disable-next-line react-doctor/async-await-in-loop
    result.push(await createContextualNPC({ mapId, entityType: "city", entityId: city._id, relationshipType: "leads", roleTitle: role.title, primary: role.primary ?? true, currentLocation: { id: city._id, name: city.name }, religion: primaryReligionForCity(map, city), associateReligion: "when-religious", constraints: { governmentDefinitionId: definition?.id, professionId: role.professionId }, random }));
  }
  return result;
}

async function generateSimpleContextPopulation(mapId: string, entityType: Exclude<NPCEntityType, "country" | "npc">, entity: TLCity | TLReligion | TLCulture, count: number, relationshipType: string, roleTitle: string, random?: () => number, constraints?: NPCGenerationConstraints): Promise<TLNPC[]> {
  const result: TLNPC[] = [];
  for (let index = 0; index < count; index += 1) {
    // NPC creation is sequential to preserve seeded random order and primary assignment.
    // react-doctor-disable-next-line react-doctor/async-await-in-loop
    result.push(await createContextualNPC({ mapId, entityType, entityId: entity._id, relationshipType, roleTitle, primary: index === 0, currentLocation: entityType === "city" ? { id: entity._id, name: entity.name } : undefined, random, constraints }));
  }
  return result;
}

async function generateReligiousAttendants(map: TLMapInfo, mapId: string, city: TLCity, count: number, relationshipType: string, roleTitle: string, random?: () => number, constraints?: NPCGenerationConstraints): Promise<TLNPC[]> {
  const result: TLNPC[] = [];
  const religion = primaryReligionForCity(map, city);
  for (let index = 0; index < count; index += 1) {
    // NPC creation is sequential to preserve seeded random order and primary assignment.
    // react-doctor-disable-next-line react-doctor/async-await-in-loop
    result.push(await createContextualNPC({
      mapId,
      entityType: "city",
      entityId: city._id,
      relationshipType,
      roleTitle,
      primary: index === 0,
      currentLocation: { id: city._id, name: city.name },
      religion,
      associateReligion: "always",
      random,
      constraints,
    }));
  }
  return result;
}

export async function generateNPCPopulation(map: TLMapInfo, options: NPCPopulationOptions = {}): Promise<TLNPC[]> {
  const mapId = `${map.info.name}-${map.info.ID}`;
  const npcs: TLNPC[] = [];
  const diagnostics: NPCPerformanceDiagnostics = { startedAt: new Date().toISOString(), phases: [], longTasks: [], watchdogDelays: [] };
  const stopMonitor = startNPCPerformanceMonitor(diagnostics);
  const overallStartedAt = performance.now();
  const generationStartedAt = performance.now();
  const yieldEvery = Math.max(1, options.yieldEvery ?? 25);
  const report = (phase: NPCPopulationPhase, completed: number, total: number, message: string) => { options.onProgress?.({ phase, completed, total, message }); };
  const issue = (value: NPCPopulationIssue) => options.onIssue?.(value);
  const addCount = (name: string, amount: number) => options.onCount?.(name, amount);

  try {
    for (let index = 0; index < map.countries.length; index += 1) {
      const country = map.countries[index]; report("countries", index, map.countries.length, `Generating government population for ${country.name}...`);
      const governmentType = countryGovernmentType(country);
      if (!governmentType) {
        issue({ severity: "warning", phase: "countries", message: "Skipped country leadership because no usable government type was provided.", entityType: "country", entityId: country._id, entityName: country.name, continued: true });
      } else {
        try {
          // Country generation is sequential for deterministic progress and seeded random output.
          // react-doctor-disable-next-line react-doctor/async-await-in-loop
          const created = await generateCountryPopulation(map, mapId, country, options.random); npcs.push(...created); addCount("Country leadership NPCs", created.length);
        } catch (error) { issue({ severity: "error", phase: "countries", message: error instanceof Error ? error.message : String(error), entityType: "country", entityId: country._id, entityName: country.name, continued: true }); }
      }
      if ((index + 1) % yieldEvery === 0) {
        // Yield points intentionally serialize long-running generation.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        await yieldToBrowser();
      }
    }
    report("countries", map.countries.length, map.countries.length, "Government populations generated.");

    for (let index = 0; index < map.cities.length; index += 1) {
      const city = map.cities[index]; report("cities", index, map.cities.length, `Generating city leadership for ${city.name}...`);
      try {
        // City generation is sequential for deterministic progress and seeded random output.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        const created = await generateCityLeadership(map, mapId, city, options.random); npcs.push(...created); addCount("City leadership NPCs", created.length);
      } catch (error) { issue({ severity: "error", phase: "cities", message: error instanceof Error ? error.message : String(error), entityType: "city", entityId: city._id, entityName: city.name, continued: true }); }
      if ((index + 1) % yieldEvery === 0) {
        // Yield points intentionally serialize long-running generation.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        await yieldToBrowser();
      }
    }
    report("cities", map.cities.length, map.cities.length, "City leadership generated.");

    const religionCount = Math.max(1, options.religionLeadersPerReligion ?? 1);
    for (let index = 0; index < map.religions.length; index += 1) {
      const religion = map.religions[index]; const population = numeric(religion.members?.rural) + numeric(religion.members?.urban);
      report("religions", index, map.religions.length, `Processing religion ${religion.name}...`);
      if (population <= 0) { issue({ severity: "warning", phase: "religions", message: "Skipped religion leadership because total membership was 0.", entityType: "religion", entityId: religion._id, entityName: religion.name, continued: true }); continue; }
      try {
        const centerCity = religionCenterCity(map, religion);
        const associatedCountry = religionCountry(map, religion, centerCity);
        const headquarters = associatedCountry ? countryHeadquartersCity(map, associatedCountry) : centerCity;
        const created: TLNPC[] = [];
        for (let leaderIndex = 0; leaderIndex < religionCount; leaderIndex += 1) {
          const additionalRelationships: ContextualRelationship[] = [];
          if (associatedCountry) {
            additionalRelationships.push({ entityType: "country", entityId: associatedCountry._id, relationshipType: "serves", roleTitle: "National Religious Leader", primary: true });
          }
          if (headquarters) {
            additionalRelationships.push({ entityType: "city", entityId: headquarters._id, relationshipType: "headquartered-in", roleTitle: "Religious Headquarters" });
          }
          // Religious leaders are sequential to preserve seeded random order.
          // react-doctor-disable-next-line react-doctor/async-await-in-loop
          created.push(await createContextualNPC({
            mapId,
            entityType: "religion",
            entityId: religion._id,
            relationshipType: "leads",
            roleTitle: "Religious Leader",
            primary: !associatedCountry && leaderIndex === 0,
            additionalRelationships,
            currentLocation: headquarters ? { id: headquarters._id, name: headquarters.name } : undefined,
            religion: { id: religion._id, name: religion.name },
            associateReligion: "always",
            random: options.random,
            constraints: { professionName: "Acolyte" },
          }));
        }
        npcs.push(...created);
        addCount("Religion leadership NPCs", created.length);
      } catch (error) { issue({ severity: "error", phase: "religions", message: error instanceof Error ? error.message : String(error), entityType: "religion", entityId: religion._id, entityName: religion.name, continued: true }); }
    }
    report("religions", map.religions.length, map.religions.length, "Religion leadership processed.");

    const cultureCount = Math.max(1, options.cultureEldersPerCulture ?? 1);
    for (let index = 0; index < map.cultures.length; index += 1) {
      const culture = map.cultures[index]; const population = numeric(culture.ruralPop) + numeric(culture.urbanPop);
      report("cultures", index, map.cultures.length, `Processing culture ${culture.name}...`);
      if (population <= 0) { issue({ severity: "warning", phase: "cultures", message: "Skipped culture elders because total population was 0.", entityType: "culture", entityId: culture._id, entityName: culture.name, continued: true }); continue; }
      try {
        // Context generation is sequential for deterministic progress and seeded random output.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        const created = await generateSimpleContextPopulation(mapId, "culture", culture, cultureCount, "represents", "Cultural Elder", options.random); npcs.push(...created); addCount("Culture elder NPCs", created.length);
      } catch (error) { issue({ severity: "error", phase: "cultures", message: error instanceof Error ? error.message : String(error), entityType: "culture", entityId: culture._id, entityName: culture.name, continued: true }); }
    }
    report("cultures", map.cultures.length, map.cultures.length, "Culture elders processed.");

    const categories = (options.supportingCategoryIds ?? []).flatMap((id) => {
      const category = getSupportingNPCCategory(id);
      return category ? [category] : [];
    });
    const availableProfessionNames = new Set(listActiveNPCProfessions().map((profession) => profession.name.toLocaleLowerCase()));
    const count = Math.max(0, Math.floor(options.supportingNPCsPerCategory ?? 0));
    const totalSupportingSteps = map.cities.length * categories.length;
    let supportingCompleted = 0;
    for (const city of map.cities) for (const category of categories) {
      report("supporting", supportingCompleted, totalSupportingSteps, `Generating ${category.label} for ${city.name}...`);
      try {
        const professionName = randomItem(category.professionNames.filter((name) => availableProfessionNames.has(name.toLocaleLowerCase())), options.random);
        // Supporting generation is sequential for deterministic progress and seeded random output.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        const created = category.id === "religious-attendants"
          ? await generateReligiousAttendants(map, mapId, city, count, category.relationshipType, category.roleTitle, options.random, professionName ? { professionName } : undefined)
          : await generateSimpleContextPopulation(mapId, "city", city, count, category.relationshipType, category.roleTitle, options.random, professionName ? { professionName } : undefined);
        npcs.push(...created);
        addCount(`${category.label} NPCs`, created.length);
      } catch (error) { issue({ severity: "error", phase: "supporting", message: error instanceof Error ? error.message : String(error), entityType: "city", entityId: city._id, entityName: city.name, continued: true }); }
      supportingCompleted += 1;
      if (supportingCompleted % yieldEvery === 0) {
        // Yield points intentionally serialize long-running generation.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        await yieldToBrowser();
      }
    }
    report("supporting", totalSupportingSteps, totalSupportingSteps, "Supporting NPC generation complete.");

    const generationCompletedAt = performance.now(); diagnostics.phases.push({ phase: "generation", startedAt: generationStartedAt, completedAt: generationCompletedAt, durationMs: generationCompletedAt - generationStartedAt, records: npcs.length });
    return npcs;
  } finally {
    const completedAt = performance.now(); diagnostics.completedAt = new Date().toISOString(); diagnostics.totalDurationMs = completedAt - overallStartedAt; diagnostics.slowestPhase = diagnostics.phases.reduce((slowest, phase) => !slowest || phase.durationMs > slowest.durationMs ? phase : slowest, undefined as typeof diagnostics.phases[number] | undefined)?.phase; stopMonitor(); options.onPerformanceDiagnostics?.(diagnostics);
  }
}
