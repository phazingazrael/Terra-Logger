import { useEffect, useMemo, useState } from "react";
import { Button, Container } from "@mui/material";

import { useParams } from "react-router-dom";
import { useDB } from "../../db/DataContext";

import type { TLCountry, TLDiplomacy } from "../../definitions/TerraLogger";

import "./viewStyles.css";

import {
	AtlasRenderer,
	getAtlasAdapter,
	isAtlasContent,
	PageEditor,
	saveAtlasRelatedUpdates,
} from "../../components/atlas";
import type {
	AtlasContent,
	AtlasPageEditorSavePayload,
} from "../../definitions/Atlas";
import type { Tag } from "../../definitions/Common";

function CountryView() {
	const countryId = useParams();
	const { useActive, update, add } = useDB();
	const countries = useActive("countries");
	const notes = useActive("notes");
	const cities = useActive("cities");
	const tags = useActive<Tag>("tags");
	const country = useMemo(
		() => countries.find((c) => c._id === countryId?._id),
		[countries, countryId?._id],
	);
	const cultures = useActive("cultures");

	// Group diplomatic relations by status
	const diplomacyGroups: Record<string, TLDiplomacy[]> = {};

	for (const relation of country?.political.diplomacy ?? []) {
		if (relation.status !== "-" && relation.status !== "x") {
			if (!diplomacyGroups[relation.status]) {
				diplomacyGroups[relation.status] = [];
			}
			diplomacyGroups[relation.status].push(relation);
		}
	}

	const [isEditingAtlas, setIsEditingAtlas] = useState(false);

	const [localCountryContent, setLocalCountryContent] =
		useState<AtlasContent | null>(null);

	const [isSavingAtlas, setIsSavingAtlas] = useState(false);
	const [atlasSaveError, setAtlasSaveError] = useState<string | null>(null);

	const relatedLookups = useMemo(
		() => ({
			citiesByCountryId: cities.reduce((map, relatedCity) => {
				const countryId = relatedCity.country?._id;
				if (!countryId) return map;
				const group = map.get(countryId);
				if (group) group.push(relatedCity);
				else map.set(countryId, [relatedCity]);
				return map;
			}, new Map()),
			countriesByEntityId: new Map(
				countries.map((entry) => [entry._id, entry]),
			),
			countriesByNumericId: new Map(
				countries.map((entry) => [entry.id, entry]),
			),
			tagsById: new Map(tags.map((tag) => [tag._id, tag])),
		}),
		[cities, countries, tags],
	);

	const countryAdapter = useMemo(() => getAtlasAdapter("country"), []);

	const countryContent = useMemo(() => {
		if (!country) return null;

		if (localCountryContent) {
			return localCountryContent;
		}

		if (isAtlasContent(country.content)) {
			return country.content;
		}

		return countryAdapter.createDefaultContent(country);
	}, [country, countryAdapter, localCountryContent]);

	const atlasContext = useMemo(() => {
		if (!country) return null;

		return {
			sourceType: "country" as const,
			entity: country,
			related: {
				cities,
				countries,
				cultures,
				notes,
				tags,
			},
			relatedLookups,
		};
	}, [country, notes, cities, countries, cultures, tags, relatedLookups]);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	function handleSaveCountryAtlasContent(
		payload: AtlasPageEditorSavePayload<"country">,
	) {
		if (!country) return;

		void (async () => {
			setIsSavingAtlas(true);
			setAtlasSaveError(null);

			try {
				const contentToSave: AtlasContent = {
					...payload.content,
					meta: {
						...payload.content.meta,
						title: payload.entity.nameFull || payload.entity.name,
						updatedAt: new Date().toISOString(),
					},
				};

				const updatedCountry: TLCountry = {
					...payload.entity,
					content: contentToSave,
				};

				await update("countries", String(updatedCountry._id), updatedCountry);
				await saveAtlasRelatedUpdates({
					updates: payload.relatedUpdates,
					entity: updatedCountry,
					existingTags: tags,
					add,
					update,
				});

				setLocalCountryContent(null);
				setIsEditingAtlas(false);
			} catch (error) {
				console.error("Failed to save country Atlas content:", error);

				setAtlasSaveError(
					error instanceof Error
						? error.message
						: "Failed to save country Atlas content.",
				);
			} finally {
				setIsSavingAtlas(false);
			}
		})();
	}

	return (
		<Container className="ViewPage Country" color="text.secondary">
			<div className="contentSubBody">
				<div className="flex-container">
					<div className={`wiki ${isEditingAtlas ? "editing" : ""}`}>
						<main className="content">
							{isEditingAtlas ? (
								""
							) : (
								<div className="atlas-page-actions">
									{atlasSaveError ? (
										<p className="atlas-save-error">{atlasSaveError}</p>
									) : null}
									<Button
										type="button"
										onClick={() => setIsEditingAtlas((current) => !current)}
									>
										{isSavingAtlas
											? "Saving..."
											: isEditingAtlas
												? ""
												: "Edit Page"}
									</Button>

									{localCountryContent ? (
										<Button
											type="button"
											onClick={() => {
												setLocalCountryContent(null);
												setIsEditingAtlas(false);
											}}
										>
											Reset Local Changes
										</Button>
									) : null}
								</div>
							)}

							{countryContent && atlasContext ? (
								isEditingAtlas ? (
									<PageEditor
										key={country?._id}
										content={countryContent}
										adapter={countryAdapter}
										context={atlasContext}
										onSave={handleSaveCountryAtlasContent}
										onClose={() => setIsEditingAtlas(false)}
									/>
								) : (
									<AtlasRenderer
										content={countryContent}
										context={atlasContext}
									/>
								)
							) : (
								<p>Country content is not available.</p>
							)}
						</main>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default CountryView;
