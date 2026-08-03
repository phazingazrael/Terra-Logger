export function buildCandidateIndex<T>(items: readonly T[], keysForItem: (item: T) => readonly string[]): Map<string, T[]> {
	const index = new Map<string, T[]>();
	for (const item of items) {
		for (const key of keysForItem(item)) {
			if (!key) continue;
			const candidates = index.get(key) ?? [];
			candidates.push(item);
			index.set(key, candidates);
		}
	}
	return index;
}

export function boundedCandidates<T>(items: readonly T[], maximum: number): readonly T[] {
	return items.length <= maximum ? items : items.slice(0, maximum);
}
