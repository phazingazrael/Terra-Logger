// Modified from the following page.
// https://github.com/Azgaar/Fantasy-Map-Generator/tree/0e84a0d72e4e1275f62d66b509ef74e1d2be2d40/modules/io/load.js

import NameBases from "./json/NameBases.json";
import svgDefs from "./json/svgDefs.json";
import b64Imgs from "./json/b64Img.json";

import {
  parseBiomes,
  parseMapSettings,
  parseRenderingSource,
  restoreSvgLayers,
  restoreSvgFonts,
  readStoredSvgStyles,
  restoreSvgStyles,
  setAllMarkerTextsToPercent,
  ensureDefsHasBatch,
  inlinePatternImages,
} from "./utils";



export const parseLoadedData = (data: string[]) => {
  // Parse Map Parameters //

  let params: string[];
  const settings = parseMapSettings(data[1]);
  let Notes: Note[] = [];
  let Cultures: Culture[];
  let Countries: Country[];
  let Cities: City[];
  let Religions: Religion[];
  let nameBases: NameBase[];

  // biome-ignore lint/style/useConst: Pack will possibly be modified in future updates.
  let Pack: Pack = {
    burgs: [], // Burgs (settlements) data is stored as an array of objects with strict element order. Element 0 is an empty object.
    cells: {
      area: [], // number[] - cells area in pixels. Uint16Array
      b: [], // number[] - indicator whether the cell borders the map edge, 1 if true, 0 if false. Integers, not Boolean
      biome: [], // number[] - cells biome index. Uint8Array
      burg: [], // number[] - cells burg index. Uint16Array
      c: [], // number[][] - indexes of cells adjacent to each cell (neighboring cells)
      conf: [], // number[] - cells flux amount in confluences. Confluences are cells where rivers meet each other. Uint16Array
      culture: [], // number[] - cells culture index. Uint16Array
      f: [], // number[] - indexes of feature. Uint16Array or Uint32Array (depending on cells number)
      fl: [], // number[] - cells flux amount. Defines how much water flow through the cell. Use to get rivers data and score cells. Uint16Array
      g: [], // number[] - indexes of a source cell in grid. Uint16Array or Uint32Array. The only way to find correct grid cell parent for pack cells
      h: [], // number[] - cells elevation in [0, 100] range, where 20 is the minimal land elevation. Uint8Array
      harbor: [], // number[] - cells harbor score. Shows how many water cells are adjacent to the cell. Used for scoring. Uint8Array
      haven: [], // number[] - cells haven cells index. Each coastal cell has haven cells defined for correct routes building. Uint16Array or Uint32Array (depending on cells number)
      i: [], // number[] - cell indexes Uint16Array or Uint32Array (depending on cells number)
      p: [], // number[][] - cells coordinates [x, y] after repacking. Numbers rounded to 2 decimals
      pop: [], // number[] - cells population in population points (1 point = 1000 people by default). Float32Array, not rounded to not lose population of high population rate
      province: [], // number[] - cells province index. Uint16Array
      q: {}, // object - quadtree used for fast closest cell detection
      r: [], // number[] - cells river index. Uint16Array
      religion: [], // number[] - cells religion index. Uint16Array
      routes: {}, //object - cells connections via routes. E.g. pack.cells.routes[8] = {9: 306, 10: 306} shows that cell 8 has two route connections - with cell 9 via route 306 and with cell 10 by route 306
      s: [], // number[] - cells score. Scoring is used to define best cells to place a burg. Uint16Array
      state: [], // number[] - cells state index. Uint16Array
      t: [], // number[] - distance field. 1, 2, ... - land cells, -1, -2, ... - water cells, 0 - unmarked cell. Uint8Array
      v: [], // number[][] - indexes of vertices of each cell
    },
    cultures: [], // Cultures (races, language zones) data is stored as an array of objects with strict element order. Element 0 is reserved by the wildlands culture.
    features: [], // object[] - array containing objects for all enclosed entities of repacked graph: islands, lakes and oceans. Note: element 0 has no data. Stored in .map file.
    markers: [], // Markers data is stored as an unordered array of objects.
    provinces: [], // Provinces data is stored as an array of objects with strict element order. Element 0 is not used.
    religions: [], // Religions data is stored as an array of objects with strict element order. Element 0 is reserved for "No religion".
    rivers: [], // Rivers data is stored as an unordered array of objects.
    routes: [], // Routes data is stored as an unordered array of objects.
    states: [], // States (countries) data is stored as an array of objects with strict element order. Element 0 is reserved for neutrals
    zones: [], // Zones data is stored as an array of objects with i not necessary equal to the element index, but order of element defines the rendering order and is important.
  };

  // params
  if (data[0]) {
    params = data[0].split("|");
  }

  const biomes = parseBiomes(data[3]);
  Pack.biomes = biomes;

  // notes
  if (data[4]) {
    const tempNotes: Note[] = JSON.parse(data[4]);
    Notes = tempNotes.filter((note) => note.legend !== "");
  }

  // data[5] is called last to ensure less processing time

  // packFeatures
  if (data[12]) {
    Pack.features = JSON.parse(data[12]);
  }

  // Cultures
  if (data[13]) {
    Cultures = JSON.parse(data[13]) as Culture[];
    Pack.cultures = JSON.parse(data[13]);
  }

  // Countries
  if (data[14]) {
    Countries = JSON.parse(data[14]) as Country[];
    Pack.states = JSON.parse(data[14]);
  }

  // Cities
  if (data[15]) {
    Cities = JSON.parse(data[15]) as City[];
    Pack.burgs = JSON.parse(data[15]);
  }

  // pack.cells.biome
  if (data[16]) {
    (Pack.cells.biome as unknown as Uint8Array) = Uint8Array.from(
      data[16].split(","),
    );
  }

  // pack.cells.burg
  if (data[17]) {
    (Pack.cells.burg as unknown as Uint16Array) = Uint16Array.from(
      data[17].split(","),
    );
  }

  // pack.cells.conf
  if (data[18]) {
    (Pack.cells.conf as unknown as Uint8Array) = Uint8Array.from(
      data[18].split(","),
    );
  }

  // pack.cells.culture
  if (data[19]) {
    (Pack.cells.culture as unknown as Uint16Array) = Uint16Array.from(
      data[19].split(","),
    );
  }

  // pack.cells.fl
  if (data[20]) {
    (Pack.cells.fl as unknown as Uint16Array) = Uint16Array.from(
      data[20].split(","),
    );
  }

  // pop
  if (data[21]) {
    (Pack.cells.pop as unknown as Float32Array) = Float32Array.from(
      data[21].split(","),
    );
  }

  // pack.cells.r
  if (data[22]) {
    (Pack.cells.r as unknown as Uint16Array) = Uint16Array.from(
      data[22].split(","),
    );
  }

  // pack.cells.s
  if (data[24]) {
    (Pack.cells.s as unknown as Uint16Array) = Uint16Array.from(
      data[24].split(","),
    );
  }

  // pack.cells.state
  if (data[25]) {
    (Pack.cells.state as unknown as Uint16Array) = Uint16Array.from(
      data[25].split(","),
    );
  }

  // pack.cells.religion
  if (data[26]) {
    (Pack.cells.religion as unknown as Uint16Array) = Uint16Array.from(
      data[26].split(","),
    );
  }

  // pack.cells.province
  if (data[27]) {
    (Pack.cells.province as unknown as Uint16Array) = Uint16Array.from(
      data[27].split(","),
    );
  }

  // religions
  if (data[29]) {
    Religions = JSON.parse(data[29]) as Religion[];
    Pack.religions = JSON.parse(data[29]);
  }

  // provinces
  if (data[30]) {
    Pack.provinces = JSON.parse(data[30]);
  }

  // nameBases ("namesData")
  nameBases = [...NameBases] as NameBase[];
  if (data[31]) {
    const names = data[31].split("/");
    names.forEach((d, i) => {
      const e = d.split("|");
      if (!e.length) return;
      const b =
        e[5].split(",").length > 2 || !nameBases[i] ? e[5] : nameBases[i].b;
      nameBases[i] = {
        b: b,
        d: e[3],
        i: e[6] as unknown as number,
        m: e[4] as unknown as number,
        max: e[2] as unknown as number,
        name: e[0],
        min: e[1] as unknown as number,
      };
    });
  }

  // rivers
  if (data[32]) {
    Pack.rivers = JSON.parse(data[32]);
  }

  // fonts
  // data[34]

  // markers
  if (data[35]) {
    Pack.markers = JSON.parse(data[35]);
  }

  // cellRoutes
  if (data[36]) {
    Pack.cells.routes = JSON.parse(data[36]);
  }

  // routes
  if (data[37]) {
    Pack.routes = JSON.parse(data[37]);
  }

  // zones
  if (data[38]) {
    Pack.zones = JSON.parse(data[38]);
  }

  if (data[40]) {
    Pack.cells.good = data[40].split(",").map(Number);
  }

  if (data[41]) {
    const goods: unknown = JSON.parse(data[41]);
    if (!Array.isArray(goods)) {
      throw new Error("Invalid AFMG goods section: expected a list.");
    }
    Pack.goods = goods;
  }

  if (data[42]) {
    const markets: unknown = JSON.parse(data[42]);
    if (!Array.isArray(markets)) {
      throw new Error("Invalid AFMG markets section: expected a list.");
    }
    Pack.markets = markets;
  }

  if (data[43]) {
    const deals: unknown = JSON.parse(data[43]);
    if (!Array.isArray(deals)) {
      throw new Error("Invalid AFMG deals section: expected a list.");
    }
    Pack.deals = deals;
  }

  if (data[44]) {
    Pack.cells.market = data[44].split(",").map(Number);
  }

  const renderingSource = parseRenderingSource(data);
  const renderingIssues: string[] = [];

  // "Serialized SVG", do this last
  // data[5]
  let SVG = "";
  if (data[5]) {
    const svgString = data[5];

    // Parse the SVG string
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
    const svgElement = svgDoc.documentElement;
    if (svgDoc.querySelector("parsererror") ||
      svgElement.localName !== "svg" ||
      svgElement.namespaceURI !== "http://www.w3.org/2000/svg") {
      throw new Error("Invalid AFMG serialized SVG section (5): expected valid SVG XML.");
    }

    setAllMarkerTextsToPercent(
      svgElement as unknown as SVGSVGElement,
      25,
      62.5,
    );

    // Insert SVG Defs for each of the following ids:
    // - end-arrow
    // - end-arrow-small
    // - icon-store
    // - icon-anchor
    // - icon-route
    // - defs-relief
    // - defs-compass-rose
    // - gridPatterns
    // - defs-hatching
    // Includes AFMG 1.153 Illustrated relief/settlement and Harbor symbols:
    // https://github.com/Azgaar/Fantasy-Map-Generator/blob/bf32ac7230654361eedfc25985b4ecc3473889b1/src/index.html
    // Existing definitions win, including custom artwork saved with the map.
    ensureDefsHasBatch(svgElement as unknown as SVGSVGElement, svgDefs);

    renderingIssues.push(...restoreSvgStyles(
      svgElement as unknown as SVGSVGElement,
      readStoredSvgStyles(renderingSource.sections[48], renderingSource.version),
    ));

    // Replace <image> hrefs inside <pattern id="oceanic"> with provided base64 payloads
    inlinePatternImages(svgElement as unknown as SVGSVGElement, b64Imgs);

    renderingIssues.push(...restoreSvgLayers(
      svgElement as unknown as SVGSVGElement,
      renderingSource,
    ));
    renderingIssues.push(...restoreSvgFonts(
      svgElement as unknown as SVGSVGElement,
      renderingSource,
    ));

    // Replace the original SVG string with the modified one
    SVG = new XMLSerializer().serializeToString(svgElement);
  }

  // define parsed map here.
  const createParsedMap = (): MapInfo => {
    return {
      renderingSource,
      biomes,
      cities: Cities,
      countries: Countries,
      cultures: Cultures,
      info: {
        name: settings.mapName,
        seed: params[3],
        width: +params[4],
        height: +params[5],
        ID: params[6],
      },
      nameBases: nameBases,
      notes: Notes,
      attachedNotes: data[1]?.trimStart().startsWith("{") ? readAttachedNotes(data) : [],
      npcs: [],
      params: params,
      religions: Religions,
      settings,
      SVG: SVG,
      svgMod: "",
    };
  };

  const parsedMap: MapInfo = createParsedMap();

  return { parsedMap, Pack, renderingIssues };
};


