import { createTerraLoggerMap } from "../Util/mkEmpty/tlMap";

import { mutateCities } from "../Util/mutations/cities";
import { mutateCountries } from "../Util/mutations/countries";
import { mutateCultures } from "../Util/mutations/cultures";
import { mutateNameBases } from "../Util/mutations/namebases";
import { mutateNotes } from "../Util/mutations/notes";
import { mutateReligions } from "../Util/mutations/religions";

import { ensureAtlasContentForEntity } from "../atlas/legacy/enrichAtlasContent";

import type { TLMapInfo } from "../../definitions/TerraLogger";
import { generateNPCPopulation } from "../NPC/population/generatePopulation"
import type { MapUploadDiagnostics, MapUploadGenerationOptions } from "./diagnostics";
import { addUploadIssue } from "./diagnostics";

export type MutateProgress = {
	section: string;
	item?: string;
	completed: number;
	total: number;
	percent: number;
	message: string;
};

export type MutateProgressHandler = (progress: MutateProgress) => void;

const assignMapInfo = (tempMap: TLMapInfo, data: MapInfo) => {
	// add map info that doesn't need mutating.
	tempMap.info = data.info;
	tempMap.settings = data.settings;
	tempMap.SVG = data.SVG;
};

export type MutateDataOptions = {
	generation: MapUploadGenerationOptions;
	diagnostics: MapUploadDiagnostics;
};

