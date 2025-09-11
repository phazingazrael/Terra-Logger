import { atom } from "recoil";

import type { AppInfo } from "../definitions/AppInfo";

import Package from "../../package.json";

import { updateDataInStore, getDataFromStore } from "../db/interactions";

let AppData: AppInfo | null = null;

// Set the defaultApp info object
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

// Retrieve the saved data from the database
async function initApp() {
	console.log("getting App info from db");
	const data = await getDataFromStore("appSettings", `TL_${Package.version}`);
	if (!data) {
		updateDataInStore("appSettings", `TL_${Package.version}`, defaultApp);
		AppData = defaultApp;
	} else {
		AppData = data;
	}
}

initApp();

// Set the appAtom
const appAtom = atom<AppInfo>({
	key: "Application",
	default: AppData ?? defaultApp,
});

export default appAtom;
