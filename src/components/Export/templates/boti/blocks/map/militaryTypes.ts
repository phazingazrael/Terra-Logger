import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"## Military Types",
	"",
	"| Icon | Unit Type | Rural Presence | Urban Presence | Crew | Power | Category | Separate? |",
	"|------|-----------|----------------|----------------|------|-------|---------|-----------|",
	"{{#settings.options.militaryTypes}}",
	"| {{icon}} | {{name}} | {{rural}} | {{urban}} | {{crew}} | {{power}} | {{type}} | {{#separate}}Yes{{/separate}}{{^separate}}No{{/separate}} |",
	"{{/settings.options.militaryTypes}}",
].join("\n");

export const botiMapMilitaryTypesBlock = createMustacheMarkdownBlock({
	id: "boti.map.militaryTypes",
	template,
});
