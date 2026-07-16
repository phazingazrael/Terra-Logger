import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityDemographicsSocietyBlock = createMustacheMarkdownBlock({
	id: "default.city.demographicsSociety",
	template: "## Demographics & Society\n- **Population Growth & Migration:** [Stable, declining, booming, dependent on magic/artificial births.]\n- **Ethnic & Racial Composition:** [Humans, Elves, Orcs, Androids, Clones, etc.]\n- **Language & Scripts:** [Common tongue, ancient runes, digital code-based speech.]\n- **Religion & Deities:** [Worship of gods, forgotten cosmic entities, AI prophets.]\n- **Caste/Class System:** [Strict hierarchy, meritocracy, anarchist communes, slave societies.]",
});
