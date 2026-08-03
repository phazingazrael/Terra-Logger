import type { TLNPC } from "../../definitions/TerraLogger";
import { SUPPORTING_NPC_CATEGORIES } from "../NPC/population/supportingCategories";
import type { MapUploadIssue } from "./diagnostics";

export type ImportSummaryEntry = {
	label: string;
	count: number;
};

export type ImportSummaryIssue = {
	severity: MapUploadIssue["severity"];
	label: string;
	count: number;
	examples: string[];
};

export type MapImportSummary = {
	mapId: string;
	mapName: string;
	imported: ImportSummaryEntry[];
	generatedNPCs: ImportSummaryEntry[];
	issues: ImportSummaryIssue[];
};

const GENERATED_NPC_CATEGORY_ORDER = [
	"Country Leadership & Government",
	"City Leadership",
	"Religious Leadership",
	"Cultural Elders",
	...SUPPORTING_NPC_CATEGORIES.map((category) => category.label),
	"Other Generated NPCs",
];

function normalize(value: unknown): string {
	return String(value ?? "").trim().toLocaleLowerCase();
}

function generatedNPCCategory(npc: TLNPC): string {
	const relationships = npc.relationships ?? [];
	const religionRelationship = relationships.find((relationship) => relationship.relatedEntityType === "religion");
	if (religionRelationship) return "Religious Leadership";

	const cultureRelationship = relationships.find((relationship) => relationship.relatedEntityType === "culture");
	if (cultureRelationship) return "Cultural Elders";

	const countryRelationship = relationships.find((relationship) => relationship.relatedEntityType === "country");
	if (countryRelationship) return "Country Leadership & Government";

	const cityRelationship = relationships.find((relationship) => relationship.relatedEntityType === "city");
	if (cityRelationship) {
		const relationshipType = normalize(cityRelationship.relationshipType);
		if (["leads", "leader", "rules", "ruler"].includes(relationshipType)) {
			return "City Leadership";
		}

		const roleTitle = normalize(cityRelationship.roleTitle);
		const profession = normalize(npc.profession?.name);
		const supportingCategory = SUPPORTING_NPC_CATEGORIES.find((category) =>
			normalize(category.roleTitle) === roleTitle ||
			category.professionNames.some((name) => normalize(name) === profession),
		);
		if (supportingCategory) return supportingCategory.label;
	}

	return "Other Generated NPCs";
}

export function summarizeGeneratedNPCs(npcs: readonly TLNPC[]): ImportSummaryEntry[] {
	const counts = new Map<string, number>();
	for (const npc of npcs) {
		const category = generatedNPCCategory(npc);
		counts.set(category, (counts.get(category) ?? 0) + 1);
	}

	return [...counts.entries()]
		.map(([label, count]) => ({ label, count }))
		.sort((left, right) => {
			const leftOrder = GENERATED_NPC_CATEGORY_ORDER.indexOf(left.label);
			const rightOrder = GENERATED_NPC_CATEGORY_ORDER.indexOf(right.label);
			if (leftOrder !== rightOrder) return leftOrder - rightOrder;
			return left.label.localeCompare(right.label);
		});
}

function normalizedIssueMessage(issue: MapUploadIssue): string {
	return issue.message.trim().replace(/\s+/g, " ");
}

export function summarizeUploadIssues(issues: readonly MapUploadIssue[]): ImportSummaryIssue[] {
	const grouped = new Map<string, ImportSummaryIssue>();

	for (const issue of issues) {
		const label = normalizedIssueMessage(issue);
		const key = `${issue.severity}:${issue.phase}:${issue.entityType ?? ""}:${label.toLocaleLowerCase()}`;
		const current = grouped.get(key);
		if (current) {
			current.count += 1;
			if (issue.entityName && current.examples.length < 3 && !current.examples.includes(issue.entityName)) {
				current.examples.push(issue.entityName);
			}
			continue;
		}

		grouped.set(key, {
			severity: issue.severity,
			label,
			count: 1,
			examples: issue.entityName ? [issue.entityName] : [],
		});
	}

	return [...grouped.values()].sort((left, right) => {
		if (left.severity !== right.severity) return left.severity === "error" ? -1 : 1;
		if (left.count !== right.count) return right.count - left.count;
		return left.label.localeCompare(right.label);
	});
}
