import type { GeneratorRecord } from "../../db/generators";
import { createCatalogSectionDefinition } from "./sectionFactory";
import type {
	GeneratorCatalogSectionDefinition,
	GeneratorCatalogTypeDefinition,
	GeneratorCatalogValidationIssue,
} from "./types";

const NPC_GENERATOR_TYPE = "npc";

function userExample(
	id: string,
	fields: Record<string, unknown>,
): GeneratorRecord {
	return {
		id: `user:${id}`,
		source: "user",
		version: 1,
		enabled: true,
		...fields,
	};
}

function npcPath(path: string): {
	templatePath: string;
	referencePath: string;
} {
	return {
		templatePath: `templates/npc/${path}`,
		referencePath: `reference/npc/${path}`,
	};
}

function appearanceSection(
	slug: string,
	label: string,
	exampleValue: string,
): GeneratorCatalogSectionDefinition {
	const id = `npc.appearance.${slug}`;
	return createCatalogSectionDefinition({
		id,
		generatorType: NPC_GENERATOR_TYPE,
		label: `Appearance — ${label}`,
		store: "generationTables",
		...npcPath(`appearance/${slug}.json`),
		exampleRecord: userExample(`appearance.${slug}.example`, {
			table: id,
			value: exampleValue,
			weight: 1,
		}),
		recordMatches: (record) => record.table === id,
		validateRecord: validateAppearanceRecord,
	});
}

function validateProfessionRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	for (const field of ["name", "description"] as const) {
		if (typeof record[field] !== "string") {
			issues.push({
				code: `invalid-profession-${field}`,
				path: `records[${index}].${field}`,
				message: `Profession ${field} must be a string.`,
				severity: "error",
			});
		}
	}
	return issues;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

const STABLE_REFERENCE_ID = /^(default|user):[a-z0-9][a-z0-9._-]*$/;

function validateStringArray(
	value: unknown,
	path: string,
	label: string,
	options: { required?: boolean; stableIds?: boolean } = {},
): GeneratorCatalogValidationIssue[] {
	if (!Array.isArray(value)) {
		return options.required
			? [
					{
						code: "invalid-string-array",
						path,
						message: `${label} must be an array of strings.`,
						severity: "error",
					},
				]
			: [];
	}
	const issues: GeneratorCatalogValidationIssue[] = [];
	value.forEach((entry, index) => {
		if (
			typeof entry !== "string" ||
			!entry.trim() ||
			(options.stableIds && !STABLE_REFERENCE_ID.test(entry))
		) {
			issues.push({
				code: options.stableIds
					? "invalid-stable-reference"
					: "invalid-string-array-value",
				path: `${path}[${index}]`,
				message: options.stableIds
					? `${label} entries must be stable default: or user: IDs.`
					: `${label} entries must be non-empty strings.`,
				severity: "error",
			});
		}
	});
	return issues;
}

function validateGenderRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	const path = `records[${index}]`;
	for (const field of ["name", "description"] as const) {
		if (typeof record[field] !== "string" || !record[field].trim()) {
			issues.push({
				code: `invalid-gender-${field}`,
				path: `${path}.${field}`,
				message: `Gender ${field} must be a non-empty string.`,
				severity: "error",
			});
		}
	}
	if (!["real-world", "fantasy"].includes(String(record.catalog))) {
		issues.push({
			code: "invalid-gender-catalog",
			path: `${path}.catalog`,
			message: "Gender catalog must be real-world or fantasy.",
			severity: "error",
		});
	}
	if (
		!["masculine", "feminine", "mixed", "neutral", "custom"].includes(
			String(record.namePoolStrategy),
		)
	) {
		issues.push({
			code: "invalid-gender-name-pool-strategy",
			path: `${path}.namePoolStrategy`,
			message:
				"Name-pool strategy must be masculine, feminine, mixed, neutral, or custom.",
			severity: "error",
		});
	}
	if (
		typeof record.generationWeight !== "number" ||
		!Number.isFinite(record.generationWeight) ||
		record.generationWeight < 0
	) {
		issues.push({
			code: "invalid-gender-weight",
			path: `${path}.generationWeight`,
			message: "Gender generationWeight must be a non-negative number.",
			severity: "error",
		});
	}
	issues.push(
		...validateStringArray(
			record.defaultPronouns,
			`${path}.defaultPronouns`,
			"Default pronouns",
		),
		...validateStringArray(
			record.applicableAncestryIds,
			`${path}.applicableAncestryIds`,
			"Applicable ancestry IDs",
			{ stableIds: true },
		),
		...validateStringArray(
			record.customNamePoolIds,
			`${path}.customNamePoolIds`,
			"Custom name-pool IDs",
			{ stableIds: true },
		),
	);
	if (
		record.namePoolStrategy === "custom" &&
		(!Array.isArray(record.customNamePoolIds) ||
			record.customNamePoolIds.length === 0)
	) {
		issues.push({
			code: "missing-custom-name-pools",
			path: `${path}.customNamePoolIds`,
			message: "Custom name-pool strategy requires at least one name-pool ID.",
			severity: "error",
		});
	}
	if (
		record.catalog === "fantasy" &&
		(!Array.isArray(record.applicableAncestryIds) ||
			record.applicableAncestryIds.length === 0)
	) {
		issues.push({
			code: "missing-fantasy-gender-ancestries",
			path: `${path}.applicableAncestryIds`,
			message: "Fantasy genders require at least one applicable ancestry ID.",
			severity: "error",
		});
	}
	return issues;
}

function validateAncestryRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	const path = `records[${index}]`;
	for (const forbidden of ["inspiration", "system", "originalName"] as const) {
		if (record[forbidden] !== undefined) {
			issues.push({
				code: "forbidden-ancestry-metadata",
				path: `${path}.${forbidden}`,
				message: `${forbidden} is not runtime ancestry data and must be omitted.`,
				severity: "error",
			});
		}
	}
	for (const field of ["name", "description"] as const) {
		if (typeof record[field] !== "string" || !record[field].trim()) {
			issues.push({
				code: `invalid-ancestry-${field}`,
				path: `${path}.${field}`,
				message: `Race ${field} must be a non-empty string.`,
				severity: "error",
			});
		}
	}
	if (!["common", "uncommon", "rare"].includes(String(record.rarity))) {
		issues.push({
			code: "invalid-ancestry-rarity",
			path: `${path}.rarity`,
			message: "Race rarity must be common, uncommon, or rare.",
			severity: "error",
		});
	}
	if (
		typeof record.weight !== "number" ||
		!Number.isFinite(record.weight) ||
		record.weight < 0
	) {
		issues.push({
			code: "invalid-ancestry-weight",
			path: `${path}.weight`,
			message: "Race weight must be a non-negative number.",
			severity: "error",
		});
	}
	issues.push(
		...validateStringArray(
			record.namePoolIds,
			`${path}.namePoolIds`,
			"Name-pool IDs",
			{ required: true, stableIds: true },
		),
		...validateStringArray(
			record.appearanceTableIds,
			`${path}.appearanceTableIds`,
			"Appearance-table IDs",
			{ required: true },
		),
		...validateStringArray(
			record.allowedGenderIds,
			`${path}.allowedGenderIds`,
			"Allowed gender IDs",
			{ stableIds: true },
		),
		...validateStringArray(
			record.fantasyGenderIds,
			`${path}.fantasyGenderIds`,
			"Fantasy gender IDs",
			{ stableIds: true },
		),
	);
	return issues;
}

function validateNamePoolRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	const path = `records[${index}]`;
	for (const field of ["name", "description"] as const) {
		if (typeof record[field] !== "string" || !record[field].trim()) {
			issues.push({
				code: `invalid-name-pool-${field}`,
				path: `${path}.${field}`,
				message: `Name pool ${field} must be a non-empty string.`,
				severity: "error",
			});
		}
	}
	issues.push(
		...validateStringArray(
			record.ancestryIds,
			`${path}.ancestryIds`,
			"Race IDs",
			{ required: true, stableIds: true },
		),
	);
	const nameFields = [
		"masculineGivenNames",
		"feminineGivenNames",
		"neutralGivenNames",
		"familyNames",
		"nicknames",
	] as const;
	for (const field of nameFields) {
		issues.push(
			...validateStringArray(record[field], `${path}.${field}`, field, {
				required: true,
			}),
		);
	}
	if (
		nameFields.every(
			(field) => Array.isArray(record[field]) && record[field].length === 0,
		)
	) {
		issues.push({
			code: "empty-name-pool",
			path,
			message: "A name pool must contain at least one name.",
			severity: "error",
		});
	}
	return issues;
}

function validateAppearanceRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	const path = `records[${index}]`;
	if (typeof record.value !== "string" || !record.value.trim()) {
		issues.push({
			code: "invalid-appearance-value",
			path: `${path}.value`,
			message: "Appearance value must be a non-empty string.",
			severity: "error",
		});
	}
	if (
		typeof record.weight !== "number" ||
		!Number.isFinite(record.weight) ||
		record.weight < 0
	) {
		issues.push({
			code: "invalid-appearance-weight",
			path: `${path}.weight`,
			message: "Appearance weight must be a non-negative number.",
			severity: "error",
		});
	}
	return issues;
}

function validateAncestryAppearanceRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const path = `records[${index}]`;
	return [
		...validateStringArray(
			record.ancestryIds,
			`${path}.ancestryIds`,
			"Race IDs",
			{ required: true, stableIds: true },
		),
		...validateStringArray(
			record.values,
			`${path}.values`,
			"Appearance values",
			{
				required: true,
			},
		),
	];
}

function validateGovernmentRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	const recordPath = `records[${index}]`;
	for (const field of ["category", "name", "descriptionHtml"] as const) {
		if (typeof record[field] !== "string" || !record[field].trim()) {
			issues.push({
				code: `invalid-government-${field}`,
				path: `${recordPath}.${field}`,
				message: `Government ${field} must be a non-empty string.`,
				severity: "error",
			});
		}
	}

	if (
		!isObject(record.presentation) ||
		typeof record.presentation.color !== "string" ||
		typeof record.presentation.iconKey !== "string"
	) {
		issues.push({
			code: "invalid-government-presentation",
			path: `${recordPath}.presentation`,
			message: "Government presentation requires string color and iconKey.",
			severity: "error",
		});
	}

	if (
		!isObject(record.leadership) ||
		!Array.isArray(record.leadership.roles) ||
		record.leadership.roles.length === 0
	) {
		issues.push({
			code: "invalid-government-leadership",
			path: `${recordPath}.leadership.roles`,
			message: "Government leadership requires at least one structured role.",
			severity: "error",
		});
		return issues;
	}

	const roleIds = new Set<string>();
	record.leadership.roles.forEach((role, roleIndex) => {
		const rolePath = `${recordPath}.leadership.roles[${roleIndex}]`;
		if (!isObject(role)) {
			issues.push({
				code: "invalid-government-role",
				path: rolePath,
				message: "Each government role must be an object.",
				severity: "error",
			});
			return;
		}
		if (
			typeof role.id !== "string" ||
			!role.id.startsWith(`${record.source}:`)
		) {
			issues.push({
				code: "invalid-government-role-id",
				path: `${rolePath}.id`,
				message: `Role IDs must use the owning record's "${record.source}:" prefix.`,
				severity: "error",
			});
		} else if (roleIds.has(role.id)) {
			issues.push({
				code: "duplicate-government-role-id",
				path: `${rolePath}.id`,
				message: `Duplicate government role ID "${role.id}".`,
				severity: "error",
			});
		} else {
			roleIds.add(role.id);
		}
		for (const field of ["title", "description"] as const) {
			if (typeof role[field] !== "string" || !role[field].trim()) {
				issues.push({
					code: `invalid-government-role-${field}`,
					path: `${rolePath}.${field}`,
					message: `Government role ${field} must be a non-empty string.`,
					severity: "error",
				});
			}
		}
		if (
			!["leader", "advisor", "official"].includes(String(role.classification))
		) {
			issues.push({
				code: "invalid-government-role-classification",
				path: `${rolePath}.classification`,
				message: "Role classification must be leader, advisor, or official.",
				severity: "error",
			});
		}

		const count = role.count;
		if (!isObject(count)) {
			issues.push({
				code: "invalid-government-role-count",
				path: `${rolePath}.count`,
				message: "Government roles require a structured count rule.",
				severity: "error",
			});
			return;
		}
		if (
			count.mode === "fixed" &&
			(typeof count.value !== "number" ||
				!Number.isInteger(count.value) ||
				count.value < 0)
		) {
			issues.push({
				code: "invalid-fixed-role-count",
				path: `${rolePath}.count.value`,
				message: "Fixed role count must be a non-negative integer.",
				severity: "error",
			});
		} else if (
			count.mode === "random-range" &&
			(typeof count.minimum !== "number" ||
				typeof count.maximum !== "number" ||
				!Number.isInteger(count.minimum) ||
				!Number.isInteger(count.maximum) ||
				count.minimum < 0 ||
				count.maximum < count.minimum)
		) {
			issues.push({
				code: "invalid-random-role-count",
				path: `${rolePath}.count`,
				message:
					"Random role count requires non-negative integer minimum and maximum values with maximum at least minimum.",
				severity: "error",
			});
		} else if (
			count.mode === "per-related-entity" &&
			count.entityType !== "country" &&
			count.entityType !== "city"
		) {
			issues.push({
				code: "invalid-related-entity-role-count",
				path: `${rolePath}.count.entityType`,
				message: "Related-entity count must target country or city.",
				severity: "error",
			});
		} else if (
			count.mode !== "fixed" &&
			count.mode !== "random-range" &&
			count.mode !== "per-related-entity"
		) {
			issues.push({
				code: "invalid-government-role-count-mode",
				path: `${rolePath}.count.mode`,
				message:
					"Role count mode must be fixed, random-range, or per-related-entity.",
				severity: "error",
			});
		}
	});
	return issues;
}

function validateNPCProfileValueRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues: GeneratorCatalogValidationIssue[] = [];
	const path = `records[${index}]`;
	if (typeof record.value !== "string" || !record.value.trim()) {
		issues.push({
			code: "invalid-profile-value",
			path: `${path}.value`,
			message: "Profile generation value must be a non-empty string.",
			severity: "error",
		});
	}
	if (typeof record.weight !== "number" || !Number.isFinite(record.weight) || record.weight < 0) {
		issues.push({
			code: "invalid-profile-weight",
			path: `${path}.weight`,
			message: "Profile generation weight must be a non-negative number.",
			severity: "error",
		});
	}
	issues.push(...validateStringArray(record.ancestryIds, `${path}.ancestryIds`, "Ancestry IDs", { stableIds: true }));
	return issues;
}

function validateNPCAgeRangeRecord(
	record: GeneratorRecord,
	index: number,
): GeneratorCatalogValidationIssue[] {
	const issues = validateStringArray(
		record.ancestryIds,
		`records[${index}].ancestryIds`,
		"Ancestry IDs",
		{ required: true, stableIds: true },
	);
	for (const field of ["minimumAge", "maximumAge", "weight"] as const) {
		if (typeof record[field] !== "number" || !Number.isFinite(record[field]) || Number(record[field]) < 0) {
			issues.push({
				code: `invalid-age-range-${field}`,
				path: `records[${index}].${field}`,
				message: `${field} must be a non-negative number.`,
				severity: "error",
			});
		}
	}
	if (typeof record.minimumAge === "number" && typeof record.maximumAge === "number" && record.maximumAge < record.minimumAge) {
		issues.push({
			code: "invalid-age-range-order",
			path: `records[${index}].maximumAge`,
			message: "maximumAge must be greater than or equal to minimumAge.",
			severity: "error",
		});
	}
	return issues;
}

