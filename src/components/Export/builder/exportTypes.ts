import type { DataSets, FileSpec } from "../../../definitions/Export";

export type ExportTemplateId = "default" | "boti";

export type ExportSourceType =
  | "map"
  | "city"
  | "country"
  | "culture"
  | "religion"
  | "note";

export type ExportEntity = Record<string, unknown>;

export type ExportContext = {
  data: DataSets;
  templateId: ExportTemplateId;
  sourceType: ExportSourceType;
  entity: ExportEntity;
};

export type MarkdownBlock = {
  id: string;
  render: (context: ExportContext) => string;
};

export type MarkdownDocumentTemplate = {
  id: ExportTemplateId;
  label: string;
  getBlocks: (sourceType: ExportSourceType) => MarkdownBlock[];
};

export type { DataSets, FileSpec };
