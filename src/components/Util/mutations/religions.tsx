import { v7 as uuidv7 } from "uuid";
import { createEmptyReligion } from "../mkEmpty/tlReligion";

import type { TLMapInfo, TLReligion } from "../../../definitions/TerraLogger";

export const mutateReligions = async (data: MapInfo, tempMap: TLMapInfo) => {
	for (const religion of data.religions) {
		const newReligion: TLReligion = createEmptyReligion();
		const Culture = tempMap.cultures.find((c) => c.id === religion.culture);
		newReligion._id = uuidv7();
		newReligion.code = religion.code;
		if (Culture) {
			newReligion.culture = {
				id: Culture.id as unknown as string,
				_id: Culture._id,
			};
		}
		newReligion.deity = religion.deity;
		newReligion.form = religion.form;
		newReligion.i = religion.i;
		// newReligion.members = religion.members;
		newReligion.name = religion.name;
		newReligion.origins = religion.origins;
		newReligion.type = religion.type;

		tempMap.religions.push(newReligion);
	}
	return tempMap.religions;
};
