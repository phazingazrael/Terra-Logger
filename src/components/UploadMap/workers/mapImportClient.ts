import type {
  MapImportProgress,
  MapImportWorkerMessage,
  MapImportWorkerRequest,
  MapImportWorkerResult,
} from "./mapImportTypes";

type RunMapImportWorkerOptions = {
  currentVersion: string;
  oldestSupportedVersion: string;
  onProgress?: (progress: MapImportProgress) => void;
  signal?: AbortSignal;
};

function createRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function runMapImportWorker(
  file: File,
  options: RunMapImportWorkerOptions,
): Promise<MapImportWorkerResult> {
  const requestId = createRequestId();
  const buffer = await file.arrayBuffer();

  return new Promise<MapImportWorkerResult>((resolve, reject) => {
    const worker = new Worker(new URL("./mapImport.worker.ts", import.meta.url), {
      type: "module",
    });

    const cleanup = () => {
      worker.terminate();
      options.signal?.removeEventListener("abort", handleAbort);
    };

    const handleAbort = () => {
      cleanup();
      reject(new DOMException("Map import was cancelled.", "AbortError"));
    };

    worker.onmessage = (event: MessageEvent<MapImportWorkerMessage>) => {
      const message = event.data;

      if (!message || message.requestId !== requestId) {
        return;
      }

      if (message.type === "PROGRESS") {
        options.onProgress?.(message.progress);
        return;
      }

      if (message.type === "SUCCESS") {
        cleanup();
        resolve(message.result);
        return;
      }

      if (message.type === "ERROR") {
        cleanup();
        reject(new Error(message.error.message));
      }
    };

    worker.onerror = (event) => {
      cleanup();
      reject(
        new Error(
          event.message || "Map import worker failed with an unknown error.",
        ),
      );
    };

    if (options.signal?.aborted) {
      handleAbort();
      return;
    }

    options.signal?.addEventListener("abort", handleAbort);

    const request: MapImportWorkerRequest = {
      type: "IMPORT_MAP",
      requestId,
      fileName: file.name,
      buffer,
      currentVersion: options.currentVersion,
      oldestSupportedVersion: options.oldestSupportedVersion,
    };

    worker.postMessage(request, [buffer]);
  });
}
