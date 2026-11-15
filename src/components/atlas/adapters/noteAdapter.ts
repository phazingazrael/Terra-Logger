import type { TLNote } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { clear, computedBlock, createContentShell, entitySection, richTextBlock, sectionPreset, descriptionBlock } from "../core/presets";

// Default groups and custom-group support:
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/src/controllers/route-groups-editor.ts
const routeNoteCategories: Record<string, { label: string; color: string }> = {
  roads: { label: "Road", color: "#795548" },
  trails: { label: "Trail", color: "#33691e" },
  searoutes: { label: "Sea route", color: "#1565c0" },
};

export function getNoteCategory(note: Pick<TLNote, "id" | "type">): {
  id: string;
  label: string;
  color?: string;
} {
  const format = (value: string) => value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (character) => character.toUpperCase());
  const root = note.id.replace(/\d+|-/g, "") || note.type || "other";
  if (/^route(?:Label)?\d+$/i.test(note.id)) {
    const group = note.type?.trim() || "route";
    if (group === "route" || group === "routeLabel") {
      return { id: "route", label: "Route", color: "#455a64" };
    }
    const category = Object.keys(routeNoteCategories).includes(group)
      ? routeNoteCategories[group] : undefined;
    if (category) return { id: `route:${group}`, ...category };
    let hue = 0;
    for (const character of group) hue = (hue * 31 + character.charCodeAt(0)) % 360;
    return {
      id: `route:${group}`,
      label: `Route: ${format(group)}`,
      color: `hsl(${hue}, 55%, 35%)`,
    };
  }
  if (root === "journey") return { id: root, label: "Journey", color: "#6a1b9a" };
  const label = root === "burg" ? "City"
    : root === "state" || root === "stateLabel" ? "Country" : format(root);
  return { id: root, label };
}

function createNoteContent(entity: TLNote): AtlasContent {
  return createContentShell({
    sourceType: "note",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.name,
    layout: "stack",
    className: "content-stack",
    sections: [
      sectionPreset("Header", "section header", [computedBlock("noteHeader", "header", "note")], clear),
      entitySection("Note Body", "section note-legend", [descriptionBlock("Note Body")]),
      sectionPreset("Editor Notes", "section editor-notes", [richTextBlock("Add your notes here.")]),
      sectionPreset("Tags", "section tags", [computedBlock("largeTags", "Tags", "tags")], clear),
    ],
  });
}

export const noteAdapter: AtlasAdapter<"note"> = {
  sourceType: "note",
  label: "Note",
  defaultLayout: "stack",
  resizableSectionClasses: [
    "editor-notes", "freeform",
  ],
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.name,
  createDefaultContent: createNoteContent,
  sectionPresets: commonSectionPresets<"note">(),
  blockPresets: commonBlockPresets<"note">(),
};
