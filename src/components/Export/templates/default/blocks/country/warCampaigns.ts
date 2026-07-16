import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryWarCampaignsBlock = createMustacheMarkdownBlock({
	id: "default.country.warCampaigns",
	template: "## War Campaigns\n{{#warCampaigns}}\n  - {{.}}\n{{/warCampaigns}}\n{{^warCampaigns}}\nNo war campaigns recorded.\n{{/warCampaigns}}",
});
