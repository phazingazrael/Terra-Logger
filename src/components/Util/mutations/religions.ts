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

		const Origins = [];

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

		switch (religion.form) {
			case "Shamanism":
				newReligion.tags.push({
					_id: "2a3b03ae-8a84-47cb-86c6-ba74e49bda28",
					Default: true,
					Description:
						"Belief system involving mediation between the human and spirit worlds through shamans.",
					Name: "Shamanism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Animism":
				newReligion.tags.push({
					_id: "30b92c08-9d3b-44ec-a8ab-daa150a2b2be",
					Default: true,
					Description:
						"Belief that natural objects and phenomena possess spiritual essence or consciousness.",
					Name: "Animism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Polytheism":
				newReligion.tags.push({
					_id: "6da13bc0-5c37-42e0-a592-f74407b4bdd1",
					Default: true,
					Description:
						"Worship or belief in multiple deities, each with distinct roles and domains.",
					Name: "Polytheism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Ancestor Worship":
				newReligion.tags.push({
					_id: "be4b83ee-430b-4c37-9ab0-88c0d1b34abf",
					Default: true,
					Description:
						"Reverence and ritual practices centered around deceased ancestors.",
					Name: "Ancestor Worship",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Nature Worship":
				newReligion.tags.push({
					_id: "adeac4f0-e04b-462b-b2be-376c933a777a",
					Default: true,
					Description:
						"Spiritual veneration of natural elements and forces, such as the sun, rivers, or forests.",
					Name: "Nature Worship",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Totemism":
				newReligion.tags.push({
					_id: "ed45e4e3-3c79-4d1d-9fd3-bd949137fce9",
					Default: true,
					Description:
						"Religious belief in symbolic relationships between humans and animals, plants, or spirits.",
					Name: "Totemism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Monotheism":
				newReligion.tags.push({
					_id: "627b4f86-d0e7-4dc4-a92f-3152547cf118",
					Default: true,
					Description:
						"Belief in a single, all-powerful deity governing all aspects of existence.",
					Name: "Monotheism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Dualism":
				newReligion.tags.push({
					_id: "1c6a6319-589a-43c2-a8aa-e4f6a0c6f59a",
					Default: true,
					Description:
						"Religious worldview centered on opposing forces, such as good and evil or light and dark.",
					Name: "Dualism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Pantheism":
				newReligion.tags.push({
					_id: "bf9f4f4c-1407-4cb7-9439-ecc17a6d8882",
					Default: true,
					Description:
						"Belief that the divine pervades all aspects of the universe and nature.",
					Name: "Pantheism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Non-theism":
				newReligion.tags.push({
					_id: "dc2ff0c3-56ec-46f5-91c7-4f927e08b3f2",
					Default: true,
					Description:
						"Philosophical or religious systems that do not focus on the worship of deities.",
					Name: "Non-theism",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Cult":
				newReligion.tags.push({
					_id: "46b2f78c-80be-49b1-b5be-bf0a4a987b5c",
					Default: true,
					Description:
						"Small or fringe religious group with unconventional practices or beliefs.",
					Name: "Cult",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Dark Cult":
				newReligion.tags.push({
					_id: "82c964f0-73d6-4694-a3ed-4d34f0b47f52",
					Default: true,
					Description:
						"Secretive or malevolent cults often associated with forbidden knowledge or dark rituals.",
					Name: "Dark Cult",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Sect":
				newReligion.tags.push({
					_id: "99bcfdb6-5e7a-42ef-8e29-b420f154da2a",
					Default: true,
					Description:
						"A distinct group within a larger religion that deviates from mainstream practices or beliefs.",
					Name: "Sect",
					Type: "ReligionsAndMythology",
				});
				break;
			case "Heresy":
				newReligion.tags.push({
					_id: "a1a2c6b7-6b88-4c4c-b0d0-62467a37d40b",
					Default: true,
					Description:
						"Beliefs or practices rejected by mainstream religions as unorthodox or blasphemous.",
					Name: "Heresy",
					Type: "ReligionsAndMythology",
				});
				break;
		}

		// assign religion origin(s)
		if (
			religion.origins &&
			religion.origins !== null &&
			religion.origins !== undefined
		) {
			if (religion.origins.length > 0) {
				for (const origin of religion.origins) {
					if (origin !== 0) {
						const Origin = data.religions.find(
							(religion) => religion.i === origin,
						);
						if (Origin) {
							Origins.push(Origin.name);
						}
					}
				}
			}
		}

		// assign religion center (city or country of origin)

		if (
			religion.center !== 0 &&
			religion.center !== null &&
			religion.center !== undefined
		) {
			const _Center = { i: 0, _id: "", name: "" };
			if (religion.type === "Folk") {
				_Center.i = data.cultures[religion.culture].i;
				_Center.name = `Culture - ${data.cultures[religion.culture].name}`;
				_Center._id = newReligion.culture._id;
			} else {
				const pcbCenter = Pack.cells.burg[religion.center];
				const Center = tempMap.cities.find((city) => city.id === pcbCenter);
				if (Center) {
					_Center.i = Center.id;
					_Center.name = Center.name;
					_Center._id = Center._id;
				}
			}
			newReligion.center = _Center;
		}

		newReligion.origins = Origins;

		tempMap.religions.push(newReligion);
	}
	return tempMap.religions;
};
