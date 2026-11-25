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

export type TLDevelopmentalEraPlacement = {
  id: string;
  // Absolute chronology coordinates; resolve their historical-era/local-year labels on read.
  startYear: number;
  endYear: number;
  estimated: boolean;
  // Older placements remain explicitly unassigned.
  subject?: { type: "country" | "city"; entityId: string };
};

export type TLDevelopmentalEra = {
  id: string;
  _id: string;
  mapId: string;
  name: string;
  level: number;
  active: boolean;
  description: string;
  content?: AtlasContent;
  placements: TLDevelopmentalEraPlacement[];
  regionalEstimatesInitialized?: boolean;
  estimateBasis: { startYear: number; endYear: number };
  source?: { level: number; name: string; present: boolean };
  createdAt: string;
  updatedAt: string;
};

export type TLDevelopmentSummary = {
  level: number;
  eraId?: string;
  eraName?: string;
};
