import type { TLMapEra, TLHistoryEraReference } from "../../../definitions/History";
import type { MapInf, TLNPC } from "../../../definitions/TerraLogger";
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
  return map.historyGenerator?.currentEra?.id ?? `era:current:${map.mapId}`;
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
      description: current?.description, content: current?.content,
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
