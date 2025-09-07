import { v7 as uuidv7 } from "uuid";

import nameBaseJSON from "../../UploadMap/json/NameBases.json";

import type { TLMapInfo, TLNameBase } from "../../../definitions/TerraLogger";

interface NameBaseWithList extends NameBase {
	nameList: string[];
}
export const mutateNameBases = async (tempMap: TLMapInfo) => {
	for (const name of nameBaseJSON) {
		name._id = uuidv7();
		if (name.b !== undefined) {
			const names = name.b.split(",") as unknown as string[];
			(name as unknown as NameBaseWithList).nameList = names;
			tempMap.nameBases.push(name as unknown as TLNameBase);
		}
	}
	return tempMap.nameBases;
};
