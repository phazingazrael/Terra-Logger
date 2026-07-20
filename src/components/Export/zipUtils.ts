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

    baseZip.file(pathInZip, entry.content, opts);
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

