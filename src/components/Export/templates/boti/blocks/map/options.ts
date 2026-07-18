import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"## Options",
	"- **Pin Notes:** {{settings.options.pinNotes}}",
	"- **Winds (degrees):** {{#settings.options.winds}}{{.}}°, {{/settings.options.winds}}",
	"- **Equator Temperature:** {{settings.options.temperatureEquator}}",
	"- **North Pole Temperature:** {{settings.options.temperatureNorthPole}}",
	"- **South Pole Temperature:** {{settings.options.temperatureSouthPole}}",
	"- **State Labels Mode:** {{settings.options.stateLabelsMode}}",
	"- **Year:** {{settings.options.year}}",
	"- **Era:** {{settings.options.era}}",
	"- **EraShort**: {{settings.options.eraShort}}",
].join("\n");

export const botiMapOptionsBlock = createMustacheMarkdownBlock({
	id: "boti.map.options",
	template,
});
