import { v7 as uuidv7 } from "uuid";
import { createEmptyReligion } from "../mkEmpty/tlReligion";

import type { TLMapInfo, TLReligion } from "../../../definitions/TerraLogger";

export const mutateReligions = async (
	data: MapInfo,
	tempMap: TLMapInfo,
	Pack: Pack,
	populationRate: number,
	urbanization: string,
) => {
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
		newReligion.name = religion.name;
		newReligion.origins = religion.origins;
		newReligion.tags = [];
		newReligion.type = religion.type;

		// use Pack.cells data to obtain population and other data
		const religionCells: number[] = [];
		let religionRuralPop = 0;
		let religionUrbanPop = 0;

		Pack.cells.religion.forEach((cell, index) => {
			if (cell === religion.i) {
				religionCells.push(index);
			}
		});

		for (const cell of religionCells) {
			religionRuralPop += Pack.cells.pop[cell];
			religionUrbanPop += Pack.cells.burg[cell]
				? Pack.burgs[Pack.cells.burg[cell]].population
				: 0;
		}

		newReligion.members.rural = Math.round(religionRuralPop * populationRate);

		newReligion.members.urban = Math.round(
			religionUrbanPop * Number(populationRate) * Number(urbanization),
		);

		// add tags
		// if religion has no believers assign "dead religion" tag
		if (Math.round(religionRuralPop + religionUrbanPop) === 0) {
			newReligion.tags.push({
				_id: "0196c071-ade3-79d3-8d49-c6f6a55c3f70",
				Default: true,
				Description:
					"Religious systems or belief structures that are no longer practiced or have fallen out of use.",
				Name: "Dead Religion",
				Type: "ReligionsAndMythology",
			});
		}
		// assign religion type tag
		switch (religion.type) {
			case "Folk":
				newReligion.tags.push({
					_id: "0196c079-2b91-7049-a7f8-df31f3583bfb",
					Default: true,
					Description:
						"Traditional belief systems rooted in local customs, often informal and passed down orally.",
					Name: "Folk Religion",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Organized":
				newReligion.tags.push({
					_id: "0196c079-2b91-77b9-b1ff-d9a77b4d6ab9",
					Default: true,
					Description:
						"Structured religions with established doctrine, hierarchy, and widespread institutions.",
					Name: "Organized Religion",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Heresy":
				newReligion.tags.push({
					_id: "0196c079-2b91-7a51-9437-f76ab624eabf",
					Default: true,
					Description:
						"Belief systems that deviate from established religious doctrine and are often considered blasphemous.",
					Name: "Heresy",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Cult":
				newReligion.tags.push({
					_id: "0196c079-2b91-794e-a79d-ce9b0e2bcba9",
					Default: true,
					Description:
						"Small, often secretive religious groups centered around a charismatic leader or unconventional beliefs.",
					Name: "Cult",
					Type: "ReligionsAndMythology",
				});
		}

		tempMap.religions.push(newReligion);
	}
	return tempMap.religions;
};
