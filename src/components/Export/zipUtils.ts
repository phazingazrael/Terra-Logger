/**
 * Handles all file zipping logic:
 * - zipFiles: simple zip from FileSpec[]
 * - mergeZipWithBase: merges new files into a pre-existing public zip (BOTI)
 */

import type { FileSpec, ZipEntry } from "../../definitions/Export";

export function normalizeZipPath(p: string) {
	return String(p || "")
		.replace(/\\/g, "/")
		.replace(/^\/+/, "");
}

export function withBase(pathLike: string) {
	const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
	const rel = String(pathLike).replace(/^\/+/, "");

	return `${base}/${rel}`;
}

export async function createMergedZipBlob(
	publicZipRelPath: string,
	entries: ReadonlyArray<ZipEntry>,
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const { default: JSZip } = await import("jszip");

	const url = withBase(publicZipRelPath);
	const res = await fetch(url, { cache: "no-cache" });

	if (!res.ok) {
		throw new Error(`Failed to fetch base vault zip: ${url} (${res.status})`);
	}

	const ab = await res.arrayBuffer();
	const baseZip = await JSZip.loadAsync(ab);

	const protectedPrefixes = [".obsidian/"];

	for (const entry of entries) {
		const pathInZip = normalizeZipPath(entry.path);

		if (
			protectedPrefixes.some((prefix) =>
				pathInZip.toLowerCase().startsWith(prefix),
			)
		) {
			continue;
		}

		const opts =
			entry.zipOptions ??
			(entry.content instanceof Uint8Array ? { binary: true } : undefined);

		baseZip.file(pathInZip, entry.content as any, opts);
	}

	return baseZip.generateAsync(
		{
			type: "blob",
			compression: "DEFLATE",
		},
		(meta) => onProgress?.(Math.round(meta.percent), meta.currentFile ?? ""),
	);
}

export async function createZipBlob(
	files: FileSpec[],
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const { default: JSZip } = await import("jszip");
	const zip = new JSZip();

	for (const file of files) {
		zip.file(file.path, file.content);
	}

	return zip.generateAsync(
		{
			type: "blob",
			compression: "DEFLATE",
		},
		onProgress
			? (meta) => onProgress(Math.round(meta.percent), meta.currentFile ?? "")
			: undefined,
	);
}

export function downloadBlob(blob: Blob, filename: string): void {
	const href = URL.createObjectURL(blob);
	const a = document.createElement("a");

	a.href = href;
	a.download = filename.endsWith(".zip") ? filename : `${filename}.zip`;

	document.body.appendChild(a);
	a.click();
	a.remove();

	URL.revokeObjectURL(href);
}

/**
 * Backward-compatible helper: create and immediately download a merged BOTI zip.
 */
export async function mergeZipWithBase(
	publicZipRelPath: string,
	entries: ReadonlyArray<ZipEntry>,
	finalZipName: string,
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const blob = await createMergedZipBlob(publicZipRelPath, entries, onProgress);

	downloadBlob(blob, finalZipName);

	return blob;
}

/**
 * Backward-compatible helper: create and immediately download a normal zip.
 */
export async function zipFiles(
	files: FileSpec[],
	zipName = "export.zip",
	onProgress?: (percent: number, currentFile?: string) => void,
): Promise<Blob> {
	const blob = await createZipBlob(files, onProgress);

	downloadBlob(blob, zipName);

	return blob;
}
