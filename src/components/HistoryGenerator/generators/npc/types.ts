import type { TLNPC } from "../../../../definitions/TerraLogger";
import type { HistorySubject } from "../../core";

export type NPCHistorySubject = HistorySubject & {
	type: "npc";
	npc: TLNPC;
};
