import { atom } from "jotai";
import Package from "../../package.json";
import { getDataFromStore } from "../db/interactions";

// Retrieve the saved data from local storage and parse it as an App object

/**
 * Retrieves the locally saved application data from storage.
 *
 * @param {string} storeName - The name of the store to retrieve data from.
 * @param {string} key - The key of the data to retrieve.
 * @returns {object | null} The retrieved data, or null if no data is found.
 */
const localSaveData: object | null = getDataFromStore(
	"appSettings",
	`TL_${Package.version}`,
);

const localSave: AppInfo | null = localSaveData
	? (localSaveData as AppInfo)
	: null;

const defaultApp: AppInfo = {
	id: `TL_${Package.version}`,
	application: {
		name: Package.name,
		version: Package.version,
		afmgVer: "1.105.15",
		supportedLanguages: ["en"],
		defaultLanguage: "en",
		onboarding: true,
		description: Package.descriptionFull,
	},
	userSettings: {
		theme: "light",
		language: "en",
		showWelcomeMessage: true,
		fontSize: "medium",
		exportOption: "",
		screen: {
			innerWidth: window.innerWidth,
			innerHeight: window.innerHeight,
			outerWidth: window.outerWidth,
			outerHeight: window.outerHeight,
			devicePixelRatio: window.devicePixelRatio,
		},
	},
};

const appData: AppInfo = localSave ?? defaultApp;

export const appAtom = atom(appData);

export default appAtom;
