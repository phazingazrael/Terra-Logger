import type { TLCoA, TLMapEmblem, TLMapInfo } from "../../../definitions/TerraLogger";
import getCOA from "../../Util/generators/coa/render";
import { layoutMapEmblems } from "./emblemLayout";
import { readStoredSvgStyles } from "./restoreSvgStyles";

// Placement/materialization source:
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/356f1c8088aba49bd41d837be4732d765a574728/src/renderers/draw-emblems.ts
const groups = {
  burg: "burgEmblems",
  province: "provinceEmblems",
  state: "stateEmblems",
};

function heraldry(source: AFMGEmblem): TLCoA {
  if (source.icon) return { icon: source.icon, shield: source.shield };
  if (source.custom || typeof source.t1 !== "string") {
    throw new Error("No usable source heraldry is available.");
  }
  return {
    ...source,
    division: source.division ? { ...source.division } : undefined,
    ordinaries: source.ordinaries?.map((ordinary) => ({ ...ordinary })),
    charges: source.charges?.map((charge) => ({
      ...charge,
      sinister: charge.sinister === undefined ? undefined : Boolean(charge.sinister),
      reversed: charge.reversed === undefined ? undefined : Boolean(charge.reversed),
      layered: charge.layered === undefined ? undefined : Boolean(charge.layered),
    })),
    inscriptions: source.inscriptions?.map((inscription) => ({
      ...inscription,
      shadow: inscription.shadow ? { ...inscription.shadow } : undefined,
    })),
  };
}

