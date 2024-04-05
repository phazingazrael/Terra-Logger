import { atom } from 'recoil';
import Package from '../../package.json';

const localStorageEffect =
  (key: string) =>
  ({ setSelf, onSet }) => {
    const savedValue = localStorage.getItem(key);
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
      isReset ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(newValue));
    });
  };

 // Retrieve the saved data from local storage and parse it as an App object
  const localSaveData: string | null = localStorage.getItem('TL_app');
  const localSave: AppInfo | null = localSaveData ? JSON.parse(localSaveData) as AppInfo : null;

  const defaultApp: AppInfo = {
    id: 'TL_' + Package.version,
    application: {
      name: Package.name,
      version: Package.version,
      afmgVer: '1.97.05',
      supportedLanguages: ['en'],
      defaultLanguage: 'en',
      onboarding: true,
      description: Package.descriptionFull,
    },
    userSettings: {
      theme: 'light',
      language: 'en',
      showWelcomeMessage: true,
      fontSize: 'medium',
      exportOption: '',
      screen: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
    },
  }

  const appData: AppInfo = localSave ?? defaultApp;
const appAtom = atom({
  key: 'Application',
  default: appData,
  effects: [localStorageEffect('TL_app')],
});

export default appAtom;
