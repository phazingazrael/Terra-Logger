// src/definitions/Common.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

import type { Theme } from "@mui/material";

// Common interfaces

interface Context {
  Theme: Theme;
  mapsList: MapInf[];
}
type Tag = {
  _id: string;
  Name: string;
  Type: string;
  Default: boolean;
  Description: string;
};

type DiplomacyRelation = {
  name: string;
  status: string;
  id: number;
};

type MilitaryUnit = {
  _id: string;
  id: number;
  a: number;
  cell: number;
  x: number;
  y: number;
  bx: number;
  by: number;
  u: {
    cavalry?: number;
    archers?: number;
    infantry?: number;
    artillery?: number;
  };
  n: number;
  name: string;
  state: number;
  icon: string;
};

export type { Context, Tag, DiplomacyRelation, MilitaryUnit };
