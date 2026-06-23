import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Container } from "@mui/material";

import { useDB } from "../../db/DataContext";

import type { TLNote, TLReligion } from "../../definitions/TerraLogger";

import "./viewStyles.css";
import {
	AtlasRenderer,
	PageEditor,
	getAtlasAdapter,
	isAtlasContent,
} from "../../components/atlas";
import type {
	AtlasContent,
	AtlasPageEditorSavePayload,
} from "../../definitions/Atlas";
import type { Tag } from "../../definitions/Common";
import { saveAtlasRelatedUpdates } from "../../components/atlas";

function ReligionView() {
	const religionId = useParams();

	const { useActive, update, add } = useDB();
	const religions = useActive<TLReligion>("religions");
	const religion = useMemo(
		() => religions.find((r) => r._id === religionId?._id),
		[religions, religionId?._id],
	);
	const notes = useActive<TLNote>("notes");
	const cities = useActive("cities");
	const cultures = useActive("cultures");
	const tags = useActive<Tag>("tags");

	const [isEditingAtlas, setIsEditingAtlas] = useState(false);
	const [localReligionContent, setLocalReligionContent] =
		useState<AtlasContent | null>(null);
	const [isSavingAtlas, setIsSavingAtlas] = useState(false);
	const [atlasSaveError, setAtlasSaveError] = useState<string | null>(null);

	const religionAdapter = useMemo(() => getAtlasAdapter("religion"), []);

	const religionContent = useMemo(() => {
		if (!religion) return null;

		if (localReligionContent) return localReligionContent;

		if (isAtlasContent(religion.content)) return religion.content;

		return religionAdapter.createDefaultContent(religion);
	}, [religion, religionAdapter, localReligionContent]);

	const atlasContext = useMemo(() => {
		if (!religion) return null;

		return {
			sourceType: "religion" as const,
			entity: religion,
			related: {
				cities,
				cultures,
				religions,
				notes,
				tags,
			},
		};
	}, [religion, religions, notes, cities, cultures, tags]);

	function handleSaveReligionAtlasContent(
		payload: AtlasPageEditorSavePayload<"religion">,
	) {
		if (!religion) return;

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

				const updatedReligion: TLReligion = {
					...payload.entity,
					content: contentToSave,
				};

				await update("religions", String(updatedReligion._id), updatedReligion);
				await saveAtlasRelatedUpdates({
					updates: payload.relatedUpdates,
					entity: updatedReligion,
					existingTags: tags,
					add,
					update,
				});

				setLocalReligionContent(null);
				setIsEditingAtlas(false);
			} catch (error) {
				console.error("Failed to save religion Atlas content:", error);

				setAtlasSaveError(
					error instanceof Error
						? error.message
						: "Failed to save religion Atlas content.",
				);
			} finally {
				setIsSavingAtlas(false);
			}
		})();
	}

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	return (
		<Container className="ViewPage Religion">
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
										disabled={isSavingAtlas}
										onClick={() => setIsEditingAtlas((current) => !current)}
									>
										{isSavingAtlas
											? "Saving..."
											: isEditingAtlas
												? ""
												: "Edit Page"}
									</Button>

									{localReligionContent ? (
										<Button
											type="button"
											onClick={() => {
												setLocalReligionContent(null);
												setIsEditingAtlas(false);
											}}
										>
											Reset Local Changes
										</Button>
									) : null}
								</div>
							)}

							{religionContent && atlasContext ? (
								isEditingAtlas ? (
									<PageEditor
										key={religion?._id}
										content={religionContent}
										adapter={religionAdapter}
										context={atlasContext}
										onSave={handleSaveReligionAtlasContent}
										onClose={() => setIsEditingAtlas(false)}
									/>
								) : (
									<AtlasRenderer
										content={religionContent}
										context={atlasContext}
									/>
								)
							) : (
								<p>Religion content is not available.</p>
							)}
						</main>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default ReligionView;
