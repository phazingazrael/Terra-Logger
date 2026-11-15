import { v7 as uuidv7 } from "uuid";

import type { TLMapInfo, TLNote } from "../../../definitions/TerraLogger";
import type { Tag } from "../../../definitions/Common";
import { getNoteCategory, noteAdapter } from "../../atlas/adapters/noteAdapter";
import { getImportedNoteKey } from "../../UploadMap/utils/mergeMapEntities";

export const mutateNotes = async (data: MapInfo, tempMap: TLMapInfo) => {
  const sourceNotes = new Map<string, Note & { type?: string; color?: string }>();
  for (const note of data.notes) {
    if (sourceNotes.has(note.id)) throw new Error(`Duplicate imported Note ID: ${note.id}.`);
    sourceNotes.set(note.id, note);
  }
  const attachedIds = new Set<string>();
  for (const note of data.attachedNotes ?? []) {
    const key = getImportedNoteKey(note.id);
    const matches = [...sourceNotes.values()].filter((entry) => getImportedNoteKey(entry.id) === key);
    if (matches.length > 1) throw new Error(`Ambiguous legacy Notes for AFMG entity ${key}.`);
    const existing = matches[0];
    const id = existing?.id ?? note.id;
    sourceNotes.set(id, {
      ...note, id, name: existing?.name || note.name,
      legend: existing?.legend && existing.legend !== note.legend
        ? `${existing.legend}<hr>${note.legend}` : note.legend,
    });
    attachedIds.add(id);
  }
  const importedTravel = new Set<string>();
  for (const travel of createTravelNotes(data)) {
    // Older authored route Notes may be attached to the route's label.
    const labelId = travel.id.replace(/^route/, "routeLabel");
    const id = sourceNotes.has(travel.id) ? travel.id
      : sourceNotes.has(labelId) ? labelId : travel.id;
    const existing = sourceNotes.get(id);
    sourceNotes.set(id, {
      id,
      type: travel.type,
      color: travel.color,
      name: existing?.name || travel.name,
      legend: existing?.legend ? `${existing.legend}<hr>${travel.legend}` : travel.legend,
    });
    importedTravel.add(id);
  }
  for (const note of sourceNotes.values()) {
    let type = "";
    const rawType = note.id.replace(/\d+|-/g, "");

    if (rawType === "burg") {
      type = "city";
    } else if (rawType === "state" || rawType === "stateLabel") {
      type = "country";
    } else {
      type = note.type ?? rawType;
    }
    const newNote: TLNote = {
      _id: uuidv7(),
      importedNote: attachedIds.has(note.id) ? { name: note.name, legend: note.legend } : undefined,
      importedTravel: importedTravel.has(note.id)
        ? { name: note.name, legend: note.legend, color: note.color } : undefined,
      legend: note.legend,
      id: note.id,
      name: note.name,
      type,
      tags: [{
        "_id": "0192be16-c07e-7801-9315-0ff0178d8eb0",
        "Default": true,
        "Description": "Written or recorded remarks, observations, or reminders related to the world.",
        "Name": "Notes",
        "Type": "Miscellaneous"
      }] as Tag[],
    };

    newNote.content = noteAdapter.createDefaultContent(newNote);

    tempMap.notes.push(newNote);
  }
  return tempMap.notes;
};

function escapeText(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: unknown): string {
  if (value === undefined) return "";
  const text = typeof value === "boolean" ? value ? "Yes" : "No" : value;
  return `<p><strong>${escapeText(label)}:</strong> ${escapeText(text)}</p>`;
}

