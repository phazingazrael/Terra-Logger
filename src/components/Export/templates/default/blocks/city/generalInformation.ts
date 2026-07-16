import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityGeneralInformationBlock = createMustacheMarkdownBlock({
	id: "default.city.generalInformation",
	template: "## General Information\n- **Type:** {{type}}\n- **Country Name:** {{country.nameFull}} ({{country.name}})\n- **Government Form:** {{country.govForm}} ({{country.govName}})\n- **Population:** {{population}}\n- **Capital:** {{#capital}}Yes{{/capital}}{{^capital}}No{{/capital}}\n- **Map Link:** [City Map]({{mapLink}})",
});
