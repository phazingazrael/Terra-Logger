import type { TLCulture } from "../../../definitions/TerraLogger";

export const createEmptyCulture = (): TLCulture => ({
  urbanPop: '',
  ruralPop: '',
  tags: [],
  name: '',
  base: 0,
  shield: '',
  id: 0,
  color: '',
  type: '',
  expansionism: 0,
  origins: [],
  code: '',
  _id: '',
});
