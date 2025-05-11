// src/definitions/AFMG.ts

// Interfaces for AFMG imported Data
// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#burgs
type City = {
  capital: number; //if burg is a capital, 0 if not (each state has only 1 capital)
  cell: number; // burg cell id. One cell can have only one burg
  citadel: number; //if burg has a castle, 0 if not. Used for MFCG
  coa: {
    // emblem object, data model is the same as in Armoria and covered in API documentation. The only additional fields are optional size: number, x: number and y: number that controls the emblem position on the map (if it's not default). If emblem is loaded by user, then the value is { custom: true } and cannot be displayed in Armoria
    t1: string;
    division: {
      division: string;
      t: string;
      line: string;
    };
    charges: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield: string;
  };
  culture: number; // burg culture id
  feature: number; // burg feature id (id of a landmass)
  i: number; // burg id, always equal to the array index
  link: string; // custom link to burg in MFCG. MFCG seed is not used if link is provided
  lock: boolean; //if burg is locked (not affected by regeneration)
  MFCG: number; // burg seed in Medieval Fantasy City Generator (MFCG). If not provided, seed is combined from map seed and burg id
  name: string; // burg name
  plaza: number; //if burg has a marketplace, 0 if not. Used for MFCG
  population: number; // burg population in population points
  port: number; //if burg is not a port, then 0, otherwise feature id of the water body the burg stands on
  removed: boolean; //if burg is removed
  shanty: number; //if burg has a shanty town, 0 if not. Used for MFCG
  state: number; // burg state id
  temple: number; //if burg has a temple, 0 if not. Used for MFCG
  type: string; // burg type, see culture types
  walls: number; //if burg has walls, 0 if not. Used for MFCG
  x: number; // x axis coordinate, rounded to two decimals
  y: number; // y axis coordinate, rounded to two decimals
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#states
type Country = {
  alert: number; // state war alert, see military forces page
  area: number; // state area in pixels
  burgs: number; // number of burgs within the state
  campaigns: {
    // wars the state participated in. The was is defined as start: number (year), end: number (year), name: string
    name: string;
    start: number;
    end: number;
  }[];
  cells: number; // number of cells within the state
  center: number; // cell id of state center (initial cell)
  coa: {
    // emblem object, data model is the same as in Armoria and covered in API documentation. The only additional fields are optional size: number, x: number and y: number that controls the emblem position on the map (if it's not default). If emblem is loaded by user, then the value is { custom: true } and cannot be displayed in Armoria
    t1: string;
    division: {
      division: string;
      t: string;
      line: string;
    };
    charges: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield: string;
  };
  color: string; // state color in hex (e.g. #45ff12) or link to hatching pattern (e.g. url(#hatch7))
  culture: number; // state culture id (equals to initial cell culture)
  diplomacy: string[]; // diplomatic relations status for all states. 'x' for self and neutrals. Element 0 (neutrals) diplomacy is used differently and contains wars story as string[][]
  expansionism: number; // state growth multiplier. Used mainly during state generation to spread states not uniformly
  form: string; // state form type. Available types are Monarchy, Republic, Theocracy, Union, and Anarchy
  formName: string; // string form name, used to get state fullName
  fullName: string; // full state name. Combination of the proper name and state formName
  i: number; // state id, always equal to the array index
  lock: boolean; // true if state is locked (not affected by regeneration)
  military: {
    // list of state regiments, see military forces page
    i: number;
    a: number;
    cell: number;
    x: number;
    y: number;
    bx: number;
    by: number;
    u: {
      archers: number;
      cavalry: number;
      artillery: number;
      infantry: number;
    };
    n: number;
    name: string;
    state: number;
    icon: string;
  }[];
  name: string; // short (proper) form of the state name
  neighbors: number[]; // ids of neighboring (bordering by land) states
  pole: number[]; // state pole of inaccessibility (visual center) coordinates, see the concept description
  provinces: number[]; // ids of state provinces
  removed: boolean; // true if state is removed
  rural: number; // rural (non-burg) population of state cells. In population points
  type: string; // state type, see [culture types](https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Culture types)
  urban: number; // urban (burg) population of state cells. In population points
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#cultures
type Culture = {
  area: number; // culture area in pixels
  base: number; // nameBase id, name base is used for names generation
  cells: number; // number of cells assigned to culture
  center: number; // cell id of culture center (initial cell)
  code: string; // culture name abbreviation. Used to render cultures tree
  color: string; // culture color in hex (e.g. #45ff12) or link to hatching pattern (e.g. url(#hatch7))
  expansionism: number; // culture growth multiplier. Used mainly during cultures generation to spread cultures not uniformly
  i: number; // culture id, always equal to the array index
  lock: boolean; // true if culture is locked (not affected by regeneration)
  name: string; // culture name
  origins: number[]; // ids of origin cultures. Used to render cultures tree to show cultures evolution. The first array member is main link, other - supporting out-of-tree links
  removed: boolean; // true if culture is removed
  rural: number; // rural (non-burg) population of cells assigned to culture. In population points
  shield: string; // shield type. Used for emblems rendering
  type: string; // culture type, see culture types
  urban: number; // urban (burg) population of cells assigned to culture. In population points
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Military-Forces#military-units-editor
type MilitaryType = {
  icon: string;
  name: string;
  rural: number;
  urban: number;
  crew: number;
  power: number;
  type: string;
  separate: number;
};

//https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#markers
type Note = {
  id: string;
  legend: string;
  name: string;
};

// // https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#provinces
type Province = {
  i: number; // province id, always equal to the array index
  area: number; // province area in pixels
  burg: number; // id of province capital burg if any
  burgs: number[]; // id of burgs within the province
  cells: number; // number of cells within the province
  center: number; // cell id of province center (initial cell)
  coa: {
    // emblem object, data model is the same as in Armoria and covered in API documentation. The only additional fields are optional size: number, x: number and y: number that controls the emblem position on the map (if it's not default). If emblem is loaded by user, then the value is { custom: true } and cannot be displayed in Armoria
    t1: string;
    division: {
      division: string;
      t: string;
      line: string;
    };
    charges: {
      charge: string;
      t: string;
      p: string;
      size: number;
    }[];
    shield: string;
  };
  color: string; // province color in hex (e.g. #45ff12) or link to hatching pattern (e.g. url(#hatch7))
  formName: string; // string form name, used to get province fullName
  fullName: string; // full state name. Combination of the proper name and province formName
  lock: boolean; // true if province is locked (not affected by regeneration)
  name: string; // short (proper) form of the province name
  pole: number[]; // state pole of inaccessibility (visual center) coordinates, see the concept description
  removed: boolean; // true if province is removed
  rural: number; // rural (non-burg) population of province cells. In population points
  urban: number; // urban (burg) population of state province. In population points
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#religions
type Religion = {
  area: number; // religion area in pixels
  cells: number; // number of cells within the religion
  center: number; // cell id of religion center (initial cell)
  code: string; // religion name abbreviation. Used to render religions tree
  color: string; // religion color in hex (e.g. #45ff12) or link to hatching pattern (e.g. url(#hatch7))
  culture: number; // religion original culture
  deity: string; // religion supreme deity if any
  expansion: string; // religion expansion type. Can be culture so that religion grow only within its culture or global
  expansionism: number; // religion growth multiplier. Used during religion generation to define competitive size
  form: string; // religion form
  i: number; // religion id, always equal to the array index
  lock: boolean; // true if religion is locked (not affected by regeneration)
  name: string; // religion name
  origins: number[]; // ids of ancestor religions. [0] if religion doesn't have an ancestor. Used to render religions tree. The first array member is main link, other - supporting out-of-tree links
  pole: number[]; // state pole of inaccessibility (visual center) coordinates, see the concept description
  removed: boolean; // true if religion is removed
  rural: number; // rural (non-burg) population of religion cells. In population points
  type: string; // religion type. Available types are Folk, Organized, Heresy and Cult
  urban: number; // urban (burg) population of state religion. In population points
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#rivers
type Rivers = {
  i: number; // river id
  name: string; // river name
  type: string; // river type, used to get river full name only
  source: number; // id of cell at river source
  mouth: number; // id of cell at river mouth
  parent: number; // parent river id. If river doesn't have a parent, the value is self id or 0
  basin: number; // river basin id. Basin id is a river system main stem id. If river doesn't have a parent, the value is self id
  cells: number[]; // if of river points cells. Cells may not be unique. Cell value -1 means the river flows off-canvas
  points: number[][]; // river points coordinates. Auto-generated rivers don't have points stored and rely on cells for rendering
  discharge: number; // river flux in m3/s
  length: number; // river length in km
  width: number; // river mouth width in km
  sourceWidth: number; // additional width added to river source on rendering. Used to make lake outlets start with some width depending on flux. Can be also used to manually create channels
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#markers
type Markers = {
  cell: number; // cell id, used to prevent multiple markers generation in the same cell
  dx: number; // icon x shift percent. Optional, default is 50 (50%, center)
  dy: number; // icon y shift percent. Optional, default s 50 (50%, center)
  fill: string; // marker pin fill color. Optional, default is #fff (white)
  i: number; // marker id. 'marker' + i is used as svg element id and marker reference in notes object
  icon: number; // Unicode character (usually an emoji) to serve as an icon
  lock: boolean; // true if marker is locked (not affected by regeneration). Optional;
  pin: string; //pin element type. Optional, default is bubble. Pin is not rendered if value is set to no
  pinned: boolean; // if any marker is pinned, then only markers with pinned = true will be rendered. Optional
  px: number; // icon font-size in pixels. Optional, default is 12 (12px)
  size: number; // marker size in pixels. Optional, default value is 30 (30px)
  stroke: string; // marker pin stroke color. Optional, default is #000 (black)
  type: string; // marker type. If set, style changes will be applied to all markers of the same type. Optional
  x: number; // marker x coordinate
  y: number; // marker y coordinate
};

// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model#name-bases
type NameBase = {
  b: string; // long string containing comma-separated list of names
  d: string; // letters that are allowed to be duplicated in generated names
  i: number; // base id, always equal to the array index
  m: number; // if multi-word name is generated, how many of this cases should be transformed into a single word. 0 means multi-word names are not allowed, 1 - all generated multi-word names will stay as they are
  max: number; // recommended maximal length of generated names. If max length is reached, generator will stop adding new syllables
  min: number; // recommended minimal length of generated names. Generator will adding new syllables until min length is reached
  name: string; // names base proper name
  _id?: string;
  names?: string[];
};

// Inferred combination of data into 1 object following the data model below
// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model
interface MapInfo {
  cities: City[];
  countries: Country[];
  cultures: Culture[];
  info: {
    name: string;
    seed: string;
    width: number;
    height: number;
    ID: string;
  };
  nameBases: NameBase[];
  notes: Note[];
  npcs: {
    name: string;
  }[];
  params: string[];
  religions: Religion[];
  settings: {
    mapName: string;
    distanceUnit: string;
    distanceScale: string;
    areaUnit: string;
    heightUnit: string;
    heightExponent: string;
    temperatureScale: string;
    barSize: string;
    barLabel: string;
    barBackOpacity: string;
    barPosX: string;
    barPosY: string;
    populationRate: number;
    urbanization: string;
    mapSize: string;
    latitude0: string;
    prec: string;
    options: {
      pinNotes: boolean;
      winds: Array<number>;
      temperatureEquator: number;
      temperatureNorthPole: number;
      temperatureSouthPole: number;
      stateLabelsMode: string;
      year: number;
      era: string;
      eraShort: string;
      militaryTypes: MilitaryType[];
    };
    hideLabels: number;
    stylePreset: string;
    rescaleLabels: number;
    urbanDensity: number;
  };
  SVG: string;
  svgMod: string;
}

// "Pack" data model
// https://github.com/Azgaar/Fantasy-Map-Generator/wiki/Data-model

interface CellData {
  // number[] - cells area in pixels. Uint16Array
  area: number[];
  // number[] - indicator whether the cell borders the map edge, 1 if true, 0 if false. Integers, not Boolean
  b: number[];
  // number[] - cells biome index. Uint8Array
  biome: number[];
  // number[] - cells burg index. Uint16Array
  burg: number[];
  // number[][] - indexes of cells adjacent to each cell (neighboring cells)
  c: number[][];
  // number[] - cells flux amount in confluences. Confluences are cells where rivers meet each other. Uint16Array
  conf: number[];
  // number[] - cells culture index. Uint16Array
  culture: number[];
  // number[] - indexes of feature. Uint16Array or Uint32Array (depending on cells number)
  f: number[];
  // number[] - cells flux amount. Defines how much water flow through the cell. Use to get rivers data and score cells. Uint16Array
  fl: number[];
  // number[] - indexes of a source cell in grid. Uint16Array or Uint32Array. The only way to find correct grid cell parent for pack cells
  g: number[];
  // number[] - cells elevation in [0, 100] range, where 20 is the minimal land elevation. Uint8Array
  h: number[];
  // number[] - cells harbor score. Shows how many water cells are adjacent to the cell. Used for scoring. Uint8Array
  harbor: number[];
  // number[] - cells haven cells index. Each coastal cell has haven cells defined for correct routes building. Uint16Array or Uint32Array (depending on cells number)
  haven: number[];
  // number[] - cell indexes Uint16Array or Uint32Array (depending on cells number)
  i: number[];
  // number[][] - cells coordinates [x, y] after repacking. Numbers rounded to 2 decimals
  p: number[][];
  // number[] - cells population in population points (1 point = 1000 people by default). Float32Array, not rounded to not lose population of high population rate
  pop: number[];
  // number[] - cells province index. Uint16Array
  province: number[];
  // object - quadtree used for fast closest cell detection
  q: object;
  // number[] - cells river index. Uint16Array
  r: number[];
  // number[] - cells religion index. Uint16Array
  religion: number[];
  // object - cells connections via routes. E.g. pack.cells.routes[8] = {9: 306, 10: 306} shows that cell 8 has two route connections - with cell 9 via route 306 and with cell 10 by route 306
  routes: object;
  // number[] - cells score. Scoring is used to define best cells to place a burg. Uint16Array
  s: number[];
  // number[] - cells state index. Uint16Array
  state: number[];
  // number[] - distance field. 1, 2, ... - land cells, -1, -2, ... - water cells, 0 - unmarked cell. Uint8Array
  t: number[];
  // number[][] - indexes of vertices of each cell
  v: number[][];
}

interface BurgData {
  i: number, //number - burg id, always equal to the array index
  name: string, // string - burg name
  cell: number, // number - burg cell id. One cell can have only one burg
  x: number, // number - x axis coordinate, rounded to two decimals
  y: number, // number - y axis coordinate, rounded to two decimals
  culture: number, // number - burg culture id
  state: number, // number - burg state id
  population: number, // number - burg population in population points
  feature: number, // number - burg feature id (id of a landmass)
  type: string, // string - burg type, see culture types
  coa: object, // object - emblem object, data model is the same as in Armoria and covered in API documentation. The only additional fields are optional size: number, x: number and y: number that controls the emblem position on the map (if it's not default). If emblem is loaded by user, then the value is { custom: true } and cannot be displayed in Armoria
  MFCG: number, // number - burg seed in Medieval Fantasy City Generator (MFCG). If not provided, seed is combined from map seed and burg id
  link: string, // string - custom link to burg in MFCG. MFCG seed is not used if link is provided
  capital: number, // number - 1 if burg is a capital, 0 if not (each state has only 1 capital)
  port: number, // number - if burg is not a port, then 0, otherwise feature id of the water body the burg stands on
  citadel: number, // number - 1 if burg has a castle, 0 if not. Used for MFCG
  plaza: number, // number - 1 if burg has a marketplace, 0 if not. Used for MFCG
  shanty: number, // number - 1 if burg has a shanty town, 0 if not. Used for MFCG
  temple: number, // number - 1 if burg has a temple, 0 if not. Used for MFCG
  walls: number, // number - 1 if burg has walls, 0 if not. Used for MFCG
  lock: boolean, // boolean - true if burg is locked (not affected by regeneration)
  removed: boolean, // boolean - true if burg is removed
}

interface Pack {
  // Burgs (settlements) data is stored as an array of objects with strict element order. Element 0 is an empty object.
  burgs: BurgData[];
  // Cell data
  cells: CellData;
  // Cultures (races, language zones) data is stored as an array of objects with strict element order. Element 0 is reserved by the wildlands culture.
  cultures: object[];
  // object[] - array containing objects for all enclosed entities of repacked graph: islands, lakes and oceans. Note: element 0 has no data. Stored in .map file.
  features: object[];
  // Markers data is stored as an unordered array of objects.
  markers: object[];
  // Provinces data is stored as an array of objects with strict element order. Element 0 is not used.
  provinces: object[];
  // Religions data is stored as an array of objects with strict element order. Element 0 is reserved for "No religion".
  religions: object[];
  // Rivers data is stored as an unordered array of objects.
  rivers: object[];
  // Routes data is stored as an unordered array of objects.
  routes: object[];
  // States (countries) data is stored as an array of objects with strict element order. Element 0 is reserved for neutrals
  states: object[];
  // Zones data is stored as an array of objects with i not necessary equal to the element index, but order of element defines the rendering order and is important.
  zones: object[];
}
