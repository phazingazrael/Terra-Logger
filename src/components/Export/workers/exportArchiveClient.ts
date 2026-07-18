import type {
  DataSets,
  RenderOptions,
  TemplateMap,
} from "../../../definitions/Export";
import type {
  ExportArchiveRequest,
  ExportArchiveResponse,
} from "./exportArchiveTypes";

type RunExportArchiveWorkerArgs = {
  data: DataSets;
  templates: TemplateMap;
  renderOptions: RenderOptions;
  selectedExports: string[];
  isBOTI: boolean;
  finalZipName: string;
  botiBaseZipPath: string;
  onProgress?: (progress: {
    message: string;
    percent?: number;
    currentFile?: string;
  }) => void;
};

type RunExportArchiveWorkerResult = {
  blob: Blob;
  fileCount: number;
  finalZipName: string;
};

export function runExportArchiveWorker({
  data,
  templates,
  renderOptions,
  selectedExports,
  isBOTI,
  finalZipName,
  botiBaseZipPath,
  onProgress,
}: RunExportArchiveWorkerArgs): Promise<RunExportArchiveWorkerResult> {
  return new Promise((resolve, reject) => {
    const id = crypto.randomUUID();

    const worker = new Worker(new URL("./exportArchive.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<ExportArchiveResponse>) => {
      const message = event.data;

      if (message.id !== id) return;

      if (message.type === "progress") {
        onProgress?.({
          message: message.message,
          percent: message.percent,
          currentFile: message.currentFile,
        });
        return;
      }

      if (message.type === "success") {
        worker.terminate();

        resolve({
          blob: message.blob,
          fileCount: message.fileCount,
          finalZipName: message.finalZipName,
        });
        return;
      }

      if (message.type === "error") {
        worker.terminate();
        reject(new Error(message.error));
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message));
    };

    const request: ExportArchiveRequest = {
      id,
      type: "export",
      data,
      templates,
      renderOptions,
      selectedExports,
      isBOTI,
      finalZipName,
      botiBaseZipPath,
    };

    worker.postMessage(request);
  });
}
