// Legacy files store only colours, habitability, and names. The remaining defaults
// match the pinned AFMG biome generator; custom biome IDs use its migration defaults.
const legacyIcons: Record<string, number>[] = [
  {}, { dune: 3, cactus: 6, deadTree: 1 }, { dune: 9, deadTree: 1 },
  { acacia: 1, grass: 9 }, { grass: 1 }, { acacia: 8, palm: 1 },
  { deciduous: 1 }, { acacia: 5, palm: 3, deciduous: 1, swamp: 1 },
  { deciduous: 6, swamp: 1 }, { conifer: 1 }, { grass: 1 }, {}, { swamp: 1 },
];
const legacyDensity = [0, 3, 2, 120, 120, 120, 120, 150, 150, 100, 5, 0, 250];
const legacyCost = [10, 200, 150, 60, 50, 70, 70, 80, 90, 200, 1000, 5000, 150];

export function parseBiomes(section: string | undefined): AFMGBiome[] {
  const raw = section?.trim();
  if (!raw) throw new Error("Invalid AFMG biomes section (3): biome definitions are missing.");

  let records: unknown;
  if (raw.startsWith("[")) {
    try {
      records = JSON.parse(raw);
    } catch {
      throw new Error("Invalid AFMG biomes section (3): malformed JSON.");
    }
  } else {
    const columns = raw.split("|");
    if (columns.length !== 3) {
      throw new Error("Invalid AFMG biomes section (3): expected a JSON list or three legacy columns.");
    }
    const [colors, habitability, names] = columns.map((column) => column.split(","));
    if (colors.length !== names.length || habitability.length !== names.length ||
      habitability.some((value) => !value.trim())) {
      throw new Error("Invalid AFMG biomes section (3): legacy columns have missing or mismatched values.");
    }
    records = names.map((name, i) => ({
      i,
      name,
      color: colors[i],
      habitability: Number(habitability[i]),
      iconsDensity: legacyDensity[i] ?? 0,
      icons: Object.entries(legacyIcons[i] ?? {}).flatMap(([icon, weight]) =>
        Array<string>(weight).fill(icon)),
      cost: legacyCost[i] ?? 50,
      ...(name === "removed" ? { removed: true } : {}),
    }));
  }

  if (!Array.isArray(records) || !records.length) {
    throw new Error("Invalid AFMG biomes section (3): expected a non-empty list.");
  }

  const ids = new Set<number>();
  return records.map((value, index) => {
    const invalid = () => new Error(`Invalid AFMG biome at section 3, index ${index}.`);
    if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid();
    const biome = value as Record<string, unknown>;
    if (typeof biome.i !== "number" || !Number.isSafeInteger(biome.i) ||
      biome.i < 0 || ids.has(biome.i) ||
      typeof biome.name !== "string" || !biome.name.trim() ||
      typeof biome.color !== "string" || !biome.color.trim() ||
      typeof biome.habitability !== "number" || !Number.isFinite(biome.habitability) ||
      typeof biome.iconsDensity !== "number" || !Number.isFinite(biome.iconsDensity) ||
      typeof biome.cost !== "number" || !Number.isFinite(biome.cost) ||
      (biome.removed !== undefined && typeof biome.removed !== "boolean")) {
      throw invalid();
    }
    ids.add(biome.i);

    // AFMG discards derived cells/area/rural/urban statistics on load.
    return {
      i: biome.i,
      name: biome.name,
      color: biome.color,
      habitability: biome.habitability,
      iconsDensity: biome.iconsDensity,
      icons: readBiomeIcons(biome.icons, index),
      cost: biome.cost,
      ...(typeof biome.removed === "boolean" ? { removed: biome.removed } : {}),
    };
  });
}

// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/generators/relief-generator.ts
function readBiomeIcons(value: unknown, index: number): AFMGBiome["icons"] {
  const invalid = () => new Error(`Invalid AFMG biome icon pool at section 3, index ${index}.`);
  if (Array.isArray(value)) {
    if (!value.every((icon) => typeof icon === "string")) throw invalid();
    return [...value];
  }
  if (!value || typeof value !== "object") throw invalid();
  return Object.fromEntries(Object.entries(value).map(([icon, raw]) => {
    if (!icon.trim() || !raw || typeof raw !== "object" || Array.isArray(raw)) throw invalid();
    const entry = raw as Record<string, unknown>;
    if (typeof entry.weight !== "number" || !Number.isFinite(entry.weight) || entry.weight <= 0 ||
      (entry.size !== undefined && (typeof entry.size !== "number" ||
        !Number.isFinite(entry.size) || entry.size <= 0))) throw invalid();
    return [icon, { weight: entry.weight, ...(entry.size === undefined ? {} : { size: entry.size }) }];
  }));
}
