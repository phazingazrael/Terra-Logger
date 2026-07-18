import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"> [!infobox]",
	"> # Country of {{name}}",
	"> **Pronounced:**  \"{{name}}\"",
	"> ![[{{name}}.svg]]",
	"> ###### Info",
	">  |",
	"> ---|---|",
	"> **Aliases** | {{name}}, {{nameFull}} |",
	"> **Theme** | {{type}} |",
	"> **Planet** |  |",
	"> **Terrain** |  |",
	"> ###### Politics",
	">  |",
	"> ---|---|",
	"> **Rulers** |  |",
	"> **Leaders** |  |",
	"> **Govt Type** | {{political.formName}} ({{political.form}}) |",
	"> **Religions** |  |",
	"> ###### Population",
	">  |",
	"> ---|---|",
	"  > **Rural** | {{population.rural}} |",
	"> **Urban** | {{population.urban}} |",
	"> **Total** | {{population.total}} |",
	"> ###### Description",
	"> {{description}}",
	""
].join("\n");

export const botiCountryInfoboxBlock = createMustacheMarkdownBlock({
	id: "boti.country.infobox",
	template,
});
