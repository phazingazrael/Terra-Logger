import { atom } from 'recoil';
import Package from '../../package.json';

const appAtom = atom({
  key: 'Application',
  default: {
    id: 'TL_' + Package.version,
    application: {
      name: Package.name,
      version: Package.version,
      afmgVer: '1.95.05',
      supportedLanguages: ['en'],
      defaultLanguage: 'en',
      onboarding: true,
      description: Package.descriptionFull
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
        devicePixelRatio: window.devicePixelRatio
      }
    }
  }
});

export default appAtom;
