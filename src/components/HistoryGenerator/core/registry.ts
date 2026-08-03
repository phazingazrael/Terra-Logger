import type { HistoryGeneratorModule, HistorySubject, HistorySubjectType } from "./types";

const modules = new Map<HistorySubjectType, HistoryGeneratorModule<HistorySubject>[]>();

export function registerHistoryGenerator<TSubject extends HistorySubject>(module: HistoryGeneratorModule<TSubject>): void {
	const existing = modules.get(module.subjectType) ?? [];
	const withoutDuplicate = existing.filter((candidate) => candidate.id !== module.id);
	withoutDuplicate.push(module as unknown as HistoryGeneratorModule<HistorySubject>);
	modules.set(module.subjectType, withoutDuplicate);
}

export function getHistoryGenerators<TSubject extends HistorySubject>(subjectType: TSubject["type"]): HistoryGeneratorModule<TSubject>[] {
	return [...(modules.get(subjectType) ?? [])] as unknown as HistoryGeneratorModule<TSubject>[];
}
