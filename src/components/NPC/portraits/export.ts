import type { FileSpec } from "../../../definitions/Export";
import type { TLNPC } from "../../../definitions/TerraLogger";
import { createNPCPlaceholderSvg, NPC_PLACEHOLDER_EXPORT_PATH } from "./placeholders";

const extensionByMimeType: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg",
};

function safeId(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function decodeDataUrl(dataUrl: string): Uint8Array | null {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export function getNPCExportPortraitPath(npc: TLNPC, documentPath = "npcs/npc.md"): string {
  if (npc.portrait.kind === "url") return npc.portrait.value;
  // Portrait assets stay at the archive root even when NPC documents move into subfolders.
  const folders = documentPath.replace(/\\/g, "/").split("/").slice(0, -1);
  const depth = folders.reduce((depth, folder) =>
    !folder || folder === "." ? depth : folder === ".." ? Math.max(0, depth - 1) : depth + 1, 0);
  const root = "../".repeat(depth);
  if (npc.portrait.kind === "uploaded") {
    const extension = extensionByMimeType[npc.portrait.mimeType] ?? "bin";
    return `${root}assets/npc/portraits/${safeId(npc._id)}.${extension}`;
  }
  return `${root}${NPC_PLACEHOLDER_EXPORT_PATH}`;
}

export function createNPCPortraitExportFiles(npcs: readonly TLNPC[]): FileSpec[] {
  const files = new Map<string, FileSpec>();
  let needsPlaceholder = false;

  for (const npc of npcs) {
    if (npc.portrait.kind === "uploaded") {
      const bytes = decodeDataUrl(npc.portrait.data);
      if (!bytes) continue;
      const extension = extensionByMimeType[npc.portrait.mimeType] ?? "bin";
      const path = `assets/npc/portraits/${safeId(npc._id)}.${extension}`;
      files.set(path, { path, name: path.split("/").pop() ?? path, content: bytes });
      continue;
    }

    if (npc.portrait.kind === "url") continue;
    needsPlaceholder = true;
  }

  if (needsPlaceholder) {
    files.set(NPC_PLACEHOLDER_EXPORT_PATH, {
      path: NPC_PLACEHOLDER_EXPORT_PATH,
      name: NPC_PLACEHOLDER_EXPORT_PATH.split("/").pop() ?? NPC_PLACEHOLDER_EXPORT_PATH,
      content: createNPCPlaceholderSvg(),
    });
  }

  return [...files.values()];
}
