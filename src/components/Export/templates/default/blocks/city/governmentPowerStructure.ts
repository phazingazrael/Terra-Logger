import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityGovernmentPowerStructureBlock = createMustacheMarkdownBlock({
	id: "default.city.governmentPowerStructure",
	template: "## Government & Power Structure\n- **Government Type:** [Monarchy, Theocracy, AI-Controlled, Mage Council, etc.]\n- **Current Ruler(s):** [King, High Priestess, AI Overlord, Elder Council, etc.]\n- **Noble Houses & Factions:** [Major power groups, noble families, rival factions.]\n- **Laws & Justice System:** [Trial by combat? Magic-enforced law? A dystopian police state?]\n- **Corruption Level:** [Low, moderate, high, controlled by crime syndicates.]",
});
