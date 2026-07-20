import type { TLReligion } from '../../../definitions/TerraLogger';
export const createEmptyReligion = (): TLReligion => ({
  _id: '',
  aliases: [],
  center: {
    _id: '',
    i: 0,
    name: '',
  },
  code: '',
  culture: {
    _id: '',
    id: '',
  },
  deities: [],
  deity: '',
  description: '',
  domains: [],
  form: '',
  headquarters: "",
  i: 0,
  members: {
    rural: 0,
    urban: 0,
  },
  name: '',
  origins: [],
  symbols: [],
  tags: [],
  theme: "",
  type: '',
});
