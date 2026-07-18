import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"---",
	"BANNER: \"[[World Map.svg]]\"",
	"NoteIcon: Map",
	"Width:  \"{{info.width}}\"",
	"Height: \"{{info.height}}\"",
	"Name: \"{{settings.mapName}}\"",
	"Seed: \"{{info.seed}}\"",
	"Ver: \"{{info.ver}}\"",
	"Era: \"{{settings.options.era}}\"",
	"EraShort: \"{{settings.options.eraShort}}\"",
	"TemperatureEquator: \"{{settings.options.temperatureEquator}}\"",
	"TemperatureNorthPole: \"{{settings.options.temperatureNorthPole}}\"",
	"TemperatureSouthPole: \"{{settings.options.temperatureSouthPole}}\"",
	"Year: \"{{settings.options.year}}\"",
	"tags:",
	"Winds:",
	" - \"90° North: {{settings.options.winds[0]}}\"",
	" - \"60° North: {{settings.options.winds[1]}}\"",
	" - \"30° North: {{settings.options.winds[2]}}\"",
	" - \"30° South: {{settings.options.winds[3]}}\"",
	" - \"60° South: {{settings.options.winds[4]}}\"",
	" - \"90° South: {{settings.options.winds[5]}}\"",
	"---",
].join("\n");

export const botiMapFrontmatterBlock = createMustacheMarkdownBlock({
	id: "boti.map.frontmatter",
	template,
});
