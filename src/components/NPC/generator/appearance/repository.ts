import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type {
	AncestryAppearanceRecord,
	AppearanceTableRecord,
	NPCAppearanceRecord,
} from "../../types";

export function isAppearanceTableRecord(
	record: GeneratorRecord,
): record is AppearanceTableRecord {
	return (
		typeof record.table === "string" &&
		record.table !== "npc.appearance.ancestry-specific" &&
		typeof record.value === "string" &&
		typeof record.weight === "number"
	);
}

export function isAncestryAppearanceRecord(
	record: GeneratorRecord,
): record is AncestryAppearanceRecord {
	return (
		record.table === "npc.appearance.ancestry-specific" &&
		Array.isArray(record.ancestryIds) &&
		record.ancestryIds.every((value) => typeof value === "string") &&
		Array.isArray(record.values) &&
		record.values.every((value) => typeof value === "string")
	);
}

export async function listNPCAppearanceRecords(): Promise<
	NPCAppearanceRecord[]
> {
	const database = await initGeneratorsDatabase();
	return (await database.getAll("generationTables"))
		.filter(
			(record): record is NPCAppearanceRecord =>
				isAppearanceTableRecord(record) || isAncestryAppearanceRecord(record),
		)
		.filter((record) => record.enabled)
		.sort((left, right) => left.id.localeCompare(right.id));
}
