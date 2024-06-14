import { atom } from 'recoil';

const mapLoadedAtom = atom({
  key: 'MapLoaded',
  default: false,  // default value (aka initial value)
});

export default mapLoadedAtom;
