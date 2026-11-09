import { appendPreviousMapEra } from "../../../db/eras";
import type { TLHistoryEra } from "../../../definitions/History";
import type { PreviousEraDraft, PreviousEraInput } from "./model";

export type PreviousEraDialogRequest = {
	id: string;
	drafts: readonly PreviousEraDraft[];
	defaultDuration: number;
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
			defaultDuration: 100,
			resolve,
			reject,
		};

		for (const listener of listeners) listener(request);
	});
}

export function persistPreviousEra(mapId: string, input: PreviousEraInput, birthTimelineYear?: number): Promise<TLHistoryEra> {
	return appendPreviousMapEra(mapId, input, birthTimelineYear);
}

export async function promptForPreviousEra(
	mapId: string,
	drafts: readonly PreviousEraDraft[],
): Promise<TLHistoryEra> {
	const input = await requestPreviousEraInput(drafts);
	const birthTimelineYear = drafts.reduce<number | undefined>((latest, draft) =>
		latest === undefined ? draft.birthTimelineYear : Math.max(latest, draft.birthTimelineYear), undefined);
	return persistPreviousEra(mapId, input, birthTimelineYear);
}
