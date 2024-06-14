import { atom } from 'recoil';
import { getFullStore } from '../db/interactions';

const mapsListAtom = atom({
  key: 'MapsList',
  default: async () => {
    const mapsData = await getFullStore('maps');
    return mapsData || [];
  },
});

export default mapsListAtom;
