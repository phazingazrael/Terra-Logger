import { useEffect, useMemo, useState } from "react";

function normalizeSvgForImage(svg: string): string {
	let next = svg.trim();

	if (!next.startsWith("<svg")) {
		return next;
	}

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

export function SvgImage({
	svg,
	className,
	alt = "SVG image",
}: Readonly<{
	svg?: string | null;
	className?: string;
	alt?: string;
}>) {
	const normalizedSvg = useMemo(() => {
		if (!svg) return null;
		return normalizeSvgForImage(svg);
	}, [svg]);

	const [url, setUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!normalizedSvg) {
			setUrl(null);
			return;
		}

		const blob = new Blob([normalizedSvg], {
			type: "image/svg+xml;charset=utf-8",
		});

		const objectUrl = URL.createObjectURL(blob);
		setUrl(objectUrl);

		return () => URL.revokeObjectURL(objectUrl);
	}, [normalizedSvg]);

	if (!url) return null;

	return <img className={className} src={url} alt={alt} />;
}
