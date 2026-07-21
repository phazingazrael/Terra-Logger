import { memo, useMemo } from "react";

function normalizeSvgForImage(svg: string): string {
	let next = svg.trim();

	if (!next.startsWith("<svg")) return next;
	if (!next.includes("xmlns=")) {
		next = next.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
	}
	if (!next.includes("xmlns:xlink=")) {
		next = next.replace(
			"<svg",
			'<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
		);
	}

	return next;
}

export const SvgImage = memo(function SvgImage({
	svg,
	className,
	alt = "SVG image",
}: Readonly<{
	svg?: string | null;
	className?: string;
	alt?: string;
}>) {
	const source = useMemo(() => {
		if (!svg) return null;
		const normalizedSvg = normalizeSvgForImage(svg);
		return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalizedSvg)}`;
	}, [svg]);

	if (!source) return null;
	return <img className={className} src={source} alt={alt} loading="lazy" />;
});
