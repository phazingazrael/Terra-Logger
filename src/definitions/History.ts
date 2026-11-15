import type { AtlasContent } from "./Atlas";

export type TLEraEvent = {
  id: string;
  name: string;
  year: number;
  dateText?: string;
  description: string;
  npcHistory?: Array<{ npcId: string; entryId: string }>;
};

export type TLHistoryEra = {
  id: string;
  name: string;
  shortName: string;
  firstYear: number;
  finalYear: number;
  length: number;
  timelineStartYear: number;
  timelineEndYear: number;
  events?: TLEraEvent[];
  description?: string;
  content?: AtlasContent;
  createdAt: string;
  updatedAt?: string;
};

export type TLMapEra = Omit<TLHistoryEra, "createdAt"> & {
  _id: string;
  mapId: string;
  status: "current" | "previous";
  createdAt?: string;
};

export type TLCurrentHistoryEra = Pick<TLHistoryEra,
  "id" | "events" | "description" | "content" | "updatedAt"> & { createdAt?: string };

export type TLHistoryEraReference = {
  id: string;
  name: string;
  shortName: string;
  year: number;
};

export type TLMapHistoryConfiguration = {
  currentEraMinimumYear: number;
  currentEra?: TLCurrentHistoryEra;
  previousEras: TLHistoryEra[];
};
