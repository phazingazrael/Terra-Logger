import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryHistoryBlock = createMustacheMarkdownBlock({
	id: "default.country.history",
	template: "## History\n[Provide a historical overview, including legendary origins, significant wars, cultural milestones, or technological advancements.]\n- **Notable Founding Myths/Legends:** [Ancient tales about how the country was formed or its divine/magical origins.]\n- **Major Wars & Conflicts:** [Significant wars, galactic conflicts, magical wars, or civil uprisings.]\n- **Epochs & Eras:** [Different historical periods, dynasties, or interstellar ages.]\n- **Notable Leaders & Rulers:** [Kings, Emperors, Warlords, AI Governors, etc.]",
});
