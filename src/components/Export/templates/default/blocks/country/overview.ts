import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryOverviewBlock = createMustacheMarkdownBlock({
	id: "default.country.overview",
	template: "## Overview\n**Region/Continent/Planet:** [Region Name]\n**Established/Founded by:** [Date / Founder / Mythological Event]\n**Population:** [Population]\n**Area:** [Area in sq km or planetary unit]\n**Time Zone/Chrono-Cycle:** [Time Zone / Galactic Standard Time]\n**Demonym:** [Demonym]\n**Alignment (RPG-Based):** [Lawful, Chaotic, Neutral, etc.]\n**Primary Inhabitants/Races:** [Humans, Elves, Dwarves, Androids, etc.]",
});
