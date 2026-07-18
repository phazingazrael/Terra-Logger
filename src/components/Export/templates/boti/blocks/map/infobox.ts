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
	"> **Type** | `=this.NoteIcon` |",
	"> **Width × Height** | `=this.Width` × `=this.Height` |",
	"> **Era (Year)** | `=this.Era` (`=this.Year`) |",
	"> **Version** | `=this.Ver` |",
	"> **Seed** | `=this.Seed` |",
	"> **Planet/Plane** | `=this.PlanetPlane` |",
].join("\n");

export const botiMapInfoboxBlock = createMustacheMarkdownBlock({
	id: "boti.map.infobox",
	template,
});
