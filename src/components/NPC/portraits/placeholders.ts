import type { TLNPC } from "../../../definitions/TerraLogger";

export const NPC_PLACEHOLDER_FILE_NAME = "npc-placeholder.svg";
export const NPC_PLACEHOLDER_EXPORT_PATH = `assets/npc/placeholders/${NPC_PLACEHOLDER_FILE_NAME}`;

export function getNPCPlaceholderPath(): string {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
  return `${base}/${NPC_PLACEHOLDER_EXPORT_PATH}`;
}

export function resolveNPCPortraitSource(npc: Pick<TLNPC, "portrait">): string {
  const portrait = npc.portrait;
  if (portrait.kind === "uploaded") return portrait.data;
  if (portrait.kind === "url" && portrait.value.trim()) return portrait.value.trim();
  return getNPCPlaceholderPath();
}

export function createNPCPlaceholderSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Generic NPC portrait placeholder">
  <rect width="256" height="256" rx="28" fill="#34383f"/>
  <circle cx="128" cy="98" r="48" fill="#aeb4bd"/>
  <path d="M42 256c5-54 38-88 86-88s81 34 86 88H42Z" fill="#aeb4bd"/>
</svg>`;
}