// Unused data sections
// latLongs ("coords")
// data[2]
// grid.cells.h
// data[7]
// grid.cells.prec
// data[8]
// grid.cells.f
// data[9]
// grid.cells.t
// data[10]
// grid.cells.temp
// data[11]
// Deprecated || pack.cells.road
// data[23]
// Deprecated || pack.cells.crossroad
// data[28]
// rulersString
// data[33]

// https://github.com/Azgaar/Fantasy-Map-Generator/blob/4dd8da5464d9b5879eb06bdfce84afc38fcbebf0/src/generators/notes.ts
function readAttachedNotes(sections: readonly string[]): Note[] {
  const notes: Note[] = [];
  const add = (kind: string, value: unknown, owner?: number) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    const entity = value as Record<string, unknown>;
    if (entity.note === undefined || entity.note === "") return;
    if (typeof entity.note !== "string" || !Number.isSafeInteger(entity.i) || Number(entity.i) < 0) {
      throw new Error(`Invalid AFMG attached Note: ${kind} ${String(entity.i)} requires a numeric ID and text note.`);
    }
    const id = kind === "regiment" ? `regiment${owner}-${entity.i}` : `${kind}${entity.i}`;
    const label = entity.label && typeof entity.label === "object"
      ? (entity.label as Record<string, unknown>).text : undefined;
    const candidates = [entity.fullName, entity.name, label];
    let name = candidates.find((candidate) => typeof candidate === "string" && candidate.trim()) as string | undefined;
    if (kind === "river" && name && typeof entity.type === "string") name = `${name} ${entity.type}`;
    notes.push({ id, name: name ?? id, legend: entity.note });
  };
  const collections: [string, number][] = [
    ["state", 14], ["province", 30], ["burg", 15], ["marker", 35],
    ["river", 32], ["route", 37], ["feature", 12], ["zone", 38],
    ["journey", 52], ["market", 42], ["addedLabel", 47], ["culture", 13],
    ["religion", 29], ["biome", 3], ["good", 41],
  ];
  for (const [kind, section] of collections) {
    if (!sections[section]?.trim()) continue;
    let records: unknown;
    try { records = JSON.parse(sections[section]); } catch {
      throw new Error(`Cannot read attached Notes: malformed AFMG ${kind} section (${section}).`);
    }
    if (!Array.isArray(records)) throw new Error(`Invalid AFMG ${kind} section (${section}): expected a list.`);
    for (const value of records) {
      add(kind, value);
      if (kind !== "state" || !value || typeof value !== "object") continue;
      const state = value as Record<string, unknown>;
      if (state.military === undefined) continue;
      if (!Array.isArray(state.military)) throw new Error(`Invalid AFMG military list for state ${state.i}.`);
      for (const regiment of state.military) {
        if (regiment && typeof regiment === "object" && "note" in regiment &&
          (!Number.isSafeInteger(state.i) || Number(state.i) < 0)) {
          throw new Error("Invalid AFMG regiment Note: owning state ID is missing.");
        }
        add("regiment", regiment, Number(state.i));
      }
    }
  }
  const ids = new Set<string>();
  for (const note of notes) {
    if (ids.has(note.id)) throw new Error(`Duplicate AFMG attached Note ID: ${note.id}.`);
    ids.add(note.id);
  }
  return notes;
}
