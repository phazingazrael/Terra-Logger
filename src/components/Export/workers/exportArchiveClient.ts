import { createExportIconFiles } from "../svgExportUtils";
import { restoreError } from "../../Util/errorDetails";
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
    details?: string[];
  }) => void;
};

type RunExportArchiveWorkerResult = {
  blob: Blob;
  fileCount: number;
  finalZipName: string;
};

export async function runExportArchiveWorker({
  data,
  templates,
  renderOptions,
  selectedExports,
  isBOTI,
  finalZipName,
  botiBaseZipPath,
  onProgress,
}: RunExportArchiveWorkerArgs): Promise<RunExportArchiveWorkerResult> {
  if (selectedExports.includes("NPCs") && !data.ReferenceCatalogs) {
    onProgress?.({ message: "Loading race and profession reference details..." });
    const [{ listAncestryDefinitions }, { listNPCProfessions }] = await Promise.all([
      import("../../NPC/generator/ancestries/repository"),
      import("../../NPC/generator/professions/repository"),
    ]);
    const [ancestries, professions] = await Promise.all([
      listAncestryDefinitions({ includeDisabled: true }),
      listNPCProfessions({ includeDisabled: true }),
    ]);
    data = { ...data, ReferenceCatalogs: {
      ancestries: ancestries.map(({ id, name, description, rarity }) => ({ id, name, description, rarity })),
      professions: professions.map(({ id, name, description, category, governmentCategory }) =>
        ({ id, name, description, category, governmentCategory })),
    } };
  }
  onProgress?.({ message: "Preparing export icons..." });
  const icons = await createExportIconFiles(data, selectedExports, isBOTI, (label) =>
    onProgress?.({ message: `Preparing icon: ${label}` }));
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
          details: message.details,
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
        reject(restoreError(message.error));
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(`${event.message} (${event.filename}:${event.lineno}:${event.colno})`));
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
      icons,
    };

    worker.onmessageerror = () => {
      worker.terminate();
      reject(new Error("Could not deserialize export archive worker response."));
    };
    try {
      worker.postMessage(request);
    } catch (error) {
      worker.terminate();
      reject(error);
    }
  });
}
