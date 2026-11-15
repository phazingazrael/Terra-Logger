import type { TLMapGeography, TLMapInfo } from "../../definitions/TerraLogger";

export function applyImportedGeography(
  map: TLMapInfo,
  data: MapInfo,
  pack: Pack,
): void {
  const biome = Array.from(pack.cells.biome);
  const country = Array.from(pack.cells.state);
  if (!biome.length || biome.length !== country.length) {
    throw new Error("Invalid geography: cell biome (16) and country (25) lists must be non-empty and equal in length.");
  }

  const biomeIds = new Set(data.biomes.map((item) => item.i));
  for (let cell = 0; cell < biome.length; cell += 1) {
    if (!Number.isSafeInteger(biome[cell]) || !biomeIds.has(biome[cell])) {
      throw new Error(`Invalid geography: cell ${cell} refers to unknown biome ${biome[cell]}.`);
    }
    if (!Number.isSafeInteger(country[cell]) || country[cell] < 0) {
      throw new Error(`Invalid geography: cell ${cell} has an invalid country ID.`);
    }
  }

  const sourceCities = new Map(data.cities.map((city) => [city.i, city]));
  const cities = map.cities.map((city) => {
    const cellId = sourceCities.get(city.id)?.cell;
    if (cellId === undefined || !Number.isSafeInteger(cellId) || cellId < 0 || cellId >= biome.length) {
      throw new Error(`Invalid geography: City ${city.name} (#${city.id}) has no valid source cell.`);
    }
    return { ...city, cellId };
  });

  const geography: TLMapGeography = { cells: { biome, country } };
  map.geography = geography;
  map.cities = cities;
  // Country records also contain City snapshots, including maps without an economy.
  for (const entity of map.countries) {
    entity.cities = cities.filter((city) => city.country.id === entity.id);
  }
}
