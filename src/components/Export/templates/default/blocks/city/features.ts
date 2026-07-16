import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityFeaturesBlock = createMustacheMarkdownBlock({
	id: "default.city.features",
	template: "## Features\n{{#features}}\n  - {{.}}\n{{/features}}\n{{^features}}\nNo notable features.\n{{/features}}",
});
