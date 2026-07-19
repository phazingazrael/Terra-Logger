export type MapImportProgressPhase =
  | "reading"
  | "parsing"
  | "validating"
  | "normalizing"
  | "complete";

export type MapImportProgress = {
  phase: MapImportProgressPhase;
  message: string;
  percent?: number;
  section?: string;
  item?: string;
  completed?: number;
  total?: number;
};

export type MapImportValidationResult = {
  isUpdated: boolean;
  isNewer: boolean;
  isInvalid: boolean;
  isAncient: boolean;
  isOutdated: boolean;
};

export type MapImportWorkerRequest = {
  type: "IMPORT_MAP";
  requestId: string;
  fileName: string;
  buffer: ArrayBuffer;
  currentVersion: string;
  oldestSupportedVersion: string;
};

export type MapImportWorkerResult = {
  fileName: string;
  mapFile: string[];
  mapVersion: number;
  versionString: string;
  version: string;
  validation: MapImportValidationResult;
  identity: MapImportIdentity;
};

export type MapImportWorkerProgressMessage = {
  type: "PROGRESS";
  requestId: string;
  progress: MapImportProgress;
};

export type MapImportWorkerSuccessMessage = {
  type: "SUCCESS";
  requestId: string;
  result: MapImportWorkerResult;
};

export type MapImportWorkerErrorMessage = {
  type: "ERROR";
  requestId: string;
  error: {
    message: string;
    stack?: string;
  };
};

export type MapImportWorkerMessage =
  | MapImportWorkerProgressMessage
  | MapImportWorkerSuccessMessage
  | MapImportWorkerErrorMessage;

export type MapImportIdentity = {
  name: string;
  id: string;
  mapId: string;
};
