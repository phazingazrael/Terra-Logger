import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryGeographyEnvironmentBlock = createMustacheMarkdownBlock({
	id: "default.country.geographyEnvironment",
	template: "## Geography & Environment\n- **Location:** [Describe location within the world, dimension, or space sector.]\n- **Climate & Atmosphere:** [Earth-like, toxic, magical storms, artificial climate, etc.]\n- **Topography & Terrain:** [Floating islands, underground caverns, space stations, etc.]\n- **Planar/Dimensional Traits:** [Is it tied to another plane? Does time move differently here?]\n- **Unique Natural Features:** [Magical ley lines, sentient forests, shifting deserts, etc.]",
});
