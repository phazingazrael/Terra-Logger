/// <reference lib="webworker" />

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
    );

    if (request.isBOTI) {
      files = remapPathsForBOTI(files);
    }

    post({
      id: request.id,
      type: "progress",
      message: `Rendered ${files.length} files. Creating ZIP archive...`,
      percent: 0,
    });

    const blob = request.isBOTI
      ? await createMergedZipBlob(
        request.botiBaseZipPath,
        files.map((file): ZipEntry => ({ ...file })),
        (percent, currentFile) => {
          post({
            id: request.id,
            type: "progress",
            message: "Merging BOTI vault ZIP...",
            percent,
            currentFile,
          });
        },
      )
      : await createZipBlob(files, (percent, currentFile) => {
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
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export { };
