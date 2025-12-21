// src/definitions/AppInfo.ts //
/* eslint-disable @typescript-eslint/no-unused-vars */
// visual effects only for eslint-disable //

export type dataDisplay = "default" | "minimal" | "recommended" | (string & {});

// Application Information Interface
export interface AppInfo {
  id: string;
  application: {
    name: string;
    version: string;
    afmgVer: string;
    supportedLanguages: string[];
    defaultLanguage: string;
    onboarding: boolean;
    description: string;
  };
  userSettings: {
    dataDisplay: dataDisplay;
    theme: string;
    language: string;
    showWelcomeMessage: boolean;
    fontSize: string;
    exportOption: string;
    screen: {
      innerWidth: number;
      innerHeight: number;
      outerWidth: number;
      outerHeight: number;
      devicePixelRatio: number;
    };
  };
  activeMapId: string | null;
  forceMobile: boolean;
}
