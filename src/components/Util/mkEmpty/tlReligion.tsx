export const createEmptyReligion = (): TLReligion => ({
  _id: '',
  code: '',
  culture: {
    _id: '',
    name: '',
    description: '',
  },
  deity: '',
  description: '',
  form: '',
  i: 0,
  name: '',
  origins: [],
  type: '',
});
