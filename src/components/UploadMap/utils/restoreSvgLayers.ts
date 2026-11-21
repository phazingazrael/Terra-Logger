import type { TLCustomIcon } from "../../../definitions/TerraLogger";
import { createMapIconSymbol, reliefIconReference } from "../../icons/iconLibrary";
import { readStoredSvgStyles } from "./restoreSvgStyles";

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

export async function restoreSvgLayers(
  svg: SVGSVGElement,
  source: AFMGRenderingSource,
  customIcons: readonly TLCustomIcon[] = [],
): Promise<string[]> {
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
      const candidates = id === "burgIcons" ? ["burgIcons", elementId] : [elementId];
      const group = candidates.map((candidate) => svg.getElementById(candidate))
        .find((candidate) => candidate && (candidate.parentNode === svg || candidate.parentNode === viewbox));
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

  // AFMG saves relief outside the SVG, including icons outside the saved viewport.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/renderers/draw-relief-icons.ts
  const styles = readStoredSvgStyles(source.sections[48], source.version);
  const [major, minor] = source.version.split(".").map(Number);
  const modern = major > 1 || (major === 1 && minor >= 154);
  const set = styles?.relief?.options?.set ?? "simple";
  const size = modern ? styles?.relief?.options?.size ?? 1 : 1;
  if (typeof set !== "string" || typeof size !== "number" || !Number.isFinite(size) || size < 0) {
    throw new Error("Invalid relief set/size in AFMG styles section (48).");
  }
  const reliefSection = source.sections[49];
  if (reliefSection?.trim()) {
    const icons: AFMGReliefIcon[] = JSON.parse(reliefSection);
    const terrain = svg.getElementById("terrain");
    if (!terrain) {
      if (icons.length) issues.push("Saved relief icons could not be restored: the terrain group is missing.");
    } else {
      const fragment = svg.ownerDocument.createDocumentFragment();
      for (const [index, icon] of icons.entries()) {
        const drawn = icon.s * size;
        const shift = (drawn - icon.s) / 2;
        const use = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", `#${reliefIconReference(icon, set)}`);
        use.setAttribute("data-id", String(index));
        use.setAttribute("x", String(icon.x - shift));
        use.setAttribute("y", String(icon.y - shift));
        use.setAttribute("width", String(drawn));
        use.setAttribute("height", String(drawn));
        fragment.append(use);
      }
      terrain.replaceChildren(fragment);
    }
  }

  // Keep saved geometry, sizing and paint. Only resolve missing library artwork.
  // Each distinct reference is restored once, even when thousands of uses share it.
  const references = new Map<string, Element[]>();
  for (const use of svg.querySelectorAll("use")) {
    const href = use.getAttribute("href") ?? use.getAttributeNS("http://www.w3.org/1999/xlink", "href");
    if (!href?.startsWith("#") || svg.getElementById(href.slice(1))) continue;
    const reference = href.slice(1);
    if (!/^(?:glyph|custom|burgs|ports|goods|good|charges|relief|icon)-/.test(reference)) continue;
    const uses = references.get(reference) ?? [];
    uses.push(use);
    references.set(reference, uses);
  }
  let definitions = svg.querySelector("defs");
  for (const [reference, uses] of references) {
    try {
      let id = `tl-icon-${reference.replace(/[^\w-]/g, "_")}`;
      while (svg.getElementById(id)) id += "_";
      // Sequential loading lets symbol IDs be checked against every inserted definition.
      // react-doctor-disable-next-line react-doctor/async-await-in-loop
      const symbol = await createMapIconSymbol(reference, id, customIcons);
      for (const node of [symbol, ...Array.from(symbol.querySelectorAll("[id]"))]) {
        if (node.id && svg.getElementById(node.id)) throw new Error(`Icon artwork ID collision: ${node.id}`);
      }
      if (!definitions) {
        definitions = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.insertBefore(definitions, svg.firstChild);
      }
      definitions.append(svg.ownerDocument.importNode(symbol, true));
      for (const use of uses) {
        use.setAttribute("href", `#${id}`);
        use.removeAttributeNS("http://www.w3.org/1999/xlink", "href");
      }
    } catch (error) {
      issues.push(`Could not restore SVG icon ${reference} (${uses.length} uses): ${
        error instanceof Error ? error.message : String(error)}`);
    }
  }
  return issues;
}