const mutateData = async (
	data: MapInfo,
	Pack: Pack,
	onProgress: MutateProgressHandler | undefined,
	options: MutateDataOptions,
) => {
	const { populationRate, urbanization, urbanDensity } = data.settings;

	const tempMap: TLMapInfo = createTerraLoggerMap();

	const mutationSteps = [
		"Map Info",
		"Cultures",
		"Cities",
		"Countries",
		"Name Bases",
		"Notes",
		"Religions",
		"Relationships",
		"Culture Population",
		"SVG",
		...(options.generation.generateNPCs ? ["NPC Population"] : []),
	];

	let completedMutationSteps = 0;

	const reportMutationProgress = (section: string, item?: string) => {
		completedMutationSteps += 1;

		const percent = Math.min(
			60,
			30 + Math.round((completedMutationSteps / mutationSteps.length) * 30),
		);

		onProgress?.({
			section,
			item,
			completed: completedMutationSteps,
			total: mutationSteps.length,
			percent,
			message: item
				? `Importing ${section} - ${item}`
				: `Importing ${section}...`,
		});
	};

	// Mutate Map Data to Terra-Logger Format //

	try {
		reportMutationProgress("Map Info", data.info?.name);
		assignMapInfo(tempMap, data);
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Map Info", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	try {
		reportMutationProgress("Cultures");
		const Cultures = await mutateCultures(
			data,
			tempMap,
			populationRate,
			urbanization,
		);

		tempMap.cultures = Cultures;
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Cultures", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	try {
		reportMutationProgress("Cities");
		const Cities = await mutateCities(
			data,
			tempMap,
			populationRate,
			urbanization,
			urbanDensity,
			tempMap.SVG,
		);

		tempMap.cities = Cities;
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Cities", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	try {
		reportMutationProgress("Countries");
		const Countries = await mutateCountries(
			data,
			tempMap,
			populationRate,
			urbanization,
			tempMap.SVG,
		);

		tempMap.countries = Countries;
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Countries", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	try {
		reportMutationProgress("Name Bases");
		const NameBases = await mutateNameBases(tempMap);

		tempMap.nameBases = NameBases;
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Name Bases", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	try {
		reportMutationProgress("Notes");
		const Notes = await mutateNotes(data, tempMap);

		tempMap.notes = Notes;
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Notes", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	try {
		reportMutationProgress("Religions");
		const Religions = await mutateReligions(
			data,
			tempMap,
			Pack,
			populationRate,
			urbanization,
		);

		tempMap.religions = Religions;
	} catch (error) {
		addUploadIssue(options.diagnostics, { severity: "error", phase: "Religions", message: error instanceof Error ? error.message : String(error), continued: true });
	}

	reportMutationProgress("Relationships");

	// associate cities with countries and cultures using stable import indexes
	const countriesById = new Map(
		tempMap.countries.map((country) => [country.id, country]),
	);
	const culturesById = new Map(
		tempMap.cultures.map((culture) => [String(culture.id), culture]),
	);

	tempMap.cities.forEach((city) => {
		if (city.country) {
			const tempCountry = countriesById.get(city.country.id);
			if (tempCountry) {
				city.country = {
					_id: tempCountry._id,
					govForm: tempCountry.political.form,
					govName: tempCountry.political.formName,
					id: tempCountry.id,
					name: tempCountry.name,
					nameFull: tempCountry.nameFull,
				};
			}
		}

		if (city.culture) {
			const tempCulture = culturesById.get(String(city.culture.id));
			if (tempCulture) {
				city.culture = {
					id: String(tempCulture.id),
					_id: tempCulture._id,
					name: tempCulture.name,
				};
			}
		}
	});

	reportMutationProgress("Culture Population");

	const populationByCultureId = new Map<
		string,
		{ urban: number; rural: number }
	>();
	for (const country of tempMap.countries) {
		const cultureId = String(country.culture.id);
		const totals = populationByCultureId.get(cultureId) ?? {
			urban: 0,
			rural: 0,
		};
		totals.urban +=
			Number.parseInt(country.population.urban.replace(/,/g, ""), 10) || 0;
		totals.rural +=
			Number.parseInt(country.population.rural.replace(/,/g, ""), 10) || 0;
		populationByCultureId.set(cultureId, totals);
	}

	for (const culture of tempMap.cultures) {
		const totals = populationByCultureId.get(String(culture.id)) ?? {
			urban: 0,
			rural: 0,
		};
		culture.urbanPop = totals.urban.toLocaleString("en-US");
		culture.ruralPop = totals.rural.toLocaleString("en-US");
	}

	reportMutationProgress("SVG");

	// The active-map layout owns background SVG rendering. Import only stores it.

	tempMap.cities = tempMap.cities.map(
		(city) => ensureAtlasContentForEntity("city", city).entity,
	);

	tempMap.countries = tempMap.countries.map(
		(country) => ensureAtlasContentForEntity("country", country).entity,
	);

	tempMap.cultures = tempMap.cultures.map(
		(culture) => ensureAtlasContentForEntity("culture", culture).entity,
	);

	tempMap.religions = tempMap.religions.map(
		(religion) => ensureAtlasContentForEntity("religion", religion).entity,
	);

	tempMap.notes = tempMap.notes.map(
		(note) => ensureAtlasContentForEntity("note", note).entity,
	);

	if (options.generation.generateNPCs) {
		reportMutationProgress("NPC Population");
		tempMap.npcs = await generateNPCPopulation(tempMap, {
			supportingCategoryIds: options.generation.supportingCategoryIds,
			supportingNPCsPerCategory: options.generation.supportingNPCsPerCategory,
			onIssue: (issue) => addUploadIssue(options.diagnostics, issue),
			onCount: (name, amount) => { options.diagnostics.counts[name] = (options.diagnostics.counts[name] ?? 0) + amount; },
			onProgress: (progress) => {
				const phaseProgress = progress.total > 0 ? progress.completed / progress.total : 1;
				onProgress?.({ section: "NPC Population", item: progress.message, completed: progress.completed, total: progress.total, percent: Math.min(70, 58 + Math.round(phaseProgress * 12)), message: progress.message });
			},
		});
	} else {
		tempMap.npcs = [];
		options.diagnostics.notes.push("NPC generation was disabled by the user.");
	}

	return tempMap;
};

export default mutateData;
