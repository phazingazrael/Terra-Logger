import type { TLReligion } from '../../../definitions/TerraLogger';
export const createEmptyReligion = (): TLReligion => ({
  _id: '',
  code: '',
  culture: {
    _id: '',
    id: '',
  },
  deity: '',
  description: '',
  form: '',
  i: 0,
  members: {
    rural: 0,
    urban: 0,
  },
  name: '',
  origins: [],
  type: '',
});
