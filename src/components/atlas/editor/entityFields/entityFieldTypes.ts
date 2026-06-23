import type {
  AtlasEntityBySource,
  AtlasRelatedEntities,
  AtlasRelatedUpdateHandler,
  AtlasSourceType,
} from "../../../../definitions/Atlas";

export type AtlasEntityFieldEditorType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "stringList"
  | "tagList"
  | "reference"
  | "referenceList"
  | "object"
  | "objectList"
  | "readonly";

export type AtlasEntityFieldOption = {
  label: string;
  value: string | number | boolean;
};

export type AtlasReferenceCollection =
  | "cities"
  | "countries"
  | "cultures"
  | "religions"
  | "notes";

export type AtlasReferenceSerializerId =
  | "raw"
  | "id"
  | "numericId"
  | "_id"
  | "name"
  | "cityCountryRef"
  | "cityCultureRef"
  | "countryCultureRef"
  | "religionCultureRef"
  | "religionCenterRef";

export type AtlasEntityFieldSchema = {
  path: string;
  label: string;
  editor: AtlasEntityFieldEditorType;
  description?: string;
  placeholder?: string;
  options?: AtlasEntityFieldOption[];

  referenceCollection?: AtlasReferenceCollection;
  referenceLabelPath?: string;
  referenceValuePath?: string;
  referenceSerializer?: AtlasReferenceSerializerId;

  itemLabel?: string;
  itemFields?: AtlasEntityFieldSchema[];
};

export type AtlasEntityFieldCatalog = {
  [TSource in AtlasSourceType]: AtlasEntityFieldSchema[];
};

export type AtlasComputedFieldMap = Partial<
  Record<AtlasSourceType, Record<string, string[]>>
>;

export type AtlasEntityFieldEditorProps<
  TSource extends AtlasSourceType = AtlasSourceType,
> = {
  sourceType: TSource;
  entity: AtlasEntityBySource[TSource];
  related?: AtlasRelatedEntities;
  schema: AtlasEntityFieldSchema;
  value: unknown;
  onChange: (value: unknown) => void;
  onRelatedUpdate?: AtlasRelatedUpdateHandler;
};
