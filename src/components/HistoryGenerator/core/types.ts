export type HistorySubjectType =
	| "world"
	| "country"
	| "city"
	| "npc"
	| "religion"
	| "culture";

export type HistorySubject = {
	id: string;
	type: HistorySubjectType;
};

export type HistoryRejection = {
	generatorId: string;
	subjectId?: string;
	reason: string;
};

export type HistoryGeneratorResult = {
	accepted: number;
	rejected: HistoryRejection[];
};

export type HistoryGeneratorContext<TSubject extends HistorySubject> = {
	subjects: TSubject[];
	currentYear?: number;
	minimumYear?: number;
	random: () => number;
	yieldControl: () => Promise<void>;
	mapContext?: unknown;
};

export type HistoryGeneratorModule<TSubject extends HistorySubject> = {
	id: string;
	subjectType: TSubject["type"];
	run: (context: HistoryGeneratorContext<TSubject>) => Promise<HistoryGeneratorResult>;
};

export type HistoryPassDiagnostic = {
	generatorId: string;
	accepted: number;
	rejected: number;
	rejectionReasons: Record<string, number>;
	durationMs: number;
};

export type HistoryRunDiagnostics = {
	subjectType: HistorySubjectType;
	subjectCount: number;
	accepted: number;
	rejected: number;
	startedAt: string;
	completedAt: string;
	durationMs: number;
	passes: HistoryPassDiagnostic[];
};
