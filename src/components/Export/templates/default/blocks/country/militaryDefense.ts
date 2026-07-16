import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryMilitaryDefenseBlock = createMustacheMarkdownBlock({
	id: "default.country.militaryDefense",
	template: "## Military & Defense\n- **National Army/Navy/Air Force:** [Size and structure of land, sea, air, or space forces.]\n- **City Guards & Enforcers:** [Knights, robotic enforcers, spectral guardians, etc.]\n- **Defensive Walls & Fortifications:** [Titanium barriers, magical shields, psychic wards.]\n- **Notable Weapons & Technology:** [Arcane cannons, plasma rifles, necromantic constructs.]\n- **Mercenaries & Private Forces:** [Who offers protection outside of government control?]",
});
