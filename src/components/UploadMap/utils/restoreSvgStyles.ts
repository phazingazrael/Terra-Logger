// Adapted from the pinned AFMG style writer:
// https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/src/generators/styles.ts
type StoredStyleNode = {
  attrs?: Record<string, string | number | null>;
  options?: Record<string, unknown>;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateNode(value: unknown, path: string): asserts value is StoredStyleNode {
  if (!isRecord(value)) {
    throw new Error(`Invalid AFMG styles section (48): ${path} must be an object.`);
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "attrs") {
      if (!isRecord(child) || !Object.values(child).every((attribute) =>
        attribute === null || typeof attribute === "string" ||
        (typeof attribute === "number" && Number.isFinite(attribute)))) {
        throw new Error(`Invalid AFMG styles section (48): ${path}.attrs contains invalid attributes.`);
      }
    } else if (key === "options") {
      if (!isRecord(child)) {
        throw new Error(`Invalid AFMG styles section (48): ${path}.options must be an object.`);
      }
    } else {
      validateNode(child, `${path}.${key}`);
    }
  }
}

export function readStoredSvgStyles(
  section: string | undefined,
  version: string,
): Record<string, StoredStyleNode> | undefined {
  const [major, minor] = version.split(".").map(Number);
  if (!(major > 1 || (major === 1 && minor >= 150))) return undefined;
  if (!section?.trim()) {
    throw new Error(`Missing AFMG styles section (48) for map version ${version}.`);
  }
  let value: unknown;
  try {
    value = JSON.parse(section);
  } catch {
    throw new Error("Invalid AFMG styles section (48): malformed JSON.");
  }
  if (!isRecord(value)) {
    throw new Error("Invalid AFMG styles section (48): expected a layer-style object.");
  }
  for (const [layer, node] of Object.entries(value)) validateNode(node, layer);
  return value as Record<string, StoredStyleNode>;
}

export function restoreSvgStyles(
  svg: SVGSVGElement,
  styles: Record<string, StoredStyleNode> | undefined,
): string[] {
  if (!styles) return [];
  const issues: string[] = [];
  const layers = Array.from(svg.querySelectorAll("[data-layer]"));
  // These renderer-owned elements do not carry data-group markers.
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/src/renderers/draw-ocean.ts
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/src/renderers/draw-scalebar.ts
  // https://github.com/Azgaar/Fantasy-Map-Generator/blob/386e0f447bc9d3b945e40b0bb123179662734284/src/renderers/draw-legend.ts
  const fixedTargets: Record<string, string> = {
    "ocean.base": "#oceanBase",
    "scaleBar.back": "#scaleBarBack",
    "legend.box": "#legendBox",
  };

  const write = (element: Element, node: StoredStyleNode, path: string) => {
    for (const [name, value] of Object.entries(node.attrs ?? {})) {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, String(value));
    }
    for (const [key, value] of Object.entries(node)) {
      if (key === "attrs" || key === "options") continue;
      const groups = key === "groups"
        ? Object.entries(value as Record<string, StoredStyleNode>)
        : [[key, value as StoredStyleNode]] as const;
      for (const [group, child] of groups) {
        const fixedTarget = fixedTargets[`${path}.${group}`];
        const target = Array.from(element.querySelectorAll("[data-group]"))
          .find((candidate) => candidate.getAttribute("data-group") === group)
          ?? (fixedTarget ? element.querySelector(fixedTarget) : undefined);
        // AFMG leaves the legend empty when no legend has been drawn.
        if (!target && path === "legend" && group === "box" && !element.hasChildNodes()) continue;
        if (target) write(target, child, `${path}.${group}`);
        else if (child.attrs && Object.keys(child.attrs).length) {
          issues.push(`Saved SVG style "${path}.${group}" has no matching group; its source data is retained.`);
        }
      }
    }
  };

  for (const [layer, node] of Object.entries(styles)) {
    const target = layer === "map" ? svg
      : layers.find((element) => element.getAttribute("data-layer") === layer);
    if (target) write(target, node, layer);
    else {
      issues.push(`Saved SVG style layer "${layer}" has no matching element; its source data is retained.`);
    }
  }
  return issues;
}
