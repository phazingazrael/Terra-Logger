// Source settings and explicit compatibility mapping; no browser or SVG dependencies.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/4dd8da5464d9b5879eb06bdfce84afc38fcbebf0/src/components/options-schema.ts
export function parseMapSettings(section: string | undefined): MapInfo["settings"] {
  const raw = section?.trim();
  if (!raw) throw new Error("Invalid AFMG settings section (1): settings are missing.");
  const record = (value: unknown, path: string): Record<string, unknown> => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`Invalid AFMG settings section (1): ${path} must be an object.`);
    }
    return value as Record<string, unknown>;
  };
  const parse = (value: string, path: string): Record<string, unknown> => {
    let parsed: unknown;
    try { parsed = JSON.parse(value); } catch {
      throw new Error(`Invalid AFMG settings section (1): malformed ${path} JSON.`);
    }
    return record(parsed, path);
  };
  if (!raw.startsWith("{") && !raw.startsWith("[")) {
    const columns = raw.split("|");
    const options = parse(columns[19], "legacy options") as AFMGLegacySettingsOptions;
    return {
      mapName: columns[20], distanceUnit: columns[0], distanceScale: columns[1],
      areaUnit: columns[2], heightUnit: columns[3], heightExponent: columns[4],
      temperatureScale: columns[5], barSize: columns[6], barLabel: columns[7],
      barBackOpacity: columns[8], barPosX: columns[10], barPosY: columns[11],
      populationRate: Number.parseInt(columns[12], 10), urbanization: columns[13],
      mapSize: columns[14] || String(options.mapSize ?? 100),
      latitude0: columns[15] || String(options.latitude ?? 50),
      prec: columns[18] || String(options.prec ?? 100),
      options: { ...options, militaryTypes: options.military },
      hideLabels: +columns[21], stylePreset: columns[22],
      rescaleLabels: +columns[23], urbanDensity: +columns[24],
    };
  }

  const source = parse(raw, "map settings");
  // These fields are retained below in the complete source settings object.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/4536054599811565ee63fff365f28644ddcd29b7/src/generators/lattice.ts
  if (source.viewOnly !== undefined && typeof source.viewOnly !== "boolean") {
    throw new Error("Invalid AFMG settings section (1): viewOnly must be boolean.");
  }
  if (source.graph !== undefined) {
    const graph = record(source.graph, "graph");
    if (graph.sampling !== undefined && (typeof graph.sampling !== "string" ||
      !["square", "hexPointy", "hexFlat", "diamond", "triangle"].includes(graph.sampling))) {
      throw new Error("Invalid AFMG settings section (1): unsupported graph sampling.");
    }
    if (graph.jitter !== undefined && (typeof graph.jitter !== "number" ||
      !Number.isFinite(graph.jitter) || graph.jitter < 0 || graph.jitter > 0.9)) {
      throw new Error("Invalid AFMG settings section (1): graph jitter must be between 0 and 0.9.");
    }
  }
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/8cc7f8e4a00fa4b2fab5a29d619b310cfcd60272/src/data/development.ts
  let eras: AFMGDevelopmentalEra[] | undefined;
  if (source.eras !== undefined) {
    if (!Array.isArray(source.eras)) throw new Error("Invalid AFMG settings section (1): eras must be a list.");
    const levels = new Set<number>();
    eras = source.eras.map((value) => {
      const entry = record(value, "eras entry");
      if (typeof entry.level !== "number" || !Number.isInteger(entry.level) || entry.level < 1 || entry.level > 100 ||
        levels.has(entry.level) || typeof entry.name !== "string" || !entry.name.trim()) {
        throw new Error("Invalid AFMG settings section (1): eras need unique levels from 1 to 100 and nonempty names.");
      }
      levels.add(entry.level);
      return { level: entry.level, name: entry.name };
    });
  }
  const customIcons = source.customIcons === undefined ? undefined : readCustomIcons(source.customIcons);
  const read = (path: string): unknown => path.split(".").reduce<unknown>(
    (value, key) => record(value, path)[key], source,
  );
  const text = (path: string): string => {
    const value = read(path);
    if (typeof value !== "string") throw new Error(`Invalid AFMG settings section (1): ${path} must be text.`);
    return value;
  };
  const number = (path: string, minimum = Number.NEGATIVE_INFINITY): number => {
    const value = read(path);
    if (typeof value !== "number" || !Number.isFinite(value) || value < minimum) {
      throw new Error(`Invalid AFMG settings section (1): ${path} must be a finite number >= ${minimum}.`);
    }
    return value;
  };
  const positive = (path: string): number => {
    const value = number(path, 0);
    if (value === 0) throw new Error(`Invalid AFMG settings section (1): ${path} must be positive.`);
    return value;
  };
  const winds = read("climate.winds");
  if (!Array.isArray(winds) || winds.length !== 6 || !winds.every(
    (wind) => typeof wind === "number" && Number.isFinite(wind) && wind >= 0 && wind <= 360,
  )) throw new Error("Invalid AFMG settings section (1): climate.winds must contain six directions.");
  const military = read("military.units");
  if (!Array.isArray(military) || !military.every((value) => {
    const unit = record(value, "military.units entry");
    return ["icon", "name", "type"].every((key) => typeof unit[key] === "string") &&
      ["rural", "urban", "crew", "power", "separate"].every((key) =>
        typeof unit[key] === "number" && Number.isFinite(unit[key]) && unit[key] >= 0) &&
      Number(unit.crew) > 0 && Number.isInteger(unit.separate) &&
      (unit.goods === undefined || (Array.isArray(unit.goods) && unit.goods.every((id) => Number.isInteger(id) && id >= 0)));
  })) throw new Error("Invalid AFMG settings section (1): military.units contains invalid units.");
  const year = number("lore.calendar.year");
  if (!Number.isSafeInteger(year)) throw new Error("Invalid AFMG settings section (1): calendar year must be an integer.");
  // Since 1.154, AFMG always resizes labels and omits this flag from map settings.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/services/io/auto-update.ts
  const storedResize = read("labels.resizeOnZoom");
  const resize = storedResize === undefined ? true : storedResize;
  if (typeof resize !== "boolean") throw new Error("Invalid AFMG settings section (1): labels.resizeOnZoom must be boolean.");
  const mapSize = number("geography.mapSize", 0);
  const latitude = number("geography.latitude", 0);
  if (mapSize > 100 || latitude > 100) throw new Error("Invalid AFMG settings section (1): geography percentages exceed 100.");

  return {
    mapName: text("lore.name"), distanceUnit: text("units.distance.unit"),
    distanceScale: String(positive("units.distance.scale")), areaUnit: text("units.area.unit"),
    heightUnit: text("units.height.unit"), heightExponent: String(positive("units.height.exponent")),
    temperatureScale: text("units.temperature.unit"),
    // Scale-bar appearance stays in styles/SVG; app-only preferences are not in map settings.
    barSize: "", barLabel: "", barBackOpacity: "", barPosX: "", barPosY: "", hideLabels: 0,
    populationRate: positive("units.population.scale"),
    urbanization: String(number("units.population.urbanization.rate", 0)),
    urbanDensity: positive("units.population.urbanization.density"),
    mapSize: String(mapSize), latitude0: String(latitude),
    prec: String(number("climate.precipitation", 0)),
    stylePreset: text("style.preset"), rescaleLabels: Number(resize),
    options: {
      ...source, afmgMapSettings: source, pinNotes: false, winds: winds as number[],
      ...(customIcons === undefined ? {} : { customIcons }),
      ...(eras === undefined ? {} : { eras }),
      temperatureEquator: number("climate.temperature.equator"),
      temperatureNorthPole: number("climate.temperature.northPole"),
      temperatureSouthPole: number("climate.temperature.southPole"),
      year, era: text("lore.calendar.era"), eraShort: text("lore.calendar.eraShort"),
      militaryTypes: military as MilitaryType[],
    },
  };
}

// Validate the stored records here; SVG sanitization belongs to their rendering step.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/components/options-schema.ts
function readCustomIcons(value: unknown): AFMGCustomIcon[] {
  if (!Array.isArray(value)) {
    throw new Error("Invalid AFMG settings section (1): customIcons must be a list.");
  }
  const ids = new Set<string>();
  return value.map((raw, index) => {
    const invalid = () => new Error(`Invalid AFMG custom icon at settings section 1, index ${index}.`);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw invalid();
    const icon = raw as Record<string, unknown>;
    if (typeof icon.id !== "string" || !/^custom-[\w-]+$/.test(icon.id) || ids.has(icon.id) ||
      (icon.kind !== "svg" && icon.kind !== "image") ||
      typeof icon.content !== "string" || typeof icon.viewBox !== "string") throw invalid();
    const frame = icon.viewBox.trim().split(/[\s,]+/).map(Number);
    if (frame.length !== 4 || !frame.every(Number.isFinite) || frame[2] <= 0 || frame[3] <= 0) throw invalid();
    ids.add(icon.id);
    return { id: icon.id, kind: icon.kind, content: icon.content, viewBox: icon.viewBox };
  });
}
