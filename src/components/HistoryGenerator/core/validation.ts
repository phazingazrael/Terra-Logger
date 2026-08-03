export function toNumericYear(value: unknown): number | undefined {
	if (typeof value === "number" && Number.isFinite(value)) return value;
	if (typeof value !== "string" || value.trim() === "") return undefined;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export function compareOptionalYears(left: unknown, right: unknown): number {
	const leftYear = toNumericYear(left);
	const rightYear = toNumericYear(right);
	if (leftYear === undefined && rightYear === undefined) return 0;
	if (leftYear === undefined) return 1;
	if (rightYear === undefined) return -1;
	return leftYear - rightYear;
}

export function stableUnorderedPairKey(leftId: string, rightId: string): string {
	return leftId < rightId ? `${leftId}::${rightId}` : `${rightId}::${leftId}`;
}
