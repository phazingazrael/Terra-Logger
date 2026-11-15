import { readStoredSvgStyles } from "./restoreSvgStyles";

// Geometry, source entities, fonts, custom icons, labels and presentation data.
// Keep source records: Atlas mutation intentionally omits rendering properties.
// SVG and economy sections already have their own persistence paths.
const renderingSections = [
  2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 24, 25, 26, 27, 29, 30, 32, 34, 35, 36, 37, 38, 39,
  45, 46, 47, 48, 49, 50, 51, 52,
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseSection(
  sections: readonly string[],
  index: number,
  name: string,
): unknown {
  try {
    return JSON.parse(sections[index]);
  } catch {
    throw new Error(`Invalid AFMG ${name} section (${index}): malformed JSON.`);
  }
}

export function parseRenderingSource(
  sections: readonly string[],
): AFMGRenderingSource {
  const version = sections[0]?.split("|")[0] ?? "";
  const [major, minor] = version.split(".").map(Number);
  const requiresNewSections = major > 1 || (major === 1 && minor >= 149);

  for (const [index, name] of [
    [49, "relief"],
    [50, "layer state"],
    [51, "graph overrides"],
  ] as const) {
    if (requiresNewSections && !sections[index]?.trim()) {
      throw new Error(`Missing AFMG ${name} section (${index}) for map version ${version}.`);
    }
  }

  if (sections[49]?.trim()) {
    const relief = parseSection(sections, 49, "relief");
    if (!Array.isArray(relief) || !relief.every((icon) =>
      isRecord(icon) && typeof icon.icon === "string" &&
      typeof icon.x === "number" && Number.isFinite(icon.x) &&
      typeof icon.y === "number" && Number.isFinite(icon.y) &&
      typeof icon.s === "number" && Number.isFinite(icon.s) && icon.s > 0
    )) {
      throw new Error("Invalid AFMG relief section (49): expected icons with an icon name, finite coordinates and positive size.");
    }
  }

  if (sections[50]?.trim()) {
    const layers = parseSection(sections, 50, "layer state");
    if (!isRecord(layers) ||
      !Array.isArray(layers.order) || !layers.order.every((id) => typeof id === "string") ||
      !Array.isArray(layers.active) || !layers.active.every((id) => typeof id === "string")
    ) {
      throw new Error("Invalid AFMG layer state section (50): expected order and active lists of layer IDs.");
    }
  }

  if (sections[51]?.trim()) {
    const overrides = parseSection(sections, 51, "graph overrides");
    if (!isRecord(overrides)) {
      throw new Error("Invalid AFMG graph overrides section (51): expected an object.");
    }
  }

  readStoredSvgStyles(sections[48], version);

  if (sections[52]?.trim()) {
    const journeys = parseSection(sections, 52, "journeys");
    const isFiniteNumber = (value: unknown): value is number =>
      typeof value === "number" && Number.isFinite(value);
    const isId = (value: unknown) =>
      isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
    if (!Array.isArray(journeys) || !journeys.every((journey) =>
      isRecord(journey) && isId(journey.i) &&
      typeof journey.name === "string" &&
      typeof journey.type === "string" &&
      typeof journey.color === "string" &&
      (journey.visible === undefined || typeof journey.visible === "boolean") &&
      (journey.lock === undefined || typeof journey.lock === "boolean") &&
      Array.isArray(journey.segments) && journey.segments.every((segment) =>
        isRecord(segment) && isId(segment.i) &&
        typeof segment.name === "string" &&
        typeof segment.transport === "string" &&
        isFiniteNumber(segment.speed) && segment.speed >= 0 &&
        isFiniteNumber(segment.distance) && segment.distance >= 0 &&
        (segment.color === undefined || typeof segment.color === "string") &&
        (segment.from === undefined || isId(segment.from)) &&
        (segment.to === undefined || isId(segment.to)) &&
        (segment.duration === undefined ||
          (isFiniteNumber(segment.duration) && segment.duration >= 0)) &&
        [segment.visible, segment.custom, segment.avoidRoads].every((flag) =>
          flag === undefined || typeof flag === "boolean") &&
        Array.isArray(segment.points) && segment.points.every((point) =>
          Array.isArray(point) && point.length === 3 &&
          isFiniteNumber(point[0]) && isFiniteNumber(point[1]) && isId(point[2]))
      )
    )) {
      throw new Error("Invalid AFMG journeys section (52): expected journeys with valid segments and [x, y, cellId] points.");
    }
  }

  // These remain encoded source inputs, not a second editable entity model.
  // Nested rendering semantics are validated when constructing the SVG.
  const retained: AFMGRenderingSource["sections"] = {};
  for (const index of renderingSections) {
    if (sections[index] !== undefined) retained[index] = sections[index];
  }
  return { version, sections: retained };
}
