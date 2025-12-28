function getBurgLink(burg) {
  if (burg.link) return burg.link;

  const population = burg.population * populationRate * urbanization;
  if (population >= options.villageMaxPopulation || burg.citadel || burg.walls || burg.temple || burg.shanty)
    return createMfcgLink(burg);

  return createVillageGeneratorLink(burg);
}

function createMfcgLink(burg) {
  const {cells} = pack;
  const {i, name, population: burgPopulation, cell} = burg;
  const burgSeed = burg.MFCG || seed + String(burg.i).padStart(4, 0);

  const sizeRaw = 2.13 * Math.pow((burgPopulation * populationRate) / urbanDensity, 0.385);
  const size = minmax(Math.ceil(sizeRaw), 6, 100);
  const population = rn(burgPopulation * populationRate * urbanization);

  const river = cells.r[cell] ? 1 : 0;
  const coast = Number(burg.port > 0);
  const sea = (() => {
    if (!coast || !cells.haven[cell]) return null;

    // calculate see direction: 0 = south, 0.5 = west, 1 = north, 1.5 = east
    const p1 = cells.p[cell];
    const p2 = cells.p[cells.haven[cell]];
    let deg = (Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180) / Math.PI - 90;
    if (deg < 0) deg += 360;
    return rn(normalize(deg, 0, 360) * 2, 2);
  })();

  const arableBiomes = river ? [1, 2, 3, 4, 5, 6, 7, 8] : [5, 6, 7, 8];
  const farms = +arableBiomes.includes(cells.biome[cell]);

  const citadel = +burg.citadel;
  const urban_castle = +(citadel && each(2)(i));

  const hub = Routes.isCrossroad(cell);
  const walls = +burg.walls;
  const plaza = +burg.plaza;
  const temple = +burg.temple;
  const shantytown = +burg.shanty;

  const url = new URL("https://watabou.github.io/city-generator/");
  url.search = new URLSearchParams({
    name,
    population,
    size,
    seed: burgSeed,
    river,
    coast,
    farms,
    citadel,
    urban_castle,
    hub,
    plaza,
    temple,
    walls,
    shantytown,
    gates: -1
  });
  if (sea) url.searchParams.append("sea", sea);

  return url.toString();
}

function createVillageGeneratorLink(burg) {
  const {cells, features} = pack;
  const {i, population, cell} = burg;

  const pop = rn(population * populationRate * urbanization);
  const burgSeed = seed + String(i).padStart(4, 0);
  const tags = [];

  if (cells.r[cell] && cells.haven[cell]) tags.push("estuary");
  else if (cells.haven[cell] && features[cells.f[cell]].cells === 1) tags.push("island,district");
  else if (burg.port) tags.push("coast");
  else if (cells.conf[cell]) tags.push("confluence");
  else if (cells.r[cell]) tags.push("river");
  else if (pop < 200 && each(4)(cell)) tags.push("pond");

  const roadsNumber = Object.values(pack.cells.routes[cell] || {}).filter(routeId => {
    const route = pack.routes.find(route => route.i === routeId);
    if (!route) return false;
    return route.group === "roads" || route.group === "trails";
  }).length;
  tags.push(roadsNumber > 1 ? "highway" : roadsNumber === 1 ? "dead end" : "isolated");

  const biome = cells.biome[cell];
  const arableBiomes = cells.r[cell] ? [1, 2, 3, 4, 5, 6, 7, 8] : [5, 6, 7, 8];
  if (!arableBiomes.includes(biome)) tags.push("uncultivated");
  else if (each(6)(cell)) tags.push("farmland");

  const temp = grid.cells.temp[cells.g[cell]];
  if (temp <= 0 || temp > 28 || (temp > 25 && each(3)(cell))) tags.push("no orchards");

  if (!burg.plaza) tags.push("no square");

  if (pop < 100) tags.push("sparse");
  else if (pop > 300) tags.push("dense");

  const width = (() => {
    if (pop > 1500) return 1600;
    if (pop > 1000) return 1400;
    if (pop > 500) return 1000;
    if (pop > 200) return 800;
    if (pop > 100) return 600;
    return 400;
  })();
  const height = rn(width / 2.2);

  const url = new URL("https://watabou.github.io/village-generator/");
  url.search = new URLSearchParams({pop, name: "", seed: burgSeed, width, height, tags});
  return url.toString();
}
