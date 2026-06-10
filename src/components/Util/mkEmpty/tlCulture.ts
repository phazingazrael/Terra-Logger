import type { TLCulture } from "../../../definitions/TerraLogger";

export const createEmptyCulture = (): TLCulture => ({
  _id: '',
  base: 0,
  code: '',
  color: '',
  description: '',
  expansionism: 0,
  id: 0,
  name: '',
  origins: [],
  ruralPop: '',
  shield: '',
  tags: [],
  type: '',
  urbanPop: '',
});
