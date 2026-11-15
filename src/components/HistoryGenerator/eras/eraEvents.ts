import { v7 as uuidv7 } from "uuid";
import type { TLEraEvent, TLMapEra } from "../../../definitions/History";
import type { NPCHistoryEntry, TLNPC } from "../../../definitions/TerraLogger";

export function validateEraEvents(era: TLMapEra): void {
  if (era.events !== undefined && !Array.isArray(era.events)) throw new Error("Era events must be a list.");
  const ids = new Set<string>();
  for (const event of era.events ?? []) {
    if (!event || typeof event.id !== "string" || !event.id || ids.has(event.id)) {
      throw new Error("Era events require unique IDs.");
    }
    ids.add(event.id);
    if (typeof event.name !== "string" || !event.name.trim() || typeof event.description !== "string" ||
      (event.dateText !== undefined && typeof event.dateText !== "string")) {
      throw new Error("Every Era event requires a name and text details.");
    }
    if (!Number.isSafeInteger(event.year) || event.year < era.firstYear || event.year > era.finalYear) {
      throw new Error(`Event "${event.name}" must use a whole local year between ${era.firstYear} and ${era.finalYear}.`);
    }
    if (event.npcHistory !== undefined && !Array.isArray(event.npcHistory)) throw new Error("NPC history links must be a list.");
    const links = new Set<string>();
    for (const link of event.npcHistory ?? []) {
      if (!link || typeof link.npcId !== "string" || !link.npcId || typeof link.entryId !== "string" || !link.entryId) {
        throw new Error("NPC history links require an NPC ID and a history entry ID.");
      }
      const key = `${link.npcId}:${link.entryId}`;
      if (links.has(key)) throw new Error("An NPC history entry can only be linked once to the same Era event.");
      links.add(key);
    }
  }
}

export function createEraEventFromNPC(era: TLMapEra, npc: TLNPC, entry: NPCHistoryEntry): TLEraEvent {
  return {
    id: uuidv7(),
    name: `${npc.name}: ${entry.title}`,
    year: entry.year === undefined ? Number.NaN : era.firstYear + entry.year - era.timelineStartYear,
    description: entry.description,
    npcHistory: [{ npcId: npc._id, entryId: entry.id }],
  };
}

export function npcEraEventLinks(eras: readonly TLMapEra[], npcId: string) {
  const result = new Map<string, Array<{ eraId: string; eventId: string; name: string }>>();
  for (const era of eras) for (const event of era.events ?? []) for (const link of event.npcHistory ?? []) {
    if (link.npcId !== npcId) continue;
    const matches = result.get(link.entryId) ?? [];
    matches.push({ eraId: era._id, eventId: event.id, name: `${era.name}: ${event.name}` });
    result.set(link.entryId, matches);
  }
  return result;
}
