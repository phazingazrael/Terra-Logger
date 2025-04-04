import { atom } from "recoil";
import Package from "../../package.json";
import { updateDataInStore, getDataFromStore } from "../db/interactions";

let LocalSaveData: AppInfo | null = null;
// Retrieve the saved data from the database
async function initApp() {
	await getDataFromStore("appSettings", `TL_${Package.version}`).then(
		(data) => {
			LocalSaveData = data;
		},
	);
}

initApp();

// Set the localSaveData to null if it is undefined
const localSave: AppInfo | null = LocalSaveData ?? null;

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

// Set the appData object
const appData: AppInfo = localSave ?? defaultApp;

// Add the appData object to the database if it is null
if (localSave === null) {
	updateDataInStore("appSettings", `TL_${Package.version}`, appData);
}

// Set the appAtom
export const appAtom = atom<AppInfo>({
	key: "Application",
	default: appData,
});

// Export the appAtom
export default appAtom;