export async function restoreSvgEmblems(map: TLMapInfo) {
  const result = { svg: map.SVG, restored: 0, issues: [] as string[] };
  const source = map.renderingSource;
  if (!source?.sections[50]) return result;
  const state: AFMGLayersState = JSON.parse(source.sections[50]);
  if (!state.active.includes("emblems")) return result;

  const document = new DOMParser().parseFromString(map.SVG, "image/svg+xml");
  if (document.querySelector("parsererror")) throw new Error("Invalid map SVG during emblem restoration.");
  const svg = document.documentElement as unknown as SVGSVGElement;
  const container = svg.getElementById("emblems");
  if (!container) {
    result.issues.push("The saved emblem layer is active, but its SVG group is missing.");
    return result;
  }
  // Preserve maps that already contain rendered emblems, including older saves.
  if (container.querySelector("use")) return result;

  const placements: TLMapEmblem[] = [];
  const records = new Map<string, AFMGMapEmblemRecord>();
  for (const [type, index] of [
    ["burg", 15], ["province", 30], ["state", 14],
  ] as const) {
    const entries: AFMGMapEmblemRecord[] = JSON.parse(source.sections[index] ?? "[]");
    if (!Array.isArray(entries)) throw new Error(`Invalid emblem source section ${index}.`);
    for (const entry of entries) {
      if (!entry?.i || entry.removed || !entry.coa || entry.coa.size === 0) continue;
      const id = `${type}COA${entry.i}`;
      if (records.has(id)) throw new Error(`Duplicate source emblem ${id}.`);
      records.set(id, entry);
      const pole = type === "burg" ? [entry.x, entry.y] : entry.pole;
      const x = entry.coa.x ?? pole?.[0];
      const y = entry.coa.y ?? pole?.[1];
      if (typeof x !== "number" || typeof y !== "number" ||
        !Number.isFinite(x) || !Number.isFinite(y)) {
        result.issues.push(`No usable saved position for ${id}; its emblem was not placed.`);
        continue;
      }
      placements.push({
        id, entityId: entry.i, type, x, y,
        size: entry.coa.size || 1,
        fx: entry.coa.x,
        fy: entry.coa.y,
      });
    }
  }
  const modifiers: Partial<Record<TLMapEmblem["type"], number>> = {};
  const styles = readStoredSvgStyles(source.sections[48], source.version);
  // Modern styles nest emblem groups; older stored layouts used direct children.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/67d555b83f0b2f40ae50b03c9bbfd018175acc6d/src/model/styles/styles-schema.ts
  const groupStyles = styles?.emblems?.groups as Record<string, unknown> | undefined;
  for (const type of ["burg", "province", "state"] as const) {
    const groupStyle = groupStyles?.[groups[type]] ?? styles?.emblems?.[groups[type]];
    const options = groupStyle && typeof groupStyle === "object" &&
      "options" in groupStyle ? groupStyle.options : undefined;
    const size = options && typeof options === "object" && "size" in options
      ? options.size : undefined;
    if (styles && (typeof size !== "number" || !Number.isFinite(size) || size < 0)) {
      throw new Error(`Invalid AFMG ${type} emblem size in styles section (48).`);
    }
    modifiers[type] = styles
      ? size as number
      : Number(svg.getElementById(groups[type])?.getAttribute("data-size")) || 1;
  }
  const layout = layoutMapEmblems(placements, map.info.width, map.info.height, modifiers);
  let definitions = svg.querySelector("defs");
  if (!definitions) {
    definitions = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.insertBefore(definitions, svg.firstChild);
  }
  const artworkByType = {
    burg: new Map(map.cities.map((city) => [city.id, city.coaSVG])),
    state: new Map(map.countries.map((country) => [country.id, country.coaSVG])),
  };
  const fragments = {
    burg: document.createDocumentFragment(),
    province: document.createDocumentFragment(),
    state: document.createDocumentFragment(),
  };
  for (const node of layout.nodes) {
    const sourceCoa = records.get(node.id)?.coa;
    if (!sourceCoa) continue;
    try {
      if (!svg.getElementById(node.id)) {
        if (sourceCoa.custom) throw new Error("The custom SVG definition is missing.");
        const cached = node.type === "province"
          ? undefined : artworkByType[node.type].get(node.entityId);
        // Province artwork has no separate Atlas entity to supply a cached SVG.
        // react-doctor-disable-next-line react-doctor/async-await-in-loop
        const markup = cached || await getCOA(node.id, heraldry(sourceCoa), map.settings.options.customIcons);
        definitions.appendChild(namespaceEmblemSvg(markup, node.id, svg));
      }
      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
      use.setAttribute("data-i", String(node.entityId));
      use.setAttribute("href", `#${node.id}`);
      use.setAttribute("x", String(Math.round((node.x - node.shift) * 100) / 100));
      use.setAttribute("y", String(Math.round((node.y - node.shift) * 100) / 100));
      use.setAttribute("width", `${node.size}em`);
      use.setAttribute("height", `${node.size}em`);
      fragments[node.type].appendChild(use);
      result.restored += 1;
    } catch (error) {
      result.issues.push(`Could not restore ${node.id}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  for (const type of ["burg", "province", "state"] as const) {
    let group = svg.getElementById(groups[type]);
    if (!group) {
      group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("id", groups[type]);
      container.appendChild(group);
    }
    group.setAttribute("font-size", String(layout.sizes[type]));
    // Keep saved group visibility; do not introduce a new zoom/viewport system.
    if (group.classList.contains("hidden")) (group as SVGElement).style.display = "none";
    group.replaceChildren(fragments[type]);
  }
  result.svg = new XMLSerializer().serializeToString(svg);
  return result;
}

function namespaceEmblemSvg(markup: string, id: string, target: SVGSVGElement): Element {
  const document = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${markup}</svg>`,
    "image/svg+xml",
  );
  const root = document.documentElement.firstElementChild;
  if (document.querySelector("parsererror") || root?.localName !== "svg") {
    throw new Error(`Invalid generated artwork for ${id}.`);
  }
  const nodes = [root, ...Array.from(root.querySelectorAll("*"))];
  const renamed = new Map<string, string>();
  for (const node of nodes) {
    const previous = node.getAttribute("id");
    if (!previous) continue;
    if (renamed.has(previous)) throw new Error(`Duplicate artwork ID "${previous}" in ${id}.`);
    renamed.set(previous, node === root ? id : `${id}__${previous}`);
  }
  const rewriteUrls = (value: string) => value.replace(
    /url\(\s*(["']?)#([^)'"\s]+)\1\s*\)/g,
    (match, _quote: string, reference: string) =>
      renamed.has(reference) ? `url(#${renamed.get(reference)})` : match,
  );
  for (const node of nodes) {
    const previous = node.getAttribute("id");
    if (previous) node.setAttribute("id", renamed.get(previous) ?? previous);
    for (const attribute of Array.from(node.attributes)) {
      let value = rewriteUrls(attribute.value);
      if (attribute.localName === "href" && value.startsWith("#")) {
        value = `#${renamed.get(value.slice(1)) ?? value.slice(1)}`;
      }
      node.setAttributeNS(attribute.namespaceURI, attribute.name, value);
    }
  }
  root.setAttribute("id", id);
  for (const style of Array.from(root.querySelectorAll("style"))) {
    // This helper handles locally generated artwork, whose styles contain
    // ordinary selector rules. Custom imported SVG definitions are left intact.
    style.textContent = rewriteUrls(style.textContent ?? "").replace(
      /(^|})\s*([^{}]+)\{/g,
      (_match, previous: string, selectors: string) =>
        `${previous}${selectors.split(",").map((selector) => `#${id} ${selector.trim()}`).join(",")}{`,
    );
  }
  const available = new Set(nodes.map((node) => node.getAttribute("id")).filter(Boolean));
  for (const value of available) {
    if (value && target.getElementById(value)) {
      throw new Error(`Artwork ID collision for "${value}".`);
    }
  }
  for (const node of nodes) {
    for (const attribute of Array.from(node.attributes)) {
      const references = [...attribute.value.matchAll(/url\(\s*["']?#([^)'"\s]+)/g)]
        .map((match) => match[1]);
      if (attribute.localName === "href" && attribute.value.startsWith("#")) {
        references.push(attribute.value.slice(1));
      }
      for (const reference of references) {
        if (!available.has(reference) && !target.getElementById(reference)) {
          throw new Error(`Missing artwork reference "${reference}" in ${id}.`);
        }
      }
    }
  }
  return target.ownerDocument.importNode(root, true);
}
