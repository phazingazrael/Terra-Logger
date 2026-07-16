import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryCitiesBlock = createMustacheMarkdownBlock({
	id: "default.country.cities",
	template: "## Cities\n{{#cities}}\n  - [[{{name}}]]\n{{/cities}}\n{{^cities}}\nNo cities recorded.\n{{/cities}}",
});
