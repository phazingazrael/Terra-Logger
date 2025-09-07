// svg parsing utils

const escapeCssId = (s: string) =>
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	(window as any).CSS?.escape
		? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(window as any).CSS.escape(s)
		: s.replace(/([#.;:[\]>,+~=*^$(){}|\\])/g, "\\$1");

// Set ALL <text> under <g id="markers"> to the SAME x/y (percent values).
// Works for texts directly under the group or inside nested <svg> elements.
function setAllMarkerTextsToPercent(
	svgElement: SVGSVGElement,
	xPct: number,
	yPct: number,
): number {
	const g = svgElement.querySelector("g#markers");
	if (!g) return 0;

	const texts = g.querySelectorAll("text"); // includes nested <svg> descendants
	for (const t of texts) {
		t.setAttribute("x", `${xPct}%`);
		t.setAttribute("y", `${yPct}%`);
	}

	return texts.length;
}

function getOrCreateDefs(svgElement: SVGSVGElement): SVGDefsElement {
	const doc = svgElement.ownerDocument;
	let defs = svgElement.querySelector("defs");
	if (!defs) {
		defs = doc.createElementNS("http://www.w3.org/2000/svg", "defs");
		svgElement.insertBefore(defs, svgElement.firstChild);
	}
	return defs;
}

function appendSnippetIntoDefs(defs: SVGDefsElement, snippet: string) {
	const doc = defs.ownerDocument;
	const parser = new DOMParser();
	const fragDoc = parser.parseFromString(
		`<svg xmlns="http://www.w3.org/2000/svg"><defs>${snippet}</defs></svg>`,
		"image/svg+xml",
	);
	const nodes = fragDoc.querySelector("defs")?.childNodes;
	if (nodes) {
		defs.append(...Array.from(nodes, (n: Node) => doc.importNode(n, true)));
	}
}

/**
 * Ensure that <defs> contains each id/snippet pair. If an id is missing *inside <defs>*,
 * the corresponding snippet is appended verbatim.
 */
function ensureDefsHasBatch(
	svgElement: SVGSVGElement,
	items: Array<{ id: string; snippet: string }>,
) {
	const defs = getOrCreateDefs(svgElement);
	for (const { id, snippet } of items) {
		if (!defs.querySelector(`#${escapeCssId(id)}`)) {
			appendSnippetIntoDefs(defs, snippet);
		}
	}
}

// Replace <image href="..."> inside <pattern id="oceanic"> with matching base64 data URLs.
// Works with existing SVG element (not a string). Returns number of replacements.
function inlinePatternImages(
	svgEl: SVGSVGElement,
	dataUrlByFile: Record<string, string>,
	patternId = "oceanic",
): number {
	const pattern = svgEl.querySelector(
		`pattern#${escapeCssId(patternId)}`,
	) as SVGPatternElement | null;
	if (!pattern) return 0;

	const images = Array.from(
		pattern.querySelectorAll("image"),
	) as SVGImageElement[];
	let replaced = 0;

	for (const img of images) {
		// read href (both modern and legacy)
		const rawHref = img.getAttribute("href");

		if (!rawHref || rawHref.startsWith("data:")) continue;

		// strip query/hash; take basename only (handles ./imags/pattern1.png, /images/pattern1.png, etc.)
		const withoutHashQuery = rawHref.split(/[?#]/)[0];
		const basename = withoutHashQuery.split("/").pop() || "";

		// check exact href first, then basename
		const dataUrl = dataUrlByFile[withoutHashQuery] ?? dataUrlByFile[basename];
		if (!dataUrl) continue;

		// write both href attributes for compatibility
		img.setAttribute("href", dataUrl);
		replaced++;
	}

	return replaced;
}

export { setAllMarkerTextsToPercent, ensureDefsHasBatch, inlinePatternImages };