function number(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function readRecords<T extends { i: number }>(
  section: string | undefined,
  label: string,
): T[] {
  if (!section?.trim()) return [];
  let value: unknown;
  try {
    value = JSON.parse(section);
  } catch {
    throw new Error(`Cannot create travel Notes: malformed AFMG ${label} JSON.`);
  }
  const ids = new Set<number>();
  if (!Array.isArray(value) || !value.every((entry) => {
    if (!entry || typeof entry !== "object" || !Number.isInteger(entry.i) || entry.i < 0) return false;
    if (ids.has(entry.i)) return false;
    ids.add(entry.i);
    return true;
  })) {
    throw new Error(`Cannot create travel Notes: invalid or duplicate AFMG ${label} IDs.`);
  }
  return value as T[];
}

function createTravelNotes(data: MapInfo): Array<Note & { type: string; color?: string }> {
  const sections = data.renderingSource?.sections;
  const routes = readRecords<AFMGTravelRoute>(sections?.[37], "routes section (37)");
  const journeys = readRecords<AFMGJourney>(sections?.[52], "journeys section (52)");
  const scale = Number(data.settings.distanceScale);
  const unit = data.settings.distanceUnit;
  const cities = new Map(
    data.cities.filter((city) => city.i && !city.removed)
      .map((city) => [city.cell, city.name]),
  );
  const location = (cell: number | undefined) => cell === undefined
    ? "Not recorded" : cities.get(cell) ?? `Cell ${cell}`;
  const distance = (pixels: number | undefined) => {
    if (pixels === undefined || !Number.isFinite(pixels)) return "Not recorded";
    return Number.isFinite(scale) && scale > 0 && unit
      ? `${number(pixels * scale)} ${unit}`
      : `${number(pixels)} map pixels`;
  };
  const notes: Array<Note & { type: string; color?: string }> = [];

  for (const route of routes) {
    if (route.merged) continue;
    if (!Array.isArray(route.points)) {
      throw new Error(`Cannot create travel Note for route ${route.i}: missing path points.`);
    }
    const type = getNoteCategory({ id: `route${route.i}`, type: route.group }).label;
    const name = route.name || route.label?.text?.replace(/\|/g, " ") || `${type} ${route.i}`;
    const first = route.points[0];
    const last = route.points[route.points.length - 1];
    notes.push({
      id: `route${route.i}`,
      type: route.group,
      name,
      legend: [
        '<div class="travel-route-card">',
        '<div class="journey-segment-header">',
        `<span class="journey-segment-number">${escapeText(type)}</span>`,
        "<h2>Route details</h2>",
        "</div>",
        `<p class="journey-segment-route"><strong>${escapeText(location(first?.[2]))}</strong> → <strong>${escapeText(location(last?.[2]))}</strong></p>`,
        '<div class="journey-segment-details">',
        row("Distance", distance(route.length)),
        "</div>",
        "<details><summary>Source details</summary>",
        '<div class="journey-segment-details">',
        row("Source route ID", route.i),
        row("Feature ID", route.feature),
        row("Path points", route.points.length),
        row("Locked in AFMG", route.lock),
        "</div>",
        "</details>",
        "</div>",
      ].join(""),
    });
  }

  for (const journey of journeys) {
    const segments = journey.segments.map((segment, index) => [
      '<li class="journey-segment">',
      '<div class="journey-segment-header">',
      `<span class="journey-segment-number">Stage ${index + 1}</span>`,
      `<h3>${escapeText(segment.name)}</h3>`,
      "</div>",
      `<p class="journey-segment-route">${segment.from !== undefined && segment.from === segment.to
        ? `Stop in <strong>${escapeText(location(segment.from))}</strong>`
        : `<strong>${escapeText(location(segment.from))}</strong> → <strong>${escapeText(location(segment.to))}</strong>`}</p>`,
      '<div class="journey-segment-details">',
      row("Transport", segment.transport),
      row("Speed", `${number(segment.speed)} km/h`),
      row("Distance", distance(segment.distance)),
      row("Recorded duration", segment.duration === undefined
        ? undefined : `${number(segment.duration)} hours`),
      "</div>",
      "<details><summary>Source details</summary>",
      '<div class="journey-segment-details">',
      row("Source segment ID", segment.i),
      row("Avoid roads", segment.avoidRoads),
      row("Custom path", segment.custom),
      row("Visible in AFMG", segment.visible),
      row("Colour override", segment.color),
      row("Path points", segment.points.length),
      "</div>",
      "</details>",
      "</li>",
    ].join(""));
    notes.push({
      id: `journey${journey.i}`,
      type: "journey",
      color: journey.color,
      name: journey.name,
      legend: [
        "<h2>Imported Journey details</h2>",
        '<div class="travel-overview journey-segment-details">',
        row("Journey type", journey.type),
        row("Source Journey ID", journey.i),
        row("Distance", distance(journey.segments.reduce(
          (total, segment) => total + segment.distance, 0))),
        row("Colour", journey.color),
        row("Visible in AFMG", journey.visible),
        row("Locked in AFMG", journey.lock),
        "</div>",
        `<h2>Segments</h2><ol class="journey-segments">${segments.join("")}</ol>`,
      ].join(""),
    });
  }
  return notes;
}
