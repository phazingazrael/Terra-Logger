import { v7 as uuidv7 } from "uuid";

import type { TLMapInfo, TLNote } from "../../../definitions/TerraLogger";
export const mutateNotes = async (data: MapInfo, tempMap: TLMapInfo) => {
	for (const note of data.notes) {
		const newNote: TLNote = {
			_id: uuidv7(),
			legend: note.legend,
			id: note.id,
			name: note.name,
		};
		tempMap.notes.push(newNote);
	}
	return tempMap.notes;
};
