import { atom } from 'recoil';

const localStorageEffect =
  (key: string) =>
  ({ setSelf, onSet }: { setSelf: any; onSet: any }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue: any, _: any, isReset: any) => {
      isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

const localSaveData: string | null = localStorage.getItem('TL_map');
const localSave: TLMapInfo | null = localSaveData ? (JSON.parse(localSaveData) as TLMapInfo) : null;

const createEmptyMap = (): TLMapInfo => {
  return {
    cities: [],
    countries: [],
    cultures: [],
    info: {
      name: '',
      seed: '',
      width: 0,
      height: 0,
      ID: '',
    },
    nameBases: [],
    notes: [],
    npcs: [],
    religions: [],
    settings: {
      mapName: '',
      distanceUnit: '',
      distanceScale: '',
      areaUnit: '',
      heightUnit: '',
      heightExponent: '',
      temperatureScale: '',
      barSize: '',
      barLabel: '',
      barBackOpacity: '',
      barPosX: '',
      barPosY: '',
      populationRate: 0,
      urbanization: '',
      mapSize: '',
      latitude0: '',
      prec: '',
      options: {
        pinNotes: false,
        winds: [],
        temperatureEquator: 0,
        temperatureNorthPole: 0,
        temperatureSouthPole: 0,
        stateLabelsMode: '',
        year: 0,
        era: '',
        eraShort: '',
        militaryTypes: [
          {
            icon: '',
            name: '',
            rural: 0,
            urban: 0,
            crew: 0,
            power: 0,
            type: '',
            separate: 0,
          },
        ],
      },
      hideLabels: 0,
      stylePreset: '',
      rescaleLabels: 0,
      urbanDensity: 0,
    },
    SVG: '',
    svgMod: '',
  };
};

const emptyMap: TLMapInfo = createEmptyMap();
const mapData: TLMapInfo = localSave ?? emptyMap;
const mapAtom = atom({
  key: 'Map',
  default: mapData,
  effects: [localStorageEffect('TL_map')],
});

export default mapAtom;
