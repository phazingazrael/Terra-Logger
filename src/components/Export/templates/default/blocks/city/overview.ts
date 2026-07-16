import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityOverviewBlock = createMustacheMarkdownBlock({
	id: "default.city.overview",
	template: "## Overview\n**Country/Empire/Faction:** [[{{country.name}}]]\n**Region/Province/Sector:** [Region Name]\n**Established/Founded by:** [Date / Founder / Mythological Event]\n**Population:** {{population}}\n**Demonym:** [Demonym]\n**Primary Inhabitants/Races:** [Humans, Elves, Dwarves, Androids, etc.]",
});
