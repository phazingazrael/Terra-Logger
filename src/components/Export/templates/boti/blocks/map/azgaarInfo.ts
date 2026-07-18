import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

const template = [
	"---",
	"",
	"### Full Azgaar Map Info.",
	"",
	"#### Info",
	"- **Name:** {{info.name}}",
	"- **Seed:** {{info.seed}}",
	"- **Dimensions:** {{info.width}} × {{info.height}}",
	"- **Version:** {{info.ver}}",
	"",
	"#### Map Settings",
	"- **Map Name:** {{settings.mapName}}",
	"- **Distance Unit:** {{settings.distanceUnit}}",
	"- **Distance Scale:** {{settings.distanceScale}}",
	"- **Area Unit:** {{settings.areaUnit}}",
	"- **Height Unit:** {{settings.heightUnit}}",
	"- **Height Exponent:** {{settings.heightExponent}}",
	"- **Temperature Scale:** {{settings.temperatureScale}}",
	"- **Population Rate:** {{settings.populationRate}}",
	"- **Urbanization Level:** {{settings.urbanization}}",
	"- **Map Size:** {{settings.mapSize}}",
	"- **Latitude Base:** {{settings.latitude0}}",
	"- **Precipitation Value:** {{settings.prec}}",
	"- **Hide Labels:** {{settings.hideLabels}}",
	"- **Style Preset:** {{settings.stylePreset}}",
	"- **Rescale Labels:** {{settings.rescaleLabels}}",
	"- **Urban Density:** {{settings.urbanDensity}}",
].join("\n");

export const botiMapAzgaarInfoBlock = createMustacheMarkdownBlock({
	id: "boti.map.azgaarInfo",
	template,
});
