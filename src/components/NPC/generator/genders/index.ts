export {
	getActiveGenderDefinition,
	listActiveGenderDefinitions,
	refreshGenderCatalog,
} from "./catalog";
export {
	fantasyGenderDefaults,
	npcGenderDefaultBundles,
	realWorldGenderDefaults,
} from "./defaults";
export {
	getGenderDefinition,
	isGenderDefinition,
	listGenderDefinitions,
} from "./repository";
export type {
	GenderCatalog,
	GenderDefinition,
	GenderDefinitionQuery,
	GenderNamePoolStrategy,
} from "../../types";
