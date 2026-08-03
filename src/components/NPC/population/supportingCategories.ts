export type SupportingNPCCategoryId =
	| "merchants"
	| "inn"
	| "guards"
	| "military"
	| "healers"
	| "artisans"
	| "laborers"
	| "farmers"
	| "scholars"
	| "couriers"
	| "sailors"
	| "religious-attendants";

export type SupportingNPCCategory = {
	id: SupportingNPCCategoryId;
	label: string;
	roleTitle: string;
	professionNames: readonly string[];
	relationshipType: string;
	enabledByDefault: boolean;
};

export const SUPPORTING_NPC_CATEGORIES: readonly SupportingNPCCategory[] = [
	{ id: "merchants", label: "Merchants", roleTitle: "Merchant", professionNames: ["Merchant", "Trader", "Shopkeeper"], relationshipType: "works-in", enabledByDefault: true },
	{ id: "inn", label: "Inn NPCs", roleTitle: "Innkeeper", professionNames: ["Innkeeper", "Tavern Keeper", "Cook", "Server"], relationshipType: "works-in", enabledByDefault: true },
	{ id: "guards", label: "Guards", roleTitle: "Guard", professionNames: ["Guard", "Watchman", "Watch Officer"], relationshipType: "protects", enabledByDefault: true },
	{ id: "military", label: "Military NPCs", roleTitle: "Soldier", professionNames: ["Soldier", "Officer", "Scout"], relationshipType: "stationed-in", enabledByDefault: true },
	{ id: "healers", label: "Healers", roleTitle: "Healer", professionNames: ["Healer", "Physician", "Apothecary"], relationshipType: "works-in", enabledByDefault: false },
	{ id: "artisans", label: "Artisans", roleTitle: "Artisan", professionNames: ["Artisan", "Blacksmith", "Carpenter", "Mason", "Tailor"], relationshipType: "works-in", enabledByDefault: false },
	{ id: "laborers", label: "Laborers", roleTitle: "Laborer", professionNames: ["Laborer", "Dockworker", "Porter", "Teamster"], relationshipType: "works-in", enabledByDefault: false },
	{ id: "farmers", label: "Farmers", roleTitle: "Farmer", professionNames: ["Farmer", "Fisher", "Hunter", "Miller"], relationshipType: "supplies", enabledByDefault: false },
	{ id: "scholars", label: "Scholars", roleTitle: "Scholar", professionNames: ["Scholar", "Teacher", "Librarian", "Historian"], relationshipType: "works-in", enabledByDefault: false },
	{ id: "couriers", label: "Couriers", roleTitle: "Courier", professionNames: ["Courier", "Messenger"], relationshipType: "serves", enabledByDefault: false },
	{ id: "sailors", label: "Sailors", roleTitle: "Sailor", professionNames: ["Sailor", "Dockworker", "Harbor Worker"], relationshipType: "works-in", enabledByDefault: false },
	{ id: "religious-attendants", label: "Religious Attendants", roleTitle: "Religious Attendant", professionNames: ["Acolyte", "Shrine Keeper", "Cleric"], relationshipType: "serves", enabledByDefault: false },
];

export const DEFAULT_SUPPORTING_NPC_CATEGORY_IDS = SUPPORTING_NPC_CATEGORIES.reduce<SupportingNPCCategoryId[]>(
	(ids, category) => {
		if (category.enabledByDefault) ids.push(category.id);
		return ids;
	},
	[],
);

export function getSupportingNPCCategory(id: SupportingNPCCategoryId): SupportingNPCCategory | undefined {
	return SUPPORTING_NPC_CATEGORIES.find((category) => category.id === id);
}
