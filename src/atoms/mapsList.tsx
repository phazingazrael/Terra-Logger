import { atom } from "jotai";
import { getFullStore } from "../db/interactions";

const mapsData = async () => {
	const mapsData = await getFullStore("maps");
	return mapsData || [];
};

const mapsListAtom = atom(mapsData);

export default mapsListAtom;
