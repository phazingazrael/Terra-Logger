/* eslint-disable jsx-a11y/label-has-associated-control */
import { Button, Container } from "@mui/material";
import { useDB } from "../../db/DataContext";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import type { TLCity, TLNote } from "../../definitions/TerraLogger";
import type { Tag } from "../../definitions/Common";

import "./viewStyles.css";
import type {
	AtlasContent,
	AtlasPageEditorSavePayload,
} from "../../definitions/Atlas";
import {
	AtlasRenderer,
	PageEditor,
	getAtlasAdapter,
	isAtlasContent,
	saveAtlasRelatedUpdates,
} from "../../components/atlas";

function CityView() {
	const cityId = useParams();
	const { useActive, update, add } = useDB();
	const cities = useActive<TLCity>("cities");
	const notes = useActive<TLNote>("notes");
	const countries = useActive("countries");
	const cultures = useActive("cultures");
	const tags = useActive<Tag>("tags");

	const city = useMemo(
		() => cities.find((c) => c._id === cityId?._id),
		[cities, cityId?._id],
	);

	const [isEditingAtlas, setIsEditingAtlas] = useState(false);

	const [localCityContent, setLocalCityContent] = useState<AtlasContent | null>(
		null,
	);

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
			}, new Map<string, TLCity[]>()),
			countriesByEntityId: new Map(
				countries.map((country) => [country._id, country]),
			),
			countriesByNumericId: new Map(
				countries.map((country) => [country.id, country]),
			),
			tagsById: new Map(tags.map((tag) => [tag._id, tag])),
		}),
		[cities, countries, tags],
	);

	const cityAdapter = useMemo(() => getAtlasAdapter("city"), []);

	const cityContent = useMemo(() => {
		if (!city) return null;

		if (localCityContent) {
			return localCityContent;
		}

		if (isAtlasContent(city.content)) {
			return city.content;
		}

		return cityAdapter.createDefaultContent(city);
	}, [city, cityAdapter, localCityContent]);

	const atlasContext = useMemo(() => {
		if (!city) return null;

		return {
			sourceType: "city" as const,
			entity: city,
			related: {
				cities,
				countries,
				cultures,
				notes,
				tags,
			},
			relatedLookups,
		};
	}, [city, notes, cities, countries, cultures, tags, relatedLookups]);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	function handleSaveCityAtlasContent(
		payload: AtlasPageEditorSavePayload<"city">,
	) {
		if (!city) return;

		void (async () => {
			setIsSavingAtlas(true);
			setAtlasSaveError(null);

			try {
				const contentToSave: AtlasContent = {
					...payload.content,
					meta: {
						...payload.content.meta,
						title: payload.entity.name,
						updatedAt: new Date().toISOString(),
					},
				};

				const updatedCity: TLCity = {
					...payload.entity,
					content: contentToSave,
				};

				await update("cities", String(updatedCity._id), updatedCity);
				await saveAtlasRelatedUpdates({
					updates: payload.relatedUpdates,
					entity: updatedCity,
					existingTags: tags,
					add,
					update,
				});

				setLocalCityContent(null);
				setIsEditingAtlas(false);
			} catch (error) {
				console.error("Failed to save city Atlas content:", error);

				setAtlasSaveError(
					error instanceof Error
						? error.message
						: "Failed to save city Atlas content.",
				);
			} finally {
				setIsSavingAtlas(false);
			}
		})();
	}

	return (
		<Container className="ViewPage City">
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

									{localCityContent ? (
										<Button
											type="button"
											onClick={() => {
												setLocalCityContent(null);
												setIsEditingAtlas(false);
											}}
										>
											Reset Local Changes
										</Button>
									) : null}
								</div>
							)}

							{cityContent && atlasContext ? (
								isEditingAtlas ? (
									<PageEditor
										key={city?._id}
										content={cityContent}
										adapter={cityAdapter}
										context={atlasContext}
										onSave={handleSaveCityAtlasContent}
										onClose={() => setIsEditingAtlas(false)}
									/>
								) : (
									<AtlasRenderer content={cityContent} context={atlasContext} />
								)
							) : (
								<p>City content is not available.</p>
							)}
						</main>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default CityView;
