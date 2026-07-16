import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryTitleBlock = createMustacheMarkdownBlock({
	id: "default.country.title",
	template: "# Country of {{name}}",
});
