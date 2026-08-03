import { createCooperativeYield } from "./cooperativeWork";
import { createPassDiagnostic } from "./diagnostics";
import { getHistoryGenerators } from "./registry";
import type { HistoryRunDiagnostics, HistorySubject } from "./types";

export type HistoryRunnerOptions = {
	currentYear?: number;
	minimumYear?: number;
	random?: () => number;
	yieldEvery?: number;
	mapContext?: unknown;
};

export async function runHistoryGenerators<TSubject extends HistorySubject>(subjects: TSubject[], options: HistoryRunnerOptions = {}): Promise<HistoryRunDiagnostics> {
	const startedAt = new Date();
	const passes = [];
	const modules = getHistoryGenerators<TSubject>(subjects[0]?.type as TSubject["type"]);
	const cooperativeYield = createCooperativeYield({ yieldEvery: options.yieldEvery });

	for (const module of modules) {
		const passStart = performance.now();
		// Generators run in registry order because later passes can depend on earlier mutations.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		const result = await module.run({
			subjects,
			currentYear: options.currentYear,
			minimumYear: options.minimumYear,
			random: options.random ?? Math.random,
			yieldControl: () => cooperativeYield(),
			mapContext: options.mapContext,
		});
		passes.push(createPassDiagnostic(module.id, result.accepted, result.rejected, performance.now() - passStart));
		// Each pass yields before the next ordered generator begins.
		// react-doctor-disable-next-line react-doctor/async-await-in-loop
		await cooperativeYield(true);
	}

	const completedAt = new Date();
	return {
		subjectType: subjects[0]?.type ?? "npc",
		subjectCount: subjects.length,
		accepted: passes.reduce((sum, pass) => sum + pass.accepted, 0),
		rejected: passes.reduce((sum, pass) => sum + pass.rejected, 0),
		startedAt: startedAt.toISOString(),
		completedAt: completedAt.toISOString(),
		durationMs: completedAt.getTime() - startedAt.getTime(),
		passes,
	};
}
