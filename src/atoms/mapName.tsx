import { atom } from 'recoil';

const mapNameAtom = atom({
  key: 'MapName',
  default: '',  // default value (aka initial value)
});

export default mapNameAtom;
