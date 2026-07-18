import type {
  DataSets,
  RenderOptions,
  TemplateMap,
} from "../../../definitions/Export";

export type ExportArchiveRequest = {
  id: string;
  type: "export";
  data: DataSets;
  templates: TemplateMap;
  renderOptions: RenderOptions;
  selectedExports: string[];
  isBOTI: boolean;
  finalZipName: string;
  botiBaseZipPath: string;
};

export type ExportArchiveProgress = {
  id: string;
  type: "progress";
  message: string;
  percent?: number;
  currentFile?: string;
};

export type ExportArchiveSuccess = {
  id: string;
  type: "success";
  blob: Blob;
  fileCount: number;
  finalZipName: string;
};

export type ExportArchiveError = {
  id: string;
  type: "error";
  error: string;
};

export type ExportArchiveResponse =
  | ExportArchiveProgress
  | ExportArchiveSuccess
  | ExportArchiveError;
