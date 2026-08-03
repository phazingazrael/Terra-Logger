import { initMapsDatabase } from "../../../db/connections/mapsDatabase";
import type { TLHistoryEra } from "../../../definitions/History";
import type { MapInf } from "../../../definitions/TerraLogger";
import {
	createPreviousEra,
	nextPreviousEraTimelineEnd,
	orderPreviousEras,
	type PreviousEraDraft,
	type PreviousEraInput,
} from "./model";

export type PreviousEraDialogRequest = {
	id: string;
	drafts: readonly PreviousEraDraft[];
	defaultFirstYear: number;
	defaultFinalYear: number;
	resolve: (input: PreviousEraInput) => void;
	reject: (error: Error) => void;
};

type PreviousEraDialogListener = (request: PreviousEraDialogRequest) => void;

const listeners = new Set<PreviousEraDialogListener>();

export function subscribeToPreviousEraDialog(listener: PreviousEraDialogListener): () => void {
	listeners.add(listener);
	return () => {
		listeners.delete(listener);
	};
}

function requestPreviousEraInput(drafts: readonly PreviousEraDraft[]): Promise<PreviousEraInput> {
	return new Promise((resolve, reject) => {
		if (!listeners.size) {
			reject(new Error("The previous-era dialog is not mounted."));
			return;
		}

		const request: PreviousEraDialogRequest = {
			id: globalThis.crypto?.randomUUID?.() ?? `previous-era-${Date.now()}-${Math.random()}`,
			drafts,
			defaultFirstYear: 0,
			defaultFinalYear: 100,
			resolve,
			reject,
		};

		for (const listener of listeners) listener(request);
	});
}

export async function persistPreviousEra(mapId: string, input: PreviousEraInput): Promise<TLHistoryEra> {
	const db = await initMapsDatabase();
	const maps = (await db.getAllFromIndex("maps", "mapIdIndex", mapId)) as MapInf[];
	const map = maps[0];
	if (!map) throw new Error(`Map ${mapId} could not be found while saving previous-era details.`);

	const historyGenerator = map.historyGenerator ?? { currentEraMinimumYear: 0, previousEras: [] };
	const previousEras = historyGenerator.previousEras;
	const era = createPreviousEra(
		input,
		nextPreviousEraTimelineEnd(historyGenerator.currentEraMinimumYear, previousEras),
	);

	map.historyGenerator = {
		...historyGenerator,
		previousEras: orderPreviousEras([...previousEras, era]),
	};
	await db.put("maps", map);
	return era;
}

export async function promptForPreviousEra(
	mapId: string,
	drafts: readonly PreviousEraDraft[],
): Promise<TLHistoryEra> {
	const input = await requestPreviousEraInput(drafts);
	return persistPreviousEra(mapId, input);
}
