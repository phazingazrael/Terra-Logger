import type { SupportingNPCCategoryId } from "../NPC/population/supportingCategories";

export type MapUploadIssueSeverity = "warning" | "error";

export type MapUploadIssue = {
	severity: MapUploadIssueSeverity;
	phase: string;
	message: string;
	entityType?: string;
	entityId?: string;
	entityName?: string;
	continued: boolean;
};

export type MapUploadGenerationOptions = {
	generateNPCs: boolean;
	downloadLogs: boolean;
	supportingNPCsPerCategory: number;
	supportingCategoryIds: SupportingNPCCategoryId[];
};

export type MapUploadDiagnostics = {
	application: "Terra-Logger";
	startedAt: string;
	completedAt?: string;
	fileName: string;
	mapId?: string;
	mode: "create" | "update";
	status: "running" | "success" | "warning" | "partial" | "failed";
	options: MapUploadGenerationOptions;
	phases: Array<{ name: string; startedAt: string; completedAt?: string; durationMs?: number; records?: number }>;
	counts: Record<string, number>;
	issues: MapUploadIssue[];
	notes: string[];
};

export function createMapUploadDiagnostics(args: {
	fileName: string;
	mode: "create" | "update";
	options: MapUploadGenerationOptions;
}): MapUploadDiagnostics {
	return {
		application: "Terra-Logger",
		startedAt: new Date().toISOString(),
		fileName: args.fileName,
		mode: args.mode,
		status: "running",
		options: args.options,
		phases: [],
		counts: {},
		issues: [],
		notes: [],
	};
}

export function addUploadIssue(diagnostics: MapUploadDiagnostics, issue: MapUploadIssue): void {
	diagnostics.issues.push(issue);
}

export function finishMapUploadDiagnostics(diagnostics: MapUploadDiagnostics): void {
	diagnostics.completedAt = new Date().toISOString();
	const errors = diagnostics.issues.filter((issue) => issue.severity === "error").length;
	const warnings = diagnostics.issues.filter((issue) => issue.severity === "warning").length;
	diagnostics.status = errors > 0 ? "partial" : warnings > 0 ? "warning" : "success";
}

function diagnosticsMarkdown(diagnostics: MapUploadDiagnostics): string {
	const lines = [
		"# Terra-Logger Map Upload Diagnostics",
		"",
		`- File: ${diagnostics.fileName}`,
		`- Mode: ${diagnostics.mode}`,
		`- Status: ${diagnostics.status}`,
		`- Started: ${diagnostics.startedAt}`,
		`- Completed: ${diagnostics.completedAt ?? "Incomplete"}`,
		`- Map ID: ${diagnostics.mapId ?? "Unknown"}`,
		`- Generate NPCs: ${diagnostics.options.generateNPCs ? "Yes" : "No"}`,
		`- Supporting NPCs per category: ${diagnostics.options.supportingNPCsPerCategory}`,
		`- Supporting categories: ${diagnostics.options.supportingCategoryIds.join(", ") || "None"}`,
		"",
		"## Counts",
		"",
		...Object.entries(diagnostics.counts).map(([key, value]) => `- ${key}: ${value}`),
		"",
		"## Issues",
		"",
		...(diagnostics.issues.length === 0
			? ["No warnings or errors were recorded."]
			: diagnostics.issues.map((issue) => `- **${issue.severity.toUpperCase()} — ${issue.phase}:** ${issue.message}${issue.entityName ? ` (${issue.entityName})` : ""} Continued: ${issue.continued ? "Yes" : "No"}`)),
		"",
		"## Notes",
		"",
		...(diagnostics.notes.length === 0 ? ["None."] : diagnostics.notes.map((note) => `- ${note}`)),
	];
	return `${lines.join("\n")}\n`;
}

function downloadBlob(fileName: string, content: string, type: string): void {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = fileName;
	anchor.click();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadMapUploadDiagnostics(diagnostics: MapUploadDiagnostics): void {
	const safeName = diagnostics.fileName.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]+/gi, "-") || "map";
	downloadBlob(`${safeName}-upload-diagnostics.json`, JSON.stringify(diagnostics, null, 2), "application/json");
	downloadBlob(`${safeName}-upload-diagnostics.md`, diagnosticsMarkdown(diagnostics), "text/markdown");
}
