import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"> [!infobox]",
	"> # `=this.Name`",
	"> ![[PlaceholderImage.png]]",
	"> ###### Info",
	">  |",
	"> ---|---|",
	"> **Holy City / HQ** | `=this.Headquarters` |",
	"> **Symbols** | `=this.Symbols` |",
	"> **Deities** | `=this.Deities` |",
	"> **Domains** | `=this.Domains` |",
	"> ###### Believers",
	">  |",
	"> ---|---|",
	"> **Rural** | `=this.RuralPopulation` |",
	"> **Urban** | `=this.UrbanPopulation` |",
].join("\n");

export const botiReligionInfoboxBlock = createMustacheMarkdownBlock({
	id: "boti.religion.infobox",
	template,
});
