import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const botiEraInfoboxBlock = createMustacheMarkdownBlock({
  id: "boti.era.infobox",
  template: [
    "> [!infobox]",
    "> # `=this.Name`",
    "> ###### Chronology",
    "> | | |",
    "> | --- | --- |",
    "> | **Abbreviation** | `=this.ShortName` |",
    "> | **Status** | `=this.Status` |",
    "> | **First Year** | `=this.FirstYear` |",
    "> | **Present / Final Year** | `=this.FinalYear` |",
    "> | **Years Elapsed / Duration** | `=this.Length` |",
  ].join("\n"),
});
