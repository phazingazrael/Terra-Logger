import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryEconomyTradeBlock = createMustacheMarkdownBlock({
	id: "default.country.economyTrade",
	template: "## Economy & Trade\n- **Major Industries:** [Alchemy, soul-forging, mecha production, space mining, etc.]\n- **Currency & Trade:** [Gold coins, credits, mana crystals, barter system, etc.]\n- **Notable Guilds & Corporations:** [Merchant houses, cybernetic megacorps, thieves’ guilds, etc.]\n- **Imports & Exports:** [What does the country rely on, and what does it supply to others?]\n- **Black Market & Illicit Trade:** [Contraband, smugglers, underground syndicates.]",
});
