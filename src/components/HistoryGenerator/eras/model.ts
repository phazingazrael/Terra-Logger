import type { TLHistoryEra, TLHistoryEraReference } from "../../../definitions/History";
import type { TLNPC } from "../../../definitions/TerraLogger";

export type PreviousEraDraft = {
  npcId: string;
  npcName: string;
  age: number;
  birthTimelineYear: number;
};

export type PreviousEraInput = {
  name: string;
  shortName: string;
  firstYear: number;
  finalYear: number;
  description?: string;
};

export function historyEraLength(firstYear: number, finalYear: number): number {
  return Math.max(1, Math.floor(finalYear) - Math.floor(firstYear) + 1);
}

export function createPreviousEra(input: PreviousEraInput, timelineEndYear: number): TLHistoryEra {
  const firstYear = Math.floor(input.firstYear);
  const finalYear = Math.max(firstYear, Math.floor(input.finalYear));
  const length = historyEraLength(firstYear, finalYear);
  return {
    id: `era:${globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`}`,
    name: input.name.trim(),
    shortName: input.shortName.trim(),
    firstYear,
    finalYear,
    length,
    timelineStartYear: timelineEndYear - length + 1,
    timelineEndYear,
    description: input.description?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };
}

export function orderPreviousEras(eras: readonly TLHistoryEra[]): TLHistoryEra[] {
  return [...eras].sort((left, right) => left.timelineStartYear - right.timelineStartYear);
}

export function resolveHistoryEra(timelineYear: number, eras: readonly TLHistoryEra[]): TLHistoryEraReference | undefined {
  const era = eras.find((candidate) => timelineYear >= candidate.timelineStartYear && timelineYear <= candidate.timelineEndYear);
  if (!era) return undefined;
  return {
    id: era.id,
    name: era.name,
    shortName: era.shortName,
    year: era.firstYear + (timelineYear - era.timelineStartYear),
  };
}

export function collectPreviousEraDrafts(
  npcs: readonly TLNPC[],
  currentYear: number,
  currentEraMinimumYear: number,
  eras: readonly TLHistoryEra[],
): PreviousEraDraft[] {
  return npcs.flatMap((npc) => {
    const age = typeof npc.age === "number" ? npc.age : Number(npc.age);
    if (!Number.isFinite(age) || age < 0) return [];
    const birthTimelineYear = Math.floor(currentYear) - Math.floor(age);
    if (birthTimelineYear >= currentEraMinimumYear || resolveHistoryEra(birthTimelineYear, eras)) return [];
    return [{ npcId: npc._id, npcName: npc.name, age: Math.floor(age), birthTimelineYear }];
  });
}

export function nextPreviousEraTimelineEnd(currentEraMinimumYear: number, eras: readonly TLHistoryEra[]): number {
  if (!eras.length) return currentEraMinimumYear - 1;
  return Math.min(...eras.map((era) => era.timelineStartYear)) - 1;
}

export function applyEraMetadataToNPCs(npcs: readonly TLNPC[], eras: readonly TLHistoryEra[]): void {
  for (const npc of npcs) {
    for (const entry of npc.history) {
      entry.era = entry.year === undefined ? undefined : resolveHistoryEra(entry.year, eras);
    }
  }
}

