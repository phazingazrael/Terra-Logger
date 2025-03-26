import { atom } from 'recoil';

const loadingAtom = atom({
  key: 'Loading',
  default: false,  // default value (aka initial value)
});

export default loadingAtom;
