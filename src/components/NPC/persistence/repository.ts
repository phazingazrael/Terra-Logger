import type { TLNPC } from "../../../definitions/TerraLogger";
import { ensurePersistentNPCFields } from "./normalize";
import {
  addDataToStore,
} from "../../../db/interactions";

export async function addNPC(npc: TLNPC): Promise<void> {
  await addDataToStore("npcs", ensurePersistentNPCFields(npc));
}