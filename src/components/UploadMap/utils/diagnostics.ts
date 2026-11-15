import { errorDetails, type ErrorDetails } from "../../Util/errorDetails";
import type { SupportingNPCCategoryId } from "../../NPC/population/supportingCategories";

export type MapUploadIssueSeverity = "warning" | "error";

export type MapUploadIssue = {
	severity: MapUploadIssueSeverity;
	phase: string;
	message: string;
	entityType?: string;
	entityId?: string;
	entityName?: string;
	continued: boolean;
	error?: ErrorDetails;
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
	committed?: boolean;
	fileSize?: number;
	version?: string;
	context?: string;
	phases: Array<{ name: string; startedAt: string; completedAt?: string; durationMs?: number; records?: number; status?: "completed" | "failed" }>;
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
	const fatal = diagnostics.issues.some((issue) => issue.severity === "error" && !issue.continued);
	closeUploadPhase(diagnostics, fatal ? "failed" : "completed");
	diagnostics.status = fatal && !diagnostics.committed ? "failed" : errors > 0 ? "partial" : warnings > 0 ? "warning" : "success";
}

function closeUploadPhase(diagnostics: MapUploadDiagnostics, status: "completed" | "failed"): void {
  const phase = diagnostics.phases[diagnostics.phases.length - 1];
  if (!phase || phase.completedAt) return;
  phase.completedAt = new Date().toISOString();
  phase.durationMs = Date.parse(phase.completedAt) - Date.parse(phase.startedAt);
  phase.status = status;
}

export function uploadPhase(diagnostics: MapUploadDiagnostics, name: string, context?: string): void {
  diagnostics.context = context;
  if (diagnostics.phases[diagnostics.phases.length - 1]?.name === name) return;
  closeUploadPhase(diagnostics, "completed");
  diagnostics.phases.push({ name, startedAt: new Date().toISOString() });
}

export function recordUploadError(diagnostics: MapUploadDiagnostics, error: unknown): void {
  const details = errorDetails(error);
  addUploadIssue(diagnostics, {
    severity: "error", phase: diagnostics.phases[diagnostics.phases.length - 1]?.name ?? "Upload",
    message: details.message, entityName: diagnostics.context, continued: false, error: details,
  });
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
		`- Source version: ${diagnostics.version ?? "Unknown"}`,
		`- File size: ${diagnostics.fileSize ?? "Unknown"} bytes`,
		`- Main transaction committed: ${diagnostics.committed ? "Yes" : "No"}`,
		`- Map ID: ${diagnostics.mapId ?? "Unknown"}`,
		`- Generate NPCs: ${diagnostics.options.generateNPCs ? "Yes" : "No"}`,
		`- Supporting NPCs per category: ${diagnostics.options.supportingNPCsPerCategory}`,
		`- Supporting categories: ${diagnostics.options.supportingCategoryIds.join(", ") || "None"}`,
		"",
		"## Phases",
		"",
		...diagnostics.phases.map((phase) => `- ${phase.name}: ${phase.status ?? "running"}; ${phase.durationMs ?? 0} ms (${phase.startedAt} → ${phase.completedAt ?? "Incomplete"})`),
		"",
		"## Counts",
		"",
		"Entity counts describe prepared records; they are saved only if the main transaction committed. Era totals are read after history generation.",
		"",
		...Object.entries(diagnostics.counts).map(([key, value]) => `- ${key}: ${value}`),
		"",
		"## Issues",
		"",
		...(diagnostics.issues.length === 0
			? ["No warnings or errors were recorded."]
			: diagnostics.issues.map((issue) => `- **${issue.severity.toUpperCase()} — ${issue.phase}:** ${issue.message}${issue.entityName ? ` (${issue.entityName})` : ""}${issue.entityType || issue.entityId ? ` [${[issue.entityType, issue.entityId].filter(Boolean).join(": ")}]` : ""} Continued: ${issue.continued ? "Yes" : "No"}`)),
		"",
		"## Error details",
		"",
		...diagnostics.issues.filter((issue) => issue.error).flatMap((issue) => [
			`### ${issue.phase}`, "", "~~~json", JSON.stringify(issue.error, null, 2), "~~~", "",
		]),
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
