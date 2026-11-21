import { readStoredSvgStyles } from "./restoreSvgStyles";

// Geometry, source entities, fonts, custom icons, labels and presentation data.
// Keep source records: Atlas mutation intentionally omits rendering properties.
// SVG and economy sections already have their own persistence paths.
const renderingSections = [
  2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 24, 25, 26, 27, 29, 30, 32, 34, 35, 36, 37, 38, 39,
  45, 46, 47, 48, 49, 50, 51, 52, 53,
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
      isRecord(icon) && isReliefReference(icon) &&
      typeof icon.x === "number" && Number.isFinite(icon.x) &&
      typeof icon.y === "number" && Number.isFinite(icon.y) &&
      typeof icon.s === "number" && Number.isFinite(icon.s) && icon.s > 0
    )) {
      throw new Error("Invalid AFMG relief section (49): expected valid icon references or type descriptors, finite coordinates and positive size.");
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

  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/67d555b83f0b2f40ae50b03c9bbfd018175acc6d/src/types/legend.ts
  if (sections[53]?.trim()) {
    const legends = parseSection(sections, 53, "legends");
    if (!Array.isArray(legends) || !legends.every((legend) =>
      isRecord(legend) && typeof legend.name === "string" &&
      Array.isArray(legend.items) && legend.items.every((item) =>
        Array.isArray(item) && item.length === 3 &&
        (typeof item[0] === "string" ||
          (typeof item[0] === "number" && Number.isFinite(item[0]))) &&
        typeof item[1] === "string" && typeof item[2] === "string")
    )) {
      throw new Error("Invalid AFMG legends section (53): expected named legends with [ID, color, label] items.");
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

// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/generators/relief-generator.ts
function isReliefReference(icon: Record<string, unknown>): boolean {
  if ("icon" in icon) {
    return typeof icon.icon === "string" && !!icon.icon.trim() &&
      !("type" in icon) && icon.variant === undefined && icon.set === undefined;
  }
  const types = [
    "mount", "mountSnow", "vulcan", "hill", "dune", "deciduous", "conifer",
    "coniferSnow", "acacia", "palm", "grass", "swamp", "cactus", "deadTree",
  ];
  const sets = ["simple", "colored", "gray", "illustrated", "stickers"];
  return typeof icon.type === "string" && types.includes(icon.type) &&
    (icon.variant === undefined || (typeof icon.variant === "number" &&
      Number.isSafeInteger(icon.variant) && icon.variant > 0)) &&
    (icon.set === undefined || (typeof icon.set === "string" && sets.includes(icon.set)));
}
