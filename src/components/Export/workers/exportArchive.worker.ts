/// <reference lib="webworker" />

import { errorDetails } from "../../Util/errorDetails";

import type { ZipEntry } from "../../../definitions/Export";
import { remapPathsForBOTI } from "../BotiUtils";
import { renderMarkdownFiles } from "../renderMarkdownFiles";
import { createMergedZipBlob, createZipBlob } from "../zipUtils";
import type {
  ExportArchiveRequest,
  ExportArchiveResponse,
} from "./exportArchiveTypes";

function post(message: ExportArchiveResponse): void {
  self.postMessage(message);
}

self.onmessage = async (event: MessageEvent<ExportArchiveRequest>) => {
  const request = event.data;

  if (request.type !== "export") return;

  let context = "Rendering markdown and SVG files";
  try {
    post({
      id: request.id,
      type: "progress",
      message: "Rendering markdown and SVG files...",
      percent: 0,
    });

    let files = renderMarkdownFiles(
      request.data,
      request.templates,
      request.renderOptions,
      request.selectedExports,
      (item) => { context = `Rendering ${item}`; },
    );

    context = "Mapping archive paths";
    if (request.isBOTI) {
      files = remapPathsForBOTI(files);
    }

    const details = files.map((file) => `FILE: ${file.path}`);
    const mermaidBlocks = files.reduce((sum, file) => sum + (typeof file.content === "string" ? (file.content.match(/^[ \t]*(?:>[ \t]*)*```mermaid[ \t]*$/gm)?.length ?? 0) : 0), 0);
    details.push(`Mermaid blocks generated: ${mermaidBlocks}; rendering in Obsidian has not been verified.`);
    const paths = new Set<string>();
    for (const file of files) {
      if (paths.has(file.path)) details.push(`WARNING: Duplicate output path overwritten in ZIP: ${file.path}`);
      paths.add(file.path);
    }
    if (request.selectedExports.includes("Eras")) {
      const npcs = new Map((request.data.NPCs ?? []).map((npc) => [npc._id, new Set((npc.history ?? []).map((entry) => entry.id))]));
      for (const era of request.data.Eras ?? []) {
        const events = era.events ?? [];
        details.push(`Era ${era.name} (${era._id}): ${era.status}, ${events.length} notable events, ${events.reduce((sum, event) => sum + (event.npcHistory?.length ?? 0), 0)} NPC history links.`);
        for (const event of events) for (const link of event.npcHistory ?? []) {
          if (!npcs.get(link.npcId)?.has(link.entryId)) details.push(`WARNING: Missing NPC history source: era ${era._id}, event ${event.id}, NPC ${link.npcId}, entry ${link.entryId}.`);
        }
      }
    }
    if (request.selectedExports.includes("Developmental Eras")) {
      const eras = request.data.DevelopmentalEras ?? [];
      details.push(`Developmental eras: ${eras.length}; active: ${eras.filter((era) => era.active).length}; placements: ${eras.reduce((sum, era) => sum + era.placements.length, 0)}.`);
      for (const era of eras) {
        details.push(`Developmental era ${era.name} (${era._id}): threshold ${era.level}, ${era.active ? "active" : "inactive"}, ${era.placements.length} placements (${era.placements.filter((placement) => placement.estimated).length} estimated).`);
      }
    }
    context = "Creating ZIP archive";
    post({
      id: request.id,
      type: "progress",
      details,
      message: `Rendered ${files.length} files. Creating ZIP archive...`,
      percent: 0,
    });

    const blob = request.isBOTI
      ? await createMergedZipBlob(
        request.botiBaseZipPath,
        files.map((file): ZipEntry => ({ ...file })),
        (percent, currentFile) => {
          context = `Merging BOTI vault ZIP: ${currentFile ?? "compression"}`;
          post({
            id: request.id,
            type: "progress",
            message: "Merging BOTI vault ZIP...",
            percent,
            currentFile,
          });
        },
        (message) => {
          context = message;
          post({ id: request.id, type: "progress", message, details: [message] });
        },
      )
      : await createZipBlob(files, (percent, currentFile) => {
        context = `Creating ZIP archive: ${currentFile ?? "compression"}`;
        post({
          id: request.id,
          type: "progress",
          message: "Creating ZIP archive...",
          percent,
          currentFile,
        });
      });

    post({
      id: request.id,
      type: "success",
      blob,
      fileCount: files.length,
      finalZipName: request.finalZipName,
    });
  } catch (error) {
    post({
      id: request.id,
      type: "error",
      error: errorDetails(Object.assign(new Error(`${context} failed.`), { cause: error })),
    });
  }
};
