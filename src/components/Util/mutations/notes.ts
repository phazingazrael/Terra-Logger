import { v7 as uuidv7 } from "uuid";

import type { TLMapInfo, TLNote } from "../../../definitions/TerraLogger";
import type { Tag } from "../../../definitions/Common";
import { noteAdapter } from "../../atlas/adapters/noteAdapter";
export const mutateNotes = async (data: MapInfo, tempMap: TLMapInfo) => {
  for (const note of data.notes) {
    let type = "";
    const rawType = note.id.replace(/\d+|-/g, "");

    if (rawType === "burg") {
      type = "city";
    } else if (rawType === "state" || rawType === "stateLabel") {
      type = "country";
    } else {
      type = rawType;
    }
    const newNote: TLNote = {
      _id: uuidv7(),
      legend: note.legend,
      id: note.id,
      name: note.name,
      type,
      tags: [{
        "_id": "0192be16-c07e-7801-9315-0ff0178d8eb0",
        "Default": true,
        "Description": "Written or recorded remarks, observations, or reminders related to the world.",
        "Name": "Notes",
        "Type": "Miscellaneous"
      }] as Tag[],
    };

    newNote.content = noteAdapter.createDefaultContent(newNote);

    tempMap.notes.push(newNote);
  }
  return tempMap.notes;
};
