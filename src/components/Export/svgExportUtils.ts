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
    '<style type="text/css" data-terra-logger-export-style>',
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
  return svg.replace(/<svg\b([^>]*)>/i, (attrs: string) => {
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
