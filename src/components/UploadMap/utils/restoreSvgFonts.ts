function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cssString(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n\f]/g, " ")}"`;
}

export function restoreSvgFonts(
  svg: SVGSVGElement,
  source: AFMGRenderingSource,
): string[] {
  const section = source.sections[34];
  if (!section?.trim()) return [];

  let fonts: unknown;
  try {
    fonts = JSON.parse(section);
  } catch {
    return ["Saved font definitions in section 34 could not be parsed; existing SVG fonts are preserved."];
  }
  if (!Array.isArray(fonts)) {
    return ["Saved font definitions in section 34 are not a list; existing SVG fonts are preserved."];
  }

  const issues = new Set<string>();
  const rules = new Set<string>();
  for (const font of fonts) {
    if (!isRecord(font) || typeof font.family !== "string" || !font.family.trim()) {
      issues.add("A saved font definition has no usable family name.");
      continue;
    }
    // System fonts have no source and need no @font-face declaration.
    if (font.src === undefined) continue;
    if (typeof font.src !== "string") {
      issues.add(`Saved font "${font.family}" has an invalid source.`);
      continue;
    }

    // Accept one URL, not arbitrary stylesheet text or multiple declarations.
    const match = font.src.match(/^url\(\s*(?:"([^"]+)"|'([^']+)'|([^()\s]+))\s*\)$/);
    const href = match?.[1] ?? match?.[2] ?? match?.[3];
    if (!href) {
      issues.add(`Saved font "${font.family}" has an unsupported source expression.`);
      continue;
    }
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      issues.add(`Saved font "${font.family}" has a relative or invalid URL.`);
      continue;
    }
    if (url.protocol !== "https:" &&
      !(url.protocol === "data:" && /^data:(?:font\/|application\/(?:font-|x-font-|octet-stream))/i.test(href))) {
      issues.add(`Saved font "${font.family}" has an unsupported URL scheme or data type.`);
      continue;
    }

    const declarations = [
      `font-family:${cssString(font.family)}`,
      `src:url(${cssString(url.href)})`,
      "font-display:swap",
    ];
    if (font.unicodeRange !== undefined) {
      if (typeof font.unicodeRange === "string" &&
        /^(?:U\+[0-9a-f?]{1,6}(?:-[0-9a-f]{1,6})?)(?:\s*,\s*U\+[0-9a-f?]{1,6}(?:-[0-9a-f]{1,6})?)*$/i.test(font.unicodeRange)) {
        declarations.push(`unicode-range:${font.unicodeRange}`);
      } else {
        issues.add(`Saved font "${font.family}" has an invalid Unicode range.`);
        continue;
      }
    }
    if (font.variant !== undefined) {
      // AFMG stores the font-face font-style descriptor under "variant".
      // https://github.com/Azgaar/Fantasy-Map-Generator/blob/bf32ac7230654361eedfc25985b4ecc3473889b1/src/services/fonts.ts
      if (font.variant === "normal" || font.variant === "italic" || font.variant === "oblique") {
        declarations.push(`font-style:${font.variant}`);
      } else if (font.variant === "small-caps") {
        // Retain support for definitions accepted by the previous importer.
        declarations.push(`font-variant:${font.variant}`);
      } else {
        issues.add(`Saved font "${font.family}" has an unsupported variant.`);
        continue;
      }
    }
    rules.add(`@font-face{${declarations.join(";")}}`);
  }

  // Own only this generated element; preserve the map's original styles.
  const existing = svg.querySelector('style[data-terra-logger="map-fonts"]');
  if (rules.size) {
    const style = svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "style");
    style.setAttribute("data-terra-logger", "map-fonts");
    style.textContent = [...rules].join("\n");
    if (existing) existing.replaceWith(style);
    else svg.insertBefore(style, svg.firstChild);
  } else {
    existing?.remove();
  }
  return [...issues];
}
