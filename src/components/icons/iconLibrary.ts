import DOMPurify from "dompurify";
import type { MapInf, TLCustomIcon } from "../../definitions/TerraLogger";

// Source artwork and resolution rules are pinned, not fetched at runtime.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/components/icon-sets.ts
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/generators/relief-generator.ts
export const reliefTypes = [
  "mount", "mountSnow", "vulcan", "hill", "dune", "deciduous", "conifer",
  "coniferSnow", "acacia", "palm", "grass", "swamp", "cactus", "deadTree",
] as const;
const fallbackTypes = new Map<string, string>([
  ["mountSnow", "mount"], ["vulcan", "mount"], ["coniferSnow", "conifer"], ["cactus", "dune"], ["deadTree", "dune"],
]);
const noCustomIcons: readonly TLCustomIcon[] = [];
let catalogPromise: Promise<Map<string, string>> | undefined;
const sharedImages = new Map<string, Promise<string>>();
const customImages = new WeakMap<readonly TLCustomIcon[], Map<string, Promise<string>>>();

export type IconArtwork = { id: string; svg?: string; image?: string };
export type MapIconContext = { customIcons: readonly TLCustomIcon[]; reliefSet: string };

function catalog(): Promise<Map<string, string>> {
  catalogPromise ??= import("./iconLibrary.json").then(({ default: data }) => new Map(
    Object.entries(data.files).map(([path, svg]) => [path.replace(/\.svg$/, "").replaceAll("/", "-"), svg]),
  ));
  return catalogPromise;
}

