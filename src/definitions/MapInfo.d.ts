export interface MapInfo {
  cities: City[];
  countries: Country[];
  cultures: Culture[];
  info: MapInfoData;
  nameBases: NameBase[];
  notes: Notes[];
  npcs: NPC[];
  religions: Religion[];
  settings: Settings;
  SVG: string;
  svgMod: string;
}

type MapInfoData = {
  name: string;
  seed: string;
};

type Settings = {
  mapName: string;
  distanceUnit: string;
  distanceScale: string;
  areaUnit: string;
  heightUnit: string;
  heightExponent: string;
  temperatureScale: string;
  barSize: string;
  barLabel: string;
  barBackOpacity: string;
  barBackColor: string;
  barPosX: string;
  barPosY: string;
  populationRate: string;
  urbanization: string;
  mapSize: string;
  latitude0: string;
  prec: string;
  options: {
    pinNotes: boolean;
    showMFCGMap: boolean;
    winds: Array<number>;
    temperatureEquator: number;
    temperatureNorthPole: number;
    temperatureSouthPole: number;
    stateLabelsMode: string;
    year: number;
    era: string;
    eraShort: string;
    military: Array<MilitaryItem>;
  };
  hideLabels: number;
  stylePreset: string;
  rescaleLabels: number;
  urbanDensity: number;
};

type City = {
  name: string;
  // Additional city properties
};

type Country = {
  name: string;
  // Additional country properties
};

type Culture = {
  name: string;
  // Additional culture properties
};

type NameBase = {
  name: string;
  // Additional name base properties
};

type Note = {
  text: string;
  // Additional note properties
};

type Npc = {
  name: string;
  // Additional NPC properties
};

type Religion = {
  name: string;
  // Additional religion properties
};

type MilitaryItem = {
  icon: string;
  name: string;
  rural: number;
  urban: number;
  crew: number;
  power: number;
  type: string;
  separate: number;
};

type ApplicationDetails = {
  name: string;
  version: string;
  afmgVersion: string;
  supportedLanguages: string[];
  defaultLanguage: string;
  onboarding: boolean;
};

type UserSettingsDetails = {
  theme: string;
  language: string;
  showWelcomeMessage: boolean;
  fontSize: string;
  exportOption: string;
  screenDetails: ScreenDetails;
};

type ScreenDetails = {
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  devicePixelRatio: number;
};

type Tag = {
  name: string;
  // Additional tag properties
};
