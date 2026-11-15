// AFMG 1.149.1 layer identities differ from several SVG element IDs.
const layerElements: Record<string, string> = {
  ocean: "ocean", landmass: "landmass", texture: "texture",
  heightmap: "terrs", lakes: "lakes", biomes: "biomes", cells: "cells",
  grid: "gridOverlay", coordinates: "coordinates", compass: "compass",
  rivers: "rivers", relief: "terrain", religions: "relig", cultures: "cults",
  states: "regions", provinces: "provs", zones: "zones", borders: "borders",
  routes: "routes", journeys: "journeys", temperature: "temperature", coastline: "coastline",
  ice: "ice", goods: "goods", markets: "markets", trade: "tradeAnimation",
  precipitation: "prec", population: "population", emblems: "emblems",
  burgIcons: "icons", labels: "labels", military: "armies", markers: "markers",
  fogging: "fogging", rulers: "ruler", debug: "debug", scaleBar: "scaleBar",
  vignette: "vignette", legend: "legend",
};

const permanentLayers = new Set([
  "ocean", "landmass", "coastline", "fogging", "debug", "legend",
]);

export function restoreSvgLayers(
  svg: SVGSVGElement,
  source: AFMGRenderingSource,
): string[] {
  const issues: string[] = [];
  // AFMG supplies this through its application stylesheet, outside the saved SVG.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/public/index.css
  const journeys = svg.getElementById("journeys");
  if (journeys) {
    journeys.setAttribute("fill", "none");
    // Marker geometry matches the pinned AFMG document:
    // https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/src/index.html
    journeys.setAttribute("marker-start", "url(#journey-start)");
    journeys.setAttribute("marker-end", "url(#journey-arrow)");
  }
  const layerSection = source.sections[50];

  // parseRenderingSource validates these containers before this function runs.
  if (layerSection?.trim()) {
    const state: AFMGLayersState = JSON.parse(layerSection);
    const active = new Set(state.active);
    const groups = new Map<string, Element>();
    const viewbox = svg.querySelector("#viewbox");

    for (const id of new Set([...state.order, ...state.active])) {
      if (!Object.keys(layerElements).includes(id)) {
        issues.push(`Saved SVG layer "${id}" is not supported; its existing markup is preserved.`);
      }
    }

    for (const [id, elementId] of Object.entries(layerElements)) {
      const group = svg.getElementById(elementId);
      if (!group || (group.parentNode !== svg && group.parentNode !== viewbox)) {
        if (active.has(id)) {
          issues.push(`Saved active SVG layer "${id}" has no matching top-level group.`);
        }
        continue;
      }
      groups.set(id, group);
      // Preserve the group's other inline styles.
      (group as SVGElement).style.display =
        permanentLayers.has(id) || active.has(id) ? "" : "none";
      if (!group.getAttribute("style")) group.removeAttribute("style");
    }

    const ordered = [...new Set(state.order)]
      .map((id) => groups.get(id))
      .filter((group): group is Element => group !== undefined);

    // Reorder only known sibling slots. Custom elements, defs and text nodes
    // retain their positions, and map-level decorations stay outside viewbox.
    for (const parent of [svg, viewbox]) {
      if (!parent) continue;
      const siblings = ordered.filter((group) => group.parentNode === parent);
      const selected = new Set<Node>(siblings);
      let next = 0;
      const children = Array.from(parent.childNodes).map((node) =>
        selected.has(node) ? siblings[next++] : node,
      );
      parent.append(...children);
    }
  }

  const reliefSection = source.sections[49];
  if (reliefSection?.trim()) {
    const icons: AFMGReliefIcon[] = JSON.parse(reliefSection);
    const terrain = svg.getElementById("terrain");
    if (!terrain) {
      if (icons.length) issues.push("Saved relief icons could not be restored: the terrain group is missing.");
      return issues;
    }

    const missing = new Set<string>();
    const fragment = svg.ownerDocument.createDocumentFragment();
    for (const icon of icons) {
      if (!svg.getElementById(icon.icon)) {
        missing.add(icon.icon);
        continue;
      }
      const use = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("href", `#${icon.icon}`);
      use.setAttribute("x", String(icon.x));
      use.setAttribute("y", String(icon.y));
      use.setAttribute("width", String(icon.s));
      use.setAttribute("height", String(icon.s));
      fragment.append(use);
    }
    terrain.replaceChildren(fragment);
    if (missing.size) {
      issues.push(`Relief symbols are missing from SVG definitions: ${[...missing].join(", ")}.`);
    }
  }
  return issues;
}
