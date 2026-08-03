import type { HistoryPassDiagnostic, HistoryRejection } from "./types";

export function summarizeRejections(rejections: readonly HistoryRejection[]): Record<string, number> {
	return rejections.reduce<Record<string, number>>((summary, rejection) => {
		summary[rejection.reason] = (summary[rejection.reason] ?? 0) + 1;
		return summary;
	}, {});
}

export function createPassDiagnostic(generatorId: string, accepted: number, rejections: readonly HistoryRejection[], durationMs: number): HistoryPassDiagnostic {
	return {
		generatorId,
		accepted,
		rejected: rejections.length,
		rejectionReasons: summarizeRejections(rejections),
		durationMs,
	};
}
