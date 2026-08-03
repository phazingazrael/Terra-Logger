function validateSvgResponse(svg: string): string {
	const normalizedSvg = svg.trimStart();

	if (!normalizedSvg) {
		throw new Error("The service returned an empty response.");
	}

	if (
		normalizedSvg.startsWith("<!DOCTYPE html") ||
		normalizedSvg.startsWith("<html")
	) {
		throw new Error("The service returned HTML instead of SVG.");
	}

	if (!normalizedSvg.startsWith("<svg") && !normalizedSvg.startsWith("<?xml")) {
		throw new Error("The service returned data that is not SVG.");
	}

	return svg;
}

export { validateSvgResponse };