function normalizeReference(value: string): string {
  return value.trim().replace(/^#/, "").replace(/^good-custom-/, "custom-goods-").replace(/^good-/, "goods-");
}

export function reliefIconReference(
  ref: { icon: string } | { type: string; variant?: number; set?: string },
  styleSet: string,
): string {
  return "icon" in ref ? ref.icon : `relief-${ref.set ?? styleSet}-${ref.type}-${ref.variant ?? 1}`;
}

export function readMapIconContext(map: Pick<MapInf, "settings" | "renderingSource"> | null): MapIconContext {
  let customIcons = map?.settings.options.customIcons ?? noCustomIcons;
  // Pre-1.154 uploads were kept outside settings, in section 45.
  const legacy = map?.renderingSource?.sections[45];
  if (legacy?.trim()) {
    const doc = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg">${legacy}</svg>`, "image/svg+xml");
    if (!doc.querySelector("parsererror")) {
      const existing = new Set(customIcons.map((icon) => icon.id));
      const adopted: TLCustomIcon[] = [];
      for (const element of doc.querySelectorAll('[id^="good-custom-"]')) {
        const id = normalizeReference(element.id);
        if (existing.has(id)) continue;
        const wrapper = doc.createElementNS("http://www.w3.org/2000/svg", "g");
        for (const attribute of Array.from(element.attributes)) {
          if (!["id", "viewBox", "xmlns"].includes(attribute.name)) wrapper.setAttribute(attribute.name, attribute.value);
        }
        wrapper.append(...Array.from(element.childNodes));
        adopted.push({ id, kind: "svg", content: wrapper.outerHTML, viewBox: element.getAttribute("viewBox") ?? "0 0 100 100" });
        existing.add(id);
      }
      customIcons = [...customIcons, ...adopted];
    }
  }
  let reliefSet = "simple";
  const section = map?.renderingSource?.sections[48];
  if (section) {
    try {
      const value = JSON.parse(section)?.relief?.options?.set;
      if (typeof value === "string") reliefSet = value;
    } catch { /* An older stored map may not have structured styles. */ }
  }
  return { customIcons, reliefSet };
}

// Source artwork: callers inserting SVG into a document must sanitize and scope it.
export async function getMapIconArtwork(
  reference: string,
  customIcons: readonly TLCustomIcon[] = noCustomIcons,
): Promise<IconArtwork> {
  let id = normalizeReference(reference);
  if (!id) throw new Error("No icon is assigned.");
  if (/^(https?:\/\/|data:image\/)/i.test(id)) return { id, image: id };
  if (id.startsWith("custom-")) {
    const icon = customIcons.find((entry) => entry.id === id);
    if (!icon) throw new Error(`Custom icon is missing from this map: ${id}`);
    if (icon.kind === "image") {
      if (!/^(https?:\/\/|data:image\/)/i.test(icon.content)) throw new Error(`Unsupported custom image URL: ${id}`);
      return { id, image: icon.content };
    }
    const frame = icon.viewBox.trim().split(/[\s,]+/).map(Number);
    if (frame.length !== 4 || !frame.every(Number.isFinite) || frame[2] <= 0 || frame[3] <= 0) {
      throw new Error(`Invalid custom icon frame: ${id}`);
    }
    return { id, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${frame.join(" ")}">${icon.content}</svg>` };
  }
  if (!/^(?:glyph|burgs|ports|goods|charges|relief|icon)-/.test(id)) {
    id = `glyph-${Array.from(id, (character) => character.codePointAt(0)?.toString(16)).join("-")}`;
  }
  if (id.startsWith("glyph-")) {
    if (!/^glyph-[0-9a-f]+(?:-[0-9a-f]+)*$/i.test(id)) throw new Error(`Invalid glyph icon: ${id}`);
    const points = id.slice(6).split("-").map((hex) => Number.parseInt(hex, 16));
    if (points.some((point) => point < 32 || point > 0x10ffff || (point >= 0xd800 && point <= 0xdfff))) {
      throw new Error(`Invalid glyph code point: ${id}`);
    }
    const text = points.map((point) => `&#${point};`).join("");
    return { id, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="50" y="50" font-size="100" text-anchor="middle" dominant-baseline="central" stroke="none">${text}</text></svg>` };
  }
  const files = await catalog();
  if (id.startsWith("icon-")) {
    const name = id.slice(5);
    id = name === "anchor" || name === "harbor" ? `ports-${name}`
      : files.has(`burgs-${name}`) ? `burgs-${name}`
      : files.has(`burgs-atlas-${name}`) ? `burgs-atlas-${name}` : `burgs-watabou-${name}`;
  }
  let svg = files.get(id);
  const relief = id.match(/^relief-(simple|colored|gray|illustrated|stickers)-(\w+)-(\d+)$/);
  if (!svg && relief) {
    const [, set, type, variant] = relief;
    const visited = new Set<string>();
    let candidate: string | undefined = type;
    while (candidate && !visited.has(candidate)) {
      visited.add(candidate);
      const prefix = `relief-${set}-${candidate}-`;
      const available = [...files.keys()].filter((key) => key.startsWith(prefix))
        .sort((left, right) => Number(left.slice(prefix.length)) - Number(right.slice(prefix.length)));
      if (available.length) {
        svg = files.get(available[(Number(variant) - 1) % available.length]);
        break;
      }
      candidate = fallbackTypes.get(candidate);
    }
  }
  if (!svg) throw new Error(`Icon is not in the pinned library: ${id}`);
  return { id, svg };
}

export function mapIconImage(reference: string, customIcons: readonly TLCustomIcon[]): Promise<string> {
  const id = normalizeReference(reference);
  let cache = sharedImages;
  if (id.startsWith("custom-")) {
    cache = customImages.get(customIcons) ?? new Map<string, Promise<string>>();
    customImages.set(customIcons, cache);
  }
  let image = cache.get(id);
  if (!image) {
    image = getMapIconArtwork(reference, customIcons).then((artwork) => {
      if (artwork.image) return artwork.image;
      // UI icons use isolated image documents. Styles cannot escape into the application.
      // Inline map restoration must additionally scope these styles and their IDs.
      const clean = DOMPurify.sanitize(artwork.svg ?? "", {
        USE_PROFILES: { svg: true, svgFilters: true }, ADD_TAGS: ["style"],
        FORBID_TAGS: ["animate", "animateMotion", "animateTransform", "set", "foreignObject"],
      });
      const doc = new DOMParser().parseFromString(clean, "image/svg+xml");
      const svg = doc.documentElement;
      if (doc.querySelector("parsererror") || svg.localName !== "svg") throw new Error(`Invalid SVG icon: ${id}`);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.setAttribute("width", "100");
      svg.setAttribute("height", "100");
      if (artwork.id.startsWith("charges-")) {
        svg.setAttribute("viewBox", "60 60 80 80");
        svg.style.setProperty("--tincture", "#d7374a");
      }
      const fill = /^(burgs|ports)-/.test(artwork.id) ? "#ffffff" : artwork.id.startsWith("charges-") ? "#d7374a" : "#333333";
      if (!svg.hasAttribute("fill")) svg.setAttribute("fill", fill);
      if (!svg.hasAttribute("stroke") && /^(burgs|ports|goods|relief|charges)-/.test(artwork.id)) svg.setAttribute("stroke", "#5c5c70");
      return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    });
    cache.set(id, image);
  }
  return image;
}

// Symbol conversion/scoping follows the pinned AFMG icon loader. Unlike UI images,
// these definitions share the map document, so every local ID and CSS rule is scoped.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/components/icon-sets.ts
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/utils/fileUtils.ts
export async function createMapIconSymbol(
  reference: string,
  id: string,
  customIcons: readonly TLCustomIcon[],
): Promise<SVGSymbolElement> {
  if (!/^[\w-]+$/.test(id)) throw new Error("Invalid destination icon ID.");
  const artwork = await getMapIconArtwork(reference, customIcons);
  const clean = DOMPurify.sanitize(artwork.svg ?? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"/>', {
    USE_PROFILES: { svg: true, svgFilters: true }, ADD_TAGS: ["style"],
    FORBID_TAGS: ["animate", "animateMotion", "animateTransform", "set", "foreignObject"],
  });
  const doc = new DOMParser().parseFromString(clean, "image/svg+xml");
  const root = doc.documentElement;
  if (doc.querySelector("parsererror") || root.localName !== "svg") throw new Error("Invalid icon SVG.");
  if (artwork.image) {
    const image = doc.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("href", artwork.image);
    image.setAttribute("width", "100");
    image.setAttribute("height", "100");
    root.append(image);
  }
  // Heraldic source files use shield coordinates and inherit their charge tinctures.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/generators/emblems-generator.ts
  if (artwork.id.startsWith("charges-")) {
    root.setAttribute("viewBox", "60 60 80 80");
    root.setAttribute("overflow", "visible");
    root.removeAttribute("fill");
    root.removeAttribute("stroke");
  }
  const symbol = doc.createElementNS("http://www.w3.org/2000/svg", "symbol");
  for (const attr of Array.from(root.attributes)) {
    if (!["id", "xmlns", "width", "height"].includes(attr.name)) symbol.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
  }
  symbol.append(...Array.from(root.childNodes));
  const nodes = [symbol, ...Array.from(symbol.querySelectorAll("*"))];
  if (artwork.id.startsWith("charges-")) {
    for (const node of nodes) {
      const fill = node.classList.contains("secondary") ? "var(--secondary)"
        : node.classList.contains("tertiary") ? "var(--tertiary)"
        : node.classList.contains("pseudostroke") ? "var(--stroke)" : undefined;
      const display = node.classList.contains("background") ? ";display:var(--background)" : "";
      if (fill || display) node.setAttribute("style", `${node.getAttribute("style") ?? ""}${fill ? `;fill:${fill}` : ""}${display}`);
    }
  }
  const ids = new Map<string, string>();
  for (const node of nodes) {
    if (!node.id) continue;
    if (ids.has(node.id)) throw new Error("Duplicate ID in icon artwork.");
    ids.set(node.id, `${id}__${node.id}`);
  }
  if (root.id) {
    if (ids.has(root.id)) throw new Error("Duplicate root ID in icon artwork.");
    ids.set(root.id, id);
  }
  const rewrite = (value: string) => value.replace(/url\(\s*(["']?)#([^)'"\s]+)\1\s*\)/gi,
    (_match, _quote: string, ref: string) => {
      const renamed = ids.get(ref);
      if (!renamed) throw new Error(`Missing local icon reference: ${ref}`);
      return `url(#${renamed})`;
    }).replace(/url\((?!\s*['"]?\s*#)[^)]*\)/gi, "none");
  const names = (prefix: string, values: Iterable<string>) => new RegExp(`${prefix}(${[...values]
    .sort((a, b) => b.length - a.length).map((value) => value.replace(/[.*+?^\x24{}()|[\]\\]/g, "\\$&")).join("|")})(?![\\w-])`, "g");
  const classes = new Map(nodes.flatMap((node) => Array.from(node.classList, (name) => [name, `${id}__${name}`] as const)));
  const idRefs = ids.size ? names("#", ids.keys()) : null;
  const classRefs = classes.size ? names("\\.", classes.keys()) : null;
  for (const node of nodes) {
    for (const attr of Array.from(node.attributes)) {
      if (attr.localName === "href") {
        if (attr.value.startsWith("#")) {
          const target = ids.get(attr.value.slice(1));
          if (!target) throw new Error(`Missing icon href: ${attr.value}`);
          attr.value = `#${target}`;
        } else if (node.localName !== "image" || !/^(https?:\/\/|data:image\/)/i.test(attr.value)) node.removeAttributeNode(attr);
      } else attr.value = rewrite(attr.value);
    }
    if (node.id) node.id = ids.get(node.id) ?? node.id;
    if (node.classList.length) node.setAttribute("class", Array.from(node.classList, (name) => classes.get(name) ?? name).join(" "));
    if (node.localName !== "style") continue;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(rewrite(node.textContent ?? ""));
    const scope = (group: CSSStyleSheet | CSSGroupingRule) => {
      for (let index = group.cssRules.length - 1; index >= 0; index--) {
        const rule = group.cssRules[index];
        if (rule instanceof CSSStyleRule) {
          let selector = rule.selectorText;
          if (idRefs) selector = selector.replace(idRefs, (_, name: string) => `#${ids.get(name)}`);
          if (classRefs) selector = selector.replace(classRefs, (_, name: string) => `.${classes.get(name)}`);
          selector = selector.replace(/(^|[\s>+~,(])svg(?=[.#:[\s>+~),]|$)/gi, `$1:is(svg, .${id})`);
          rule.selectorText = `:is(.${id}, .${id} *):is(${selector})`;
        } else if (rule instanceof CSSMediaRule || rule instanceof CSSSupportsRule) scope(rule);
        else group.deleteRule(index);
      }
    };
    scope(sheet);
    node.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join("");
  }
  symbol.id = id;
  symbol.classList.add(id);
  if (/^(burgs|ports)-/.test(artwork.id)) symbol.setAttribute("overflow", "visible");
  return symbol;
}

// Blazons keep charge names; other library references are stored unchanged.
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/354eeaa7a6aa6e0e57abb8e2f5af5e62cef8aab4/src/generators/emblems-generator.ts
export async function chargeIconReference(name: string): Promise<string> {
  const canonical = name === "eagleTwoHeards" ? "eagleTwoHeads" : name;
  const files = await catalog();
  const charge = [...files.keys()].find((id) => id.startsWith("charges-") && id.endsWith(`-${canonical}`));
  if (charge) return charge;
  if (/^(?:glyph|custom|burgs|ports|goods|charges|relief)-[\w-]+$/.test(canonical)) return canonical;
  throw new Error(`Unknown heraldic charge: ${name}`);
}
