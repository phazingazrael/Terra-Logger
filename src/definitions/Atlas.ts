import type { ReactNode } from "react";
import type {
  TLCity,
  TLCountry,
  TLCulture,
  TLNote,
  TLReligion,
} from "./TerraLogger";
import type { Tag } from "./Common";

export const ATLAS_CONTENT_SCHEMA = "atlas/content/v1" as const;
export const ATLAS_CONTENT_VERSION = 1 as const;

export type AtlasSourceType = "city" | "country" | "culture" | "religion" | "note";

export type AtlasEntity = TLCity | TLCountry | TLCulture | TLReligion | TLNote;

export type AtlasEntityBySource = {
  city: TLCity;
  country: TLCountry;
  culture: TLCulture;
  religion: TLReligion;
  note: TLNote;
};

export type AtlasRelatedEntities = Partial<{
  cities: TLCity[];
  countries: TLCountry[];
  cultures: TLCulture[];
  religions: TLReligion[];
  notes: TLNote[];
  tags: Tag[];
}>;

export type AtlasLayoutPreset = "content-grid" | "stack" | "sidebar";
export type AtlasDensity = "comfortable" | "compact";
export type AtlasGridSpan = "auto" | "wide" | "full";

export type AtlasContent = {
  schema: typeof ATLAS_CONTENT_SCHEMA;
  kind: "AtlasContent";
  version: typeof ATLAS_CONTENT_VERSION;
  id: string;
  source: {
    type: AtlasSourceType;
    entityId: string;
    mapId?: string;
  };
  meta: {
    title: string;
    summary?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: "map-loader" | "user" | "migration";
  };
  layout: {
    preset: AtlasLayoutPreset;
    className?: string;
    density?: AtlasDensity;
  };
  sections: AtlasSection[];
};

export type AtlasSectionVariant = "default" | "clear";

export type AtlasSectionWrapper = {
  className?: string;
  variant?: AtlasSectionVariant;
  layout?: AtlasLayoutPreset;
  gridSpan?: AtlasGridSpan;
};

export type AtlasSection = {
  id: string;
  kind: "section";
  presetId?: string;
  title: string;
  wrapper: AtlasSectionWrapper;
  editor: Partial<{
    editable: boolean;
    removable: boolean;
    reorderable: boolean;
    collapsed?: boolean;
    lockedReason?: string;
  }>;
  blocks: AtlasBlock[];
};

export type AtlasBlockDataMode = "static" | "entity" | "computed";

export type AtlasBlock = {
  id: string;
  kind: "block";
  type: string;
  presetId?: string;
  label?: string;
  dataMode: AtlasBlockDataMode;
  binding?: {
    entityPath?: string;
    relatedCollection?: keyof AtlasRelatedEntities;
    resolver?: string;
  };
  editor: {
    editable: boolean;
    removable: boolean;
    reorderable: boolean;
    editorType?: string;
  };
  props: Record<string, unknown>;
};

export type AtlasRenderContext<TSource extends AtlasSourceType = AtlasSourceType> = {
  sourceType: TSource;
  entity: AtlasEntityBySource[TSource];
  related?: AtlasRelatedEntities;
};

export type AtlasEntityFieldChange = {
  path: string;
  value: unknown;
};

export type AtlasRelatedUpdate =
  | {
    action: "add";
    store: "tags";
    value: Tag & {
      mapId?: string;
    };
  }
  | {
    action: "update";
    store: "tags";
    key: string;
    value: Tag & {
      mapId?: string;
    };
  }
  | {
    action: "update";
    store: "notes";
    key: string;
    value: TLNote;
  }
  | {
    action: "update";
    store: "cities";
    key: string;
    value: TLCity;
  };

export type AtlasRelatedUpdateHandler = (update: AtlasRelatedUpdate) => void;

export type AtlasEditorContext<
  TSource extends AtlasSourceType = AtlasSourceType,
> = AtlasRenderContext<TSource> & {
  onEntityFieldChange: (change: AtlasEntityFieldChange) => void;
  onRelatedUpdate: AtlasRelatedUpdateHandler;
};

export type AtlasPageEditorSavePayload<
  TSource extends AtlasSourceType = AtlasSourceType,
> = {
  content: AtlasContent;
  entity: AtlasEntityBySource[TSource];
  relatedUpdates?: AtlasRelatedUpdate[];
};

export type AtlasBlockPlugin = {
  type: string;
  label: string;
  Render: (props: {
    block: AtlasBlock;
    context: AtlasRenderContext;
  }) => ReactNode;
};

export type AtlasSectionPreset<TSource extends AtlasSourceType = AtlasSourceType> = {
  id: string;
  label: string;
  description: string;
  create: (entity: AtlasEntityBySource[TSource]) => AtlasSection;
};

export type AtlasBlockPreset<TSource extends AtlasSourceType = AtlasSourceType> = {
  id: string;
  label: string;
  description: string;
  create: (entity: AtlasEntityBySource[TSource]) => AtlasBlock;
};

export type AtlasAdapter<TSource extends AtlasSourceType = AtlasSourceType> = {
  sourceType: TSource;
  label: string;
  defaultLayout: AtlasLayoutPreset;
  getEntityId: (entity: AtlasEntityBySource[TSource]) => string;
  getEntityTitle: (entity: AtlasEntityBySource[TSource]) => string;
  createDefaultContent: (entity: AtlasEntityBySource[TSource]) => AtlasContent;
  sectionPresets: AtlasSectionPreset<TSource>[];
  blockPresets: AtlasBlockPreset<TSource>[];
};

export type AtlasContentEntity<TSource extends AtlasSourceType = AtlasSourceType> =
  AtlasEntityBySource[TSource] & {
    content?: AtlasContent;
  };
