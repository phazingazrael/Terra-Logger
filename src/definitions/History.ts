export type TLHistoryEra = {
  id: string;
  name: string;
  shortName: string;
  firstYear: number;
  finalYear: number;
  length: number;
  timelineStartYear: number;
  timelineEndYear: number;
  description?: string;
  createdAt: string;
};

export type TLHistoryEraReference = {
  id: string;
  name: string;
  shortName: string;
  year: number;
};

export type TLMapHistoryConfiguration = {
  currentEraMinimumYear: number;
  previousEras: TLHistoryEra[];
};
