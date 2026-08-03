export type CooperativeWorkOptions = {
	yieldEvery?: number;
};

export function createCooperativeYield(options: CooperativeWorkOptions = {}): (force?: boolean) => Promise<void> {
	const yieldEvery = Math.max(1, options.yieldEvery ?? 100);
	let operations = 0;
	return async (force = false) => {
		operations += 1;
		if (!force && operations % yieldEvery !== 0) return;
		await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));
	};
}
