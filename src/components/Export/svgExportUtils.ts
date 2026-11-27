import type { DataSets, FileSpec } from "../../definitions/Export";
import { exportIcon, markdownTable } from "./builder/markdownUtils";

export function normalizeSvgForExport(rawSvg: unknown): string {
  const svg = String(rawSvg ?? "").trim();

  if (!svg) return "";

  const withRoot = /^<svg[\s>]/i.test(svg)
    ? svg
    : `<svg xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;

  return ensureSvgNamespaces(withRoot);
}

export function injectSvgStyle(rawSvg: unknown, css: string): string {
  const svg = normalizeSvgForExport(rawSvg);

  if (!svg) return "";

  const trimmedCss = css.trim();

  if (!trimmedCss) return svg;

  const styleTag = [
    '<style type="text/css" data-terra-logger-export-style="true">',
    "<![CDATA[",
    trimmedCss.replaceAll("]]>", "]]]]><![CDATA[>"),
    "]]>",
    "</style>",
  ].join("");

  if (svg.includes("data-terra-logger-export-style")) {
    return svg.replace(
      /<style\b[^>]*data-terra-logger-export-style[^>]*>[\s\S]*?<\/style>/i,
      styleTag,
    );
  }

  return svg.replace(/(<svg\b[^>]*>)/i, `$1\n${styleTag}`);
}

function ensureSvgNamespaces(svg: string): string {
  return svg.replace(/<svg\b([^>]*)>/i, (_match: string, attrs: string) => {
    let nextAttrs = attrs;

    if (!/\sxmlns=/i.test(nextAttrs)) {
      nextAttrs += ' xmlns="http://www.w3.org/2000/svg"';
    }

    if (/\bxlink:/i.test(svg) && !/\sxmlns:xlink=/i.test(nextAttrs)) {
      nextAttrs += ' xmlns:xlink="http://www.w3.org/1999/xlink"';
    }

    return `<svg${nextAttrs}>`;
  });
}

/** Prepare standalone artwork before entering the DOM-free archive worker. */
export async function createExportIconFiles(
  data: DataSets, selected: readonly string[], boti: boolean, onIcon?: (label: string) => void,
): Promise<{ files: FileSpec[]; paths: Record<string, string> }> {
  const files: FileSpec[] = [];
  const paths: Record<string, string> = Object.create(null);
  const usesEconomy = selected.includes("Cities") || selected.includes("Countries");
  const usesMilitary = selected.includes("Map") || selected.includes("Countries");
  if (!usesEconomy && !usesMilitary) return { files, paths };
  const { mapIconImage, readMapIconContext } = await import("../icons/iconLibrary");
  const { customIcons } = readMapIconContext(data.MapInfo);
  const folder = boti ? "z_Assets/misc/icons/" : "assets/icons/";
  const requests: Array<{ key: string; reference: string; label: string; name: string; category: string; color?: string }> = [];
  if (usesEconomy) for (const good of data.MapInfo.economy?.goods ?? []) {
    if (good.icon) requests.push({ key: `good:${good.id}`, reference: good.icon,
      label: good.name, name: `good-${good.id}.svg`, category: "Good", color: good.color || "#eeeeee" });
  }
  if (usesMilitary) {
    const references = new Set((data.MapInfo.settings.options.militaryTypes ?? []).map((unit) => unit.icon).filter(Boolean));
    if (selected.includes("Countries")) for (const country of data.Countries) {
      for (const unit of country.political.military ?? []) if (unit.icon) references.add(unit.icon);
    }
    for (const [index, reference] of [...references].sort().entries()) requests.push({
      key: reference, reference,
      label: data.MapInfo.settings.options.militaryTypes.filter((unit) => unit.icon === reference)
        .map((unit) => unit.name).join(", ") || reference,
      name: `military-${index + 1}.svg`, category: "Military",
    });
  }
  // Sequential loading bounds SVG parsing and custom-image downloads.
  for (const request of requests) {
    onIcon?.(request.label);
    try {
      let image = await mapIconImage(request.reference, customIcons);
      if (/^https?:\/\//i.test(image)) {
        const response = await fetch(image);
        if (!response.ok) throw new Error(`Image request failed (${response.status}).`);
        const blob = await response.blob();
        if (!blob.type.startsWith("image/")) throw new Error("Custom icon response is not an image.");
        const bytes = new Uint8Array(await blob.arrayBuffer());
        let binary = "";
        for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        image = `data:${blob.type};base64,${btoa(binary)}`;
      }
      const doc = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="24" height="24"/>', "image/svg+xml");
      const root = doc.documentElement;
      if (request.color) {
        const circle = doc.createElementNS(root.namespaceURI, "circle");
        circle.setAttribute("cx", "50"); circle.setAttribute("cy", "50"); circle.setAttribute("r", "49");
        circle.setAttribute("fill", CSS.supports("color", request.color) ? request.color : "#eeeeee");
        circle.setAttribute("stroke", "#777777");
        root.append(circle);
      }
      const inset = request.color ? "11" : "0";
      const size = request.color ? "78" : "100";
      let artwork: Element;
      if (image.startsWith("data:image/svg+xml;charset=utf-8,")) {
        const source = new DOMParser().parseFromString(decodeURIComponent(image.slice(image.indexOf(",") + 1)), "image/svg+xml");
        if (source.querySelector("parsererror") || source.documentElement.localName !== "svg") throw new Error("Invalid sanitized SVG icon.");
        await fitExportGlyph(source.documentElement);
        artwork = doc.importNode(source.documentElement, true);
      } else {
        if (!image.startsWith("data:image/")) throw new Error("Custom icon could not be embedded.");
        artwork = doc.createElementNS(root.namespaceURI, "image");
        artwork.setAttribute("href", image);
      }
      artwork.setAttribute("x", inset); artwork.setAttribute("y", inset);
      artwork.setAttribute("width", size); artwork.setAttribute("height", size);
      root.append(artwork);
      const path = folder + request.name;
      paths[`icon:${request.key}`] = path;
      files.push({ path, name: request.name, content: new XMLSerializer().serializeToString(root) });
    } catch (cause) {
      throw Object.assign(new Error(`Cannot export icon for ${request.label} (${request.reference}).`), { cause });
    }
  }
  if (files.length) {
    const path = boti ? "Guides/06. Icons.md" : "assets/icons/icon-guide.md";
    const context = {
      data, templateId: boti ? "boti" as const : "default" as const,
      sourceType: "map" as const, entity: {}, documentPath: path, documentPaths: paths,
    };
    files.push({
      path, name: path.split("/").pop() ?? "icon-guide.md",
      content: [
        "# Exported Icons",
        "",
        "All icons in this export currently come from Azgaar's Fantasy Map Generator (AFMG).",
        "",
        "Goods icons use their configured background colours. Military icons use the map's assigned artwork.",
        "",
        boti
          ? "Embed an icon by its unique filename: `![[good-1.svg|24]]`. Keep filenames unique within the vault."
          : "Icon images use relative asset paths. Keep the exported folder structure when moving documents.",
        "",
        markdownTable(["Icon", "Name", "Category", "File"], requests.map((request) => [
          exportIcon(context, request.key, request.label), request.label, request.category, request.name,
        ])),
      ].join("\n"),
    });
  }
  return { files, paths };
}

/** Text glyphs can extend beyond the library's nominal 100×100 frame. */
async function fitExportGlyph(svg: Element): Promise<void> {
  if (svg.children.length !== 1 || svg.firstElementChild?.localName !== "text") return;
  await document.fonts.ready;
  const measurement = document.importNode(svg, true) as SVGSVGElement;
  measurement.style.cssText = "position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none";
  document.body.append(measurement);
  try {
    const bounds = measurement.getBBox();
    if (![bounds.x, bounds.y, bounds.width, bounds.height].every(Number.isFinite) ||
        bounds.width <= 0 || bounds.height <= 0) {
      throw new Error("Cannot measure exported glyph bounds.");
    }
    const margin = Math.max(bounds.width, bounds.height) * 0.1;
    svg.setAttribute("viewBox", [
      bounds.x - margin, bounds.y - margin,
      bounds.width + margin * 2, bounds.height + margin * 2,
    ].join(" "));
  } finally {
    measurement.remove();
  }
}
