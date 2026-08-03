import { initGeneratorsDatabase } from "../../../../db/connections/generatorsDatabase";
import type { GeneratorRecord } from "../../../../db/generators";
import type {
	NPCAgeRangeRecord,
	NPCProfileGenerationRecord,
	NPCProfileValueRecord,
} from "../../types";

export function isNPCAgeRangeRecord(
	record: GeneratorRecord,
): record is NPCAgeRangeRecord {
	return (
		record.table === "npc.profile.age-ranges" &&
		Array.isArray(record.ancestryIds) &&
		record.ancestryIds.every((value) => typeof value === "string") &&
		typeof record.minimumAge === "number" &&
		typeof record.maximumAge === "number" &&
		typeof record.weight === "number"
	);
}

export function isNPCProfileValueRecord(
	record: GeneratorRecord,
): record is NPCProfileValueRecord {
	return (
		typeof record.table === "string" &&
		record.table.startsWith("npc.profile.") &&
		record.table !== "npc.profile.age-ranges" &&
		typeof record.field === "string" &&
		typeof record.value === "string" &&
		typeof record.weight === "number" &&
		(record.ancestryIds === undefined ||
			(Array.isArray(record.ancestryIds) &&
				record.ancestryIds.every((value) => typeof value === "string")))
	);
}

export async function listNPCProfileGenerationRecords(): Promise<
	NPCProfileGenerationRecord[]
> {
	const database = await initGeneratorsDatabase();
	return (await database.getAll("generationTables"))
		.filter(
			(record): record is NPCProfileGenerationRecord =>
				isNPCAgeRangeRecord(record) || isNPCProfileValueRecord(record),
		)
		.filter((record) => record.enabled)
		.sort((left, right) => left.id.localeCompare(right.id));
}
