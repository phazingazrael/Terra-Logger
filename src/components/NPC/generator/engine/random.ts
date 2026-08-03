export type RandomSource = () => number;

export function safeRandom(random: RandomSource = Math.random): number {
	const value = random();
	if (!Number.isFinite(value)) return 0;
	return Math.min(0.9999999999999999, Math.max(0, value));
}

export function pickRandom<T>(
	values: readonly T[],
	random: RandomSource = Math.random,
): T | undefined {
	if (!values.length) return undefined;
	return values[Math.floor(safeRandom(random) * values.length)];
}

export function pickWeighted<T>(
	values: readonly T[],
	getWeight: (value: T) => number,
	random: RandomSource = Math.random,
): T | undefined {
	const candidates = values.flatMap((value) => {
		const weight = Math.max(0, getWeight(value));
		return weight > 0 ? [{ value, weight }] : [];
	});
	if (!candidates.length) return pickRandom(values, random);

	const total = candidates.reduce(
		(sum, candidate) => sum + candidate.weight,
		0,
	);
	let roll = safeRandom(random) * total;
	for (const candidate of candidates) {
		roll -= candidate.weight;
		if (roll < 0) return candidate.value;
	}
	return candidates[candidates.length - 1]?.value;
}

export function randomInteger(
	minimum: number,
	maximum: number,
	random: RandomSource = Math.random,
): number {
	const safeMinimum = Math.ceil(Math.min(minimum, maximum));
	const safeMaximum = Math.floor(Math.max(minimum, maximum));
	return (
		safeMinimum +
		Math.floor(safeRandom(random) * (safeMaximum - safeMinimum + 1))
	);
}
