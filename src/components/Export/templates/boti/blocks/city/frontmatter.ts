import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"---",
	"BANNER: \"[[City-Banner.jpg|150]]\"",
	"Name: {{name}}",
	"Aliases: {{name}}",
	"Capital: {{#capital}}Yes{{/capital}}{{^capital}}No{{/capital}}",
	"Country: {{country.name}}",
	"Defences:",
	"GovtType: {{country.govForm}}",
	"Imports:",
	"Exports:",
	"Leaders:",
	"Features:",
	"{{#features}}",
	"  - {{.}}",
	"{{/features}}",
	"Population: {{population}}",
	"Pronounced:",
	"Religions:",
	"Rulers:",
	"Terrain:",
	"Theme: {{type}}",
	"Type: {{type}}",
	"tags:",
	"{{#tags}}",
	"  - \"{{Name}}\"",
	"{{/tags}}",
	"---",
].join("\n");

export const botiCityFrontmatterBlock = createMustacheMarkdownBlock({
	id: "boti.city.frontmatter",
	template,
});