function profileSection(
	field: string,
	label: string,
	exampleValue: string,
): GeneratorCatalogSectionDefinition {
	const id = `npc.profile.${field}`;
	return createCatalogSectionDefinition({
		id,
		generatorType: NPC_GENERATOR_TYPE,
		label: `Profile — ${label}`,
		store: "generationTables",
		...npcPath(`profile/${field}.json`),
		exampleRecord: userExample(`profile.${field}.example`, {
			table: id,
			field,
			value: exampleValue,
			weight: 1,
		}),
		recordMatches: (record) => record.table === id,
		validateRecord: validateNPCProfileValueRecord,
	});
}

export const npcCatalogSections = [
	createCatalogSectionDefinition({
		id: "npc.ancestries",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Ancestries",
		store: "ancestries",
		...npcPath("ancestries.json"),
		exampleRecord: userExample("ancestry.example", {
			name: "Example Race",
			description: "Describe this ancestry.",
			rarity: "uncommon",
			weight: 1,
			namePoolIds: ["user:name-pool.example"],
			appearanceTableIds: ["npc.appearance.ancestry-specific"],
			fantasyGenderIds: ["user:gender.fantasy.example"],
		}),
		validateRecord: validateAncestryRecord,
	}),
	createCatalogSectionDefinition({
		id: "npc.genders.real-world",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Real-World Genders",
		store: "genders",
		...npcPath("genders.real-world.json"),
		exampleRecord: userExample("gender.real-world.example", {
			catalog: "real-world",
			name: "Example Gender",
			description: "Provide a full display description.",
			defaultPronouns: ["they", "them", "theirs"],
			namePoolStrategy: "neutral",
			generationWeight: 1,
		}),
		recordMatches: (record) => record.catalog === "real-world",
		validateRecord: validateGenderRecord,
	}),
	createCatalogSectionDefinition({
		id: "npc.genders.fantasy",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Fantasy Genders",
		store: "genders",
		...npcPath("genders.fantasy.json"),
		exampleRecord: userExample("gender.fantasy.example", {
			catalog: "fantasy",
			name: "Example Fantasy Gender",
			description: "Provide a full display description.",
			defaultPronouns: ["they", "them", "theirs"],
			applicableAncestryIds: ["user:ancestry.example"],
			namePoolStrategy: "mixed",
			generationWeight: 1,
		}),
		recordMatches: (record) => record.catalog === "fantasy",
		validateRecord: validateGenderRecord,
	}),
	createCatalogSectionDefinition({
		id: "npc.professions.general",
		generatorType: NPC_GENERATOR_TYPE,
		label: "General Professions",
		store: "professions",
		...npcPath("professions.general.json"),
		exampleRecord: userExample("profession.example", {
			catalog: "general",
			category: "general",
			name: "Example Profession",
			description: "Describe this profession.",
		}),
		recordMatches: (record) => record.catalog === "general",
		validateRecord: validateProfessionRecord,
	}),
	createCatalogSectionDefinition({
		id: "npc.professions.government",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Government Professions",
		store: "professions",
		...npcPath("professions.government.json"),
		exampleRecord: userExample("profession.government.example", {
			catalog: "government",
			category: "government",
			name: "Example Government Profession",
			description: "Describe this government profession.",
			governmentCategory: "Example Category",
			governmentDefinitionId: "user:government.example",
			governmentRoleId: "user:government-role.example",
		}),
		recordMatches: (record) => record.catalog === "government",
		validateRecord: validateProfessionRecord,
	}),
	createCatalogSectionDefinition({
		id: "npc.governments",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Government Definitions",
		store: "governmentDefinitions",
		...npcPath("governments.json"),
		exampleRecord: userExample("government.example", {
			category: "Example Category",
			name: "Example Government",
			presentation: {
				color: "#607d8b",
				iconKey: "AccountBalance",
			},
			descriptionHtml: "<p>Describe this government.</p>",
			leadership: {
				roles: [
					{
						id: "user:government-role.example",
						title: "Example Leader",
						description: "Describe this leadership role.",
						classification: "leader",
						primary: true,
						count: { mode: "fixed", value: 1 },
					},
				],
			},
		}),
		validateRecord: validateGovernmentRecord,
	}),
	createCatalogSectionDefinition({
		id: "npc.name-pools",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Name Pools",
		store: "namePools",
		...npcPath("names/name-pools.json"),
		exampleRecord: userExample("name-pool.example", {
			name: "Example Name Pool",
			description: "Describe the naming tradition represented by this pool.",
			ancestryIds: ["user:ancestry.example"],
			masculineGivenNames: ["Example"],
			feminineGivenNames: ["Examplea"],
			neutralGivenNames: ["Ex"],
			familyNames: ["Name"],
			nicknames: [],
		}),
		validateRecord: validateNamePoolRecord,
	}),
	appearanceSection("activities", "Activities", "Reading"),
	appearanceSection("builds", "Builds", "Athletic"),
	appearanceSection("complexions", "Complexions", "Clear"),
	appearanceSection("demeanors", "Demeanors", "Friendly"),
	appearanceSection("descriptors", "Descriptors", "Observant"),
	appearanceSection("eye-colors", "Eye Colors", "Brown"),
	appearanceSection("eye-shapes", "Eye Shapes", "Almond-shaped"),
	appearanceSection("facial-hair", "Facial Hair", "Short beard"),
	appearanceSection("hair-colors", "Hair Colors", "Black"),
	appearanceSection("hair-styles", "Hair Styles", "Shoulder-length"),
	appearanceSection("heights", "Heights", "Average height"),
	appearanceSection("skin-tones", "Skin Tones", "Warm brown"),
	createCatalogSectionDefinition({
		id: "npc.profile.age-ranges",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Profile — Age Ranges",
		store: "generationTables",
		...npcPath("profile/age-ranges.json"),
		exampleRecord: userExample("profile.age-range.example", {
			table: "npc.profile.age-ranges",
			ancestryIds: ["user:ancestry.example"],
			minimumAge: 18,
			maximumAge: 80,
			weight: 1,
		}),
		recordMatches: (record) => record.table === "npc.profile.age-ranges",
		validateRecord: validateNPCAgeRangeRecord,
	}),
	profileSection("nickname", "Nicknames", "the Steady"),
	profileSection("heritage", "Heritages", "Lowland Human"),
	profileSection("sexuality", "Sexualities", "Bisexual"),
	profileSection("alignment", "Alignments", "Neutral Good"),
	profileSection("condition", "Conditions", "Healthy"),
	profileSection("background", "Backgrounds", "{name} learned the work of a {profession} from a local mentor."),
	profileSection("aspirationsMotivations", "Aspirations & Motivations", "Wants to become a respected {profession}."),
	profileSection("publicPerception", "Public Perceptions", "Known as a competent {profession}."),
	profileSection("hiddenDetails", "Hidden Details", "Secretly owes a dangerous favor."),
	createCatalogSectionDefinition({
		id: "npc.appearance.ancestry-specific",
		generatorType: NPC_GENERATOR_TYPE,
		label: "Race-Specific Appearance",
		store: "generationTables",
		...npcPath("appearance/ancestry-specific.json"),
		exampleRecord: userExample("appearance.ancestry-specific.example", {
			table: "npc.appearance.ancestry-specific",
			ancestryIds: ["user:ancestry.example"],
			values: ["Example ancestry feature"],
		}),
		recordMatches: (record) =>
			record.table === "npc.appearance.ancestry-specific",
		validateRecord: validateAncestryAppearanceRecord,
	}),
] as const satisfies readonly GeneratorCatalogSectionDefinition[];

export const npcCatalogTypeDefinition: GeneratorCatalogTypeDefinition = {
	id: NPC_GENERATOR_TYPE,
	label: "NPC",
	sections: npcCatalogSections,
};
