export function findCultureByID(id: number, data: MapInfo) {
	return data.cultures.find((culture) => culture.i === id);
}
