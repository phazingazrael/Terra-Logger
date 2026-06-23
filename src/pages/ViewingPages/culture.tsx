import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Container } from "@mui/material";

import { useDB } from "../../db/DataContext";

import {
	AtlasRenderer,
	PageEditor,
	getAtlasAdapter,
	isAtlasContent,
	saveAtlasRelatedUpdates,
} from "../../components/atlas";

import type { TLCulture, TLNote } from "../../definitions/TerraLogger";
import type {
	AtlasContent,
	AtlasPageEditorSavePayload,
} from "../../definitions/Atlas";

import "./viewStyles.css";
import type { Tag } from "../../definitions/Common";

function CultureView() {
	const cultureId = useParams();

	const { useActive, update, add } = useDB();
	const cultures = useActive("cultures");
	const culture = useMemo(
		() => cultures.find((c) => c._id === cultureId?._id),
		[cultures, cultureId?._id],
	);
	const notes = useActive<TLNote>("notes");
	const tags = useActive<Tag>("tags");

	const [isEditingAtlas, setIsEditingAtlas] = useState(false);
	const [localCultureContent, setLocalCultureContent] =
		useState<AtlasContent | null>(null);
	const [isSavingAtlas, setIsSavingAtlas] = useState(false);
	const [atlasSaveError, setAtlasSaveError] = useState<string | null>(null);

	const cultureAdapter = useMemo(() => getAtlasAdapter("culture"), []);

	const cultureContent = useMemo(() => {
		if (!culture) return null;

		if (localCultureContent) return localCultureContent;

		if (isAtlasContent(culture.content)) return culture.content;

		return cultureAdapter.createDefaultContent(culture);
	}, [culture, cultureAdapter, localCultureContent]);

	const atlasContext = useMemo(() => {
		if (!culture) return null;

		return {
			sourceType: "culture" as const,
			entity: culture,
			related: {
				cultures,
				notes,
				tags,
			},
		};
	}, [culture, cultures, notes, tags]);

	function handleSaveCultureAtlasContent(
		payload: AtlasPageEditorSavePayload<"culture">,
	) {
		if (!culture) return;

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

				const updatedCulture: TLCulture = {
					...payload.entity,
					content: contentToSave,
				};

				await update("cultures", String(updatedCulture._id), updatedCulture);
				await saveAtlasRelatedUpdates({
					updates: payload.relatedUpdates,
					entity: updatedCulture,
					existingTags: tags,
					add,
					update,
				});

				setLocalCultureContent(null);
				setIsEditingAtlas(false);
			} catch (error) {
				console.error("Failed to save culture Atlas content:", error);

				setAtlasSaveError(
					error instanceof Error
						? error.message
						: "Failed to save culture Atlas content.",
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
		<Container className="ViewPage Culture">
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

									{localCultureContent ? (
										<Button
											type="button"
											onClick={() => {
												setLocalCultureContent(null);
												setIsEditingAtlas(false);
											}}
										>
											Reset Local Changes
										</Button>
									) : null}
								</div>
							)}
							{cultureContent && atlasContext ? (
								isEditingAtlas ? (
									<PageEditor
										key={culture?._id}
										content={cultureContent}
										adapter={cultureAdapter}
										context={atlasContext}
										onSave={handleSaveCultureAtlasContent}
										onClose={() => setIsEditingAtlas(false)}
									/>
								) : (
									<AtlasRenderer
										content={cultureContent}
										context={atlasContext}
									/>
								)
							) : (
								<p>Culture content is not available.</p>
							)}
						</main>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default CultureView;
