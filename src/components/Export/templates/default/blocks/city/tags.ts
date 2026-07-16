import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityTagsBlock = createMustacheMarkdownBlock({
	id: "default.city.tags",
	template: "## Tags\n{{#tags}}\n- **Name:** {{Name}}\n  Type: {{Type}}\n  Default: {{#Default}}Yes{{/Default}}{{^Default}}No{{/Default}}\n  Description: {{Description}}\n{{/tags}}",
});
