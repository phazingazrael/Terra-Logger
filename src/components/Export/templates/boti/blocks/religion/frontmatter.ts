import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"---",
	"BANNER: \"[[Religion-Banner.jpg|-100]]\"",
	"Aliases: \"{{name}}\"",
	"Name: \"{{name}}\"",
	"Deities: \"{{deity}}\"",
	"Domains:",
	"Headquarters:",
	"NoteIcon: Religion",
	"Symbols:",
	"Theme:",
	"UrbanPopulation: \"{{members.urban}}\"",
	"RuralPopulation: \"{{members.rural}}\"",
	"tags:",
	"  - \"Religion\"",
	"{{#tags}}",
	"  - \"{{Name}}\"",
	"{{/tags}}",
	"---",
].join("\n");

export const botiReligionFrontmatterBlock = createMustacheMarkdownBlock({
	id: "boti.religion.frontmatter",
	template,
});
