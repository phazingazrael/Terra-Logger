/**
 * Handles all file zipping logic:
 * - zipFiles: simple zip from FileSpec[]
 * - mergeZipWithBase: merges new files into a pre-existing public zip (BOTI)
 */

import type { FileSpec, ZipEntry } from "../../definitions/Export";

/**
 * Normalize ZIP path: Unix-style and remove leading slashes.
 */
export function normalizeZipPath(p: string) {
	return String(p || "")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "");
}

/**
 * Convert relative path to full URL using BASE_URL
 */
export function withBase(pathLike: string) {
	const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
	const rel = String(pathLike).replace(/^\/+/, "");
	return `${base}/${rel}`;
}

// Merge generated entries into the base vault zip from public/ and download.
// .obsidian/** is protected (not overwritten).
export async function mergeZipWithBase(
	publicZipRelPath: string,
	entries: ReadonlyArray<ZipEntry>,
	finalZipName: string,
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const { default: JSZip } = await import("jszip");

	const url = withBase(publicZipRelPath);
	const res = await fetch(url, { cache: "no-cache" });
	if (!res.ok)
		throw new Error(`Failed to fetch base vault zip: ${url} (${res.status})`);
	const ab = await res.arrayBuffer();

	const baseZip = await JSZip.loadAsync(ab);

	const PROTECTED_PREFIXES = [".obsidian/"]; // keep vault settings/plugins intact
	for (const e of entries) {
		const pathInZip = normalizeZipPath(e.path);
		if (PROTECTED_PREFIXES.some((p) => pathInZip.toLowerCase().startsWith(p)))
			continue;
		const opts =
			e.zipOptions ??
			(e.content instanceof Uint8Array ? { binary: true } : undefined);
		baseZip.file(pathInZip, e.content as any, opts); // overwrite or add
	}

	const blob = await baseZip.generateAsync(
		{ type: "blob", compression: "DEFLATE" },
		(meta) => onProgress?.(Math.round(meta.percent), meta.currentFile ?? ""),
	);

	const href = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = href;
	a.download = finalZipName.endsWith(".zip")
		? finalZipName
		: `${finalZipName}.zip`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(href);

	return blob;
}

/**
 * Simple ZIP file from an array of FileSpec objects (used for default exports)
 */
export async function zipFiles(
	files: FileSpec[],
	zipName = "export.zip",
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const { default: JSZip } = await import("jszip");
	const zip = new JSZip();

	for (const f of files) {
		zip.file(f.path, f.content); // content is string
	}

	const blob = await zip.generateAsync(
		{ type: "blob", compression: "DEFLATE" },
		onProgress
			? (m) => onProgress(Math.round(m.percent), m.currentFile ?? "")
			: undefined,
	);

	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = zipName;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
	return blob;
}
