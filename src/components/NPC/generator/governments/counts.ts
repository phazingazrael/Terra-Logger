import type { GovernmentRoleCount } from "../../types";

export type GovernmentRoleCountContext = {
	countryCount: number;
	cityCount: number;
	random?: () => number;
};

function nonNegativeInteger(value: number): number {
	return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0));
}

export function resolveGovernmentRoleCount(
	count: GovernmentRoleCount,
	context: GovernmentRoleCountContext,
): number {
	if (count.mode === "fixed") return nonNegativeInteger(count.value);

	if (count.mode === "random-range") {
		const minimum = nonNegativeInteger(count.minimum);
		const maximum = Math.max(minimum, nonNegativeInteger(count.maximum));
		const randomValue = Math.min(
			0.9999999999999999,
			Math.max(0, (context.random ?? Math.random)()),
		);
		return minimum + Math.floor(randomValue * (maximum - minimum + 1));
	}

	const relatedCount =
		count.entityType === "country"
			? nonNegativeInteger(context.countryCount)
			: nonNegativeInteger(context.cityCount);
	const adjustedCount = Math.max(
		0,
		relatedCount - (count.excludeCurrentEntity ? 1 : 0),
	);
	const multiplied = adjustedCount * (count.multiplier ?? 1);
	const minimum = count.minimum ?? 0;
	const maximum = count.maximum ?? Number.POSITIVE_INFINITY;
	return nonNegativeInteger(Math.min(maximum, Math.max(minimum, multiplied)));
}
