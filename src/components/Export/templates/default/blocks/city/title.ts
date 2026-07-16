import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityTitleBlock = createMustacheMarkdownBlock({
	id: "default.city.title",
	template: "# City of {{name}}",
});
