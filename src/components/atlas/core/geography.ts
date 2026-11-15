import type { AtlasGeographyData, AtlasGeographySave, AtlasRenderContext } from "../../../definitions/Atlas";
import type { MapInf, TLCity, TLCountry } from "../../../definitions/TerraLogger";

export function cityBiome(city: TLCity, data?: AtlasGeographyData) {
  const id = city.cellId === undefined ? undefined : data?.geography?.cells.biome[city.cellId];
  return data?.biomes?.find((biome) => biome.i === id);
}

export function countryBiomeComposition(countryId: number, data?: AtlasGeographyData) {
  const counts = new Map<number, number>();
  const cells = data?.geography?.cells;
  if (!cells) return [];
  for (let cell = 0; cell < cells.biome.length; cell += 1) {
    const id = cells.biome[cell];
    // AFMG reserves biome 0 for marine cells. Coverage here describes land cells.
    if (cells.country[cell] === countryId && id !== 0) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  const biomes = new Map((data?.biomes ?? []).map((biome) => [biome.i, biome]));
  return Array.from(counts, ([id, count]) => ({
    id, count, percent: count / total * 100, biome: biomes.get(id),
  })).sort((left, right) => right.count - left.count || left.id - right.id);
}

export function applyGeographyChanges(map: MapInf, changes: AtlasGeographySave): MapInf {
  if (changes.mapId !== (map.mapId ?? map.id)) {
    throw new Error("Biome changes belong to another map.");
  }
  const before = { biomes: map.biomes, geography: map.geography };
  if (JSON.stringify(changes.before) !== JSON.stringify(before)) {
    throw new Error("Map geography changed while this editor was open. Reopen the editor before saving.");
  }
  const biomes = changes.after.biomes;
  if (!biomes || !map.biomes || biomes.length !== map.biomes.length) {
    throw new Error("Biome definitions must retain the existing IDs.");
  }
  const ids = new Set<number>();
  for (let index = 0; index < biomes.length; index += 1) {
    const biome = biomes[index];
    const original = map.biomes[index];
    if (biome.i !== original.i || ids.has(biome.i)) {
      throw new Error("Biome IDs and ordering cannot be changed.");
    }
    ids.add(biome.i);
    if (typeof biome.name !== "string" || !biome.name.trim()) {
      throw new Error("Every biome must have a name.");
    }
    if (typeof biome.color !== "string" || (biome.color !== original.color &&
      !/^#[0-9a-f]{6}$/i.test(biome.color))) {
      throw new Error("Biome colours must use six-digit hex values.");
    }
    if (JSON.stringify(biome) !== JSON.stringify({ ...original, name: biome.name, color: biome.color })) {
      throw new Error("Only biome names and colours can be edited here.");
    }
  }
  const geography = changes.after.geography;
  if (map.geography) {
    if (!geography || geography.cells.biome.length !== map.geography.cells.biome.length ||
      JSON.stringify(geography.cells.country) !== JSON.stringify(map.geography.cells.country)) {
      throw new Error("Geography edits must preserve the cell count and country boundaries.");
    }
    if (geography.cells.biome.some((id) => !Number.isSafeInteger(id) || !ids.has(id))) {
      throw new Error("Every cell must reference an existing biome.");
    }
  } else if (geography !== undefined) {
    throw new Error("Reimport this map to populate its geography before editing cell assignments.");
  }
  return { ...map, biomes, geography };
}

// Generic prose for AFMG's fixed default biome IDs, not measured local conditions.
// Custom biome IDs have no inferred climate or terrain.
const biomeDescriptions: Record<number, { climate: string; terrain: string }> = {
  0: { climate: "Marine conditions influenced by surrounding water.", terrain: "Open water and aquatic environments." },
  1: { climate: "Hot, arid conditions with scarce and irregular rainfall.", terrain: "Sparse vegetation over exposed sand, gravel, or rock." },
  2: { climate: "Cold, dry conditions with limited precipitation.", terrain: "Exposed ground with sparse drought-tolerant vegetation." },
  3: { climate: "Warm conditions with distinct wet and dry seasons.", terrain: "Grassland with scattered trees and shrubs." },
  4: { climate: "Seasonal conditions with rainfall supporting grasses rather than dense forest.", terrain: "Open grassland with grasses, herbs, and occasional shrubs." },
  5: { climate: "Warm conditions with alternating wet and dry seasons.", terrain: "Seasonal tropical woodland with a grassy or shrubby understory." },
  6: { climate: "Temperate conditions with seasonal changes and regular precipitation.", terrain: "Broadleaf woodland with a seasonal canopy and vegetated ground cover." },
  7: { climate: "Warm, humid conditions with frequent rainfall.", terrain: "Dense evergreen forest with layered vegetation." },
  8: { climate: "Mild to cool, wet conditions with frequent moisture.", terrain: "Dense woodland with a shaded, mossy forest floor." },
  9: { climate: "Long, cold winters and short, cool summers.", terrain: "Coniferous woodland with mosses and a sparse understory." },
  10: { climate: "Cold conditions with a short growing season.", terrain: "Largely treeless ground with low shrubs, grasses, mosses, and lichens." },
  11: { climate: "Persistent cold, with snow and ice dominating the environment.", terrain: "Ice-covered surfaces with little exposed vegetation." },
  12: { climate: "Persistently moist conditions; temperature varies with the surrounding region.", terrain: "Waterlogged ground supporting marsh, swamp, or reed vegetation." },
};

// Short descriptive terms for Country rows; City prose remains separate.
const countryBiomeTerms: Record<number, { climate: string[]; terrain: string[] }> = {
  1: { climate: ["hot", "arid", "dry air", "scarce rainfall", "high evaporation"], terrain: ["barren", "sandy", "gravelly", "rocky", "sparse vegetation"] },
  2: { climate: ["cold", "arid", "dry air", "low precipitation", "seasonal frost"], terrain: ["barren", "exposed soil", "gravelly", "rocky", "sparse vegetation"] },
  3: { climate: ["warm", "seasonal rainfall", "wet season", "dry season", "periodic drought"], terrain: ["grassy", "open woodland", "scattered trees", "shrubs", "seasonal ground cover"] },
  4: { climate: ["seasonal", "moderate rainfall", "periodic drought", "variable temperatures", "seasonal growth"], terrain: ["open", "grassy", "herbaceous", "sparse trees", "low scrub"] },
  5: { climate: ["tropical", "warm", "seasonally humid", "wet season", "dry season"], terrain: ["wooded", "seasonal canopy", "broadleaf trees", "shrubs", "grassy understory"] },
  6: { climate: ["temperate", "seasonal", "moderate rainfall", "warm summers", "cool winters"], terrain: ["wooded", "broadleaf canopy", "seasonal foliage", "leaf litter", "vegetated ground"] },
  7: { climate: ["tropical", "warm", "humid", "frequent rainfall", "limited seasonality"], terrain: ["dense forest", "evergreen canopy", "layered vegetation", "vines", "shaded ground"] },
  8: { climate: ["temperate", "mild to cool", "humid", "frequent rainfall", "persistent moisture"], terrain: ["dense woodland", "mossy ground", "ferns", "layered canopy", "shaded understory"] },
  9: { climate: ["cold", "long winters", "short summers", "seasonal snow", "brief growing season"], terrain: ["coniferous", "wooded", "mossy", "sparse understory", "needle litter"] },
  10: { climate: ["cold", "long winters", "short summers", "low precipitation", "brief growing season"], terrain: ["treeless", "low shrubs", "grasses", "mosses", "lichens"] },
  11: { climate: ["frigid", "persistent cold", "snowfall", "frost", "minimal growing season"], terrain: ["ice-covered", "snow-covered", "exposed ice", "sparse bare ground", "minimal vegetation"] },
  12: { climate: ["moist", "humid", "high water availability", "seasonal flooding", "region-dependent temperatures"], terrain: ["waterlogged", "marshy", "swampy", "reeds", "saturated soil"] },
};

export function biomeGeographyText(context: AtlasRenderContext, kind: "climate" | "terrain"): string {
  if (context.sourceType === "city") {
    const biome = cityBiome(context.entity as TLCity, context.mapGeography);
    return biome ? biomeDescriptions[biome.i]?.[kind] ?? "" : "";
  }
  if (context.sourceType !== "country") return "";
  const rows = countryBiomeComposition((context.entity as TLCountry).id, context.mapGeography);
  return rows.flatMap((row) => {
    const terms = countryBiomeTerms[row.id]?.[kind];
    return row.biome && terms ? [`${row.biome.name}: ${terms.join(", ")}`] : [];
  }).join("\n");
}
