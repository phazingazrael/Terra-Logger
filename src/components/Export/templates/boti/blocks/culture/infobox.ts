import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"> [!infobox]",
	"> # `=this.Name`",
	"> **Pronounced:**  \"`=this.Pronounced`\"",
	"> ![[PlaceholderImage.png]]",
	"> ###### Info",
	">  |",
	"> ---|---|",
	"> **Aliases** | `=this.Aliases` |",
	"> **Type** | `=this.Type` |",
	"> **Region** | `=this.Region` |",
	"> **Theme** | `=this.Theme` |",
	"> **Language** | `=this.Language` |",
	"> **Ethnic Groups** | `=this.EthnicGroups` |",
	"> **Urban Population** | `=this.UrbanPopulation` |",
	"> **Rural Population** | `=this.RuralPopulation` |",
	"> ###### Belief & Governance",
	">  |",
	"> ---|---|",
	"> **Religions** | `=this.Religions` |",
	"> **Government** | `=this.Government` |",
	"> **Technology Level** | `=this.TechnologyLevel` |",
	"> **Notable Figures** | `=this.NotableFigures` |",
].join("\n");

export const botiCultureInfoboxBlock = createMustacheMarkdownBlock({
	id: "boti.culture.infobox",
	template,
});
