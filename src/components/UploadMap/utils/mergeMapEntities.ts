import type { TLMapInfo } from "../../../definitions/TerraLogger";

export type ReimportEntities = Pick<
  TLMapInfo,
  "cities" | "countries" | "cultures" | "religions" | "notes" | "nameBases"
>;

function mergeEntities<T extends { _id: string }>(
  label: string,
  incoming: readonly T[],
  previous: readonly T[],
  getId: (entity: T) => string | number,
  refreshedFields: readonly (keyof T)[],
): T[] {
  const previousById = new Map<string | number, T>();
  for (const entity of previous) {
    const id = getId(entity);
    if (previousById.has(id)) {
      throw new Error(`Duplicate saved ${label} ID: ${id}.`);
    }
    previousById.set(id, entity);
  }

  const incomingIds = new Set<string | number>();
  const merged = incoming.map((entity) => {
    const id = getId(entity);
    if (incomingIds.has(id)) {
      throw new Error(`Duplicate imported ${label} ID: ${id}.`);
    }
    incomingIds.add(id);
    const saved = previousById.get(id);
    if (!saved) return entity;

    const result = { ...entity, ...saved };
    for (const field of refreshedFields) result[field] = entity[field];
    return result;
  });

  for (const id of previousById.keys()) {
    if (!incomingIds.has(id)) {
      throw new Error(
        "Reimport would remove saved " + label + " " + id +
        ". Review the missing entity before updating this map.",
      );
    }
  }
  return merged;
}

export function mergeMapEntities(
  map: TLMapInfo,
  previous: ReimportEntities,
): void {
  const incomingCountries = new Map(
    map.countries.map((country) => [country.id, country]),
  );

  map.cities = mergeEntities(
    "city", map.cities, previous.cities, (city) => city.id,
    [
      "id", "capital", "coa", "coaSVG", "country", "culture",
      "mapLink", "mapSeed", "name", "population", "size", "type",
    ],
  );
  map.countries = mergeEntities(
    "country", map.countries, previous.countries, (country) => country.id,
    ["id", "coa", "coaSVG", "color", "culture", "name", "nameFull", "population", "type"],
  );
  map.cultures = mergeEntities(
    "culture", map.cultures, previous.cultures, (culture) => culture.id,
    [
      "id", "base", "code", "color", "expansionism", "name",
      "origins", "ruralPop", "shield", "type", "urbanPop",
    ],
  );
  map.religions = mergeEntities(
    "religion", map.religions, previous.religions, (religion) => religion.i,
    ["i", "center", "code", "culture", "deity", "form", "members", "name", "origins", "type"],
  );
  const incomingNotes = new Map(map.notes.map((note) => [note.id, note]));
  map.notes = mergeEntities(
    "note", map.notes, previous.notes, (note) => note.id,
    ["id", "type"],
  );
  for (const note of map.notes) {
    const incoming = incomingNotes.get(note.id);
    if (!incoming?.importedTravel) continue;
    // The baseline is the last imported text, not a copy of authored edits.
    // Refresh only fields that still match that baseline.
    if (note.importedTravel) {
      if (note.name === note.importedTravel.name) note.name = incoming.name;
      if (note.legend === note.importedTravel.legend) note.legend = incoming.legend;
    }
    note.importedTravel = incoming.importedTravel;
  }

  // Cultures refer to name bases by position; name matching cannot repair a reorder.
  for (let index = 0; index < previous.nameBases.length; index += 1) {
    if (map.nameBases[index]?.name !== previous.nameBases[index].name) {
      throw new Error(
        "Name-base names or ordering changed. Review them before updating this map.",
      );
    }
  }
  map.nameBases = map.nameBases.map(
    (base, index) => previous.nameBases[index] ?? base,
  );

  const cities = new Map(map.cities.map((city) => [city.id, city]));
  const countries = new Map(map.countries.map((country) => [country.id, country]));
  const cultures = new Map(
    map.cultures.map((culture) => [String(culture.id), culture]),
  );

  // Fresh import references still contain the temporary IDs assigned during mutation.
  for (const city of map.cities) {
    city.country = {
      ...city.country,
      _id: countries.get(city.country.id)?._id ?? "",
    };
    city.culture = {
      ...city.culture,
      _id: cultures.get(String(city.culture.id))?._id ?? "",
    };
  }
  for (const country of map.countries) {
    const incoming = incomingCountries.get(country.id);
    if (!incoming) throw new Error(`Missing imported country ${country.id}.`);
    const savedPolitical = country.political;
    const militaryIds = new Map(
      savedPolitical.military.map((unit) => [unit.id, unit._id]),
    );
    country.political = {
      ...incoming.political,
      leaders: savedPolitical.leaders,
      ruler: savedPolitical.ruler,
      military: incoming.political.military.map((unit) => ({
        ...unit,
        _id: militaryIds.get(unit.id) ?? unit._id,
      })),
      neighbors: incoming.political.neighbors.map((neighbor) => ({
        ...neighbor,
        _id: countries.get(neighbor.id)?._id ?? "",
      })),
    };
    country.culture = {
      ...country.culture,
      _id: cultures.get(String(country.culture.id))?._id ?? "",
    };
    country.cities = map.cities.filter((city) => city.country.id === country.id);
  }
  for (const religion of map.religions) {
    religion.culture = {
      ...religion.culture,
      _id: cultures.get(String(religion.culture.id))?._id ?? "",
    };
    const center = religion.type === "Folk"
      ? cultures.get(String(religion.center.i))
      : cities.get(religion.center.i);
    religion.center = { ...religion.center, _id: center?._id ?? "" };
  }
}
