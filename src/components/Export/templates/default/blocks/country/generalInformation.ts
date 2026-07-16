import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryGeneralInformationBlock = createMustacheMarkdownBlock({
	id: "default.country.generalInformation",
	template: "## General Information\n- **Type:** {{type}}\n- **Location:** {{location}}\n- **Form of Government:** {{political.formName}} ({{political.form}})\n- **Population Total:** {{population.total}}\n- **Rural Population:** {{population.rural}}\n- **Urban Population:** {{population.urban}}",
});
