import { useEffect, useMemo, useState } from "react";
import { Button, Container } from "@mui/material";

import { useParams } from "react-router-dom";

import {
	AtlasRenderer,
	PageEditor,
	getAtlasAdapter,
	isAtlasContent,
	saveAtlasRelatedUpdates,
} from "../../components/atlas";

import type { TLNote } from "../../definitions/TerraLogger";
import type {
	AtlasContent,
	AtlasPageEditorSavePayload,
} from "../../definitions/Atlas";

import "./viewStyles.css";

import { useDB } from "../../db/DataContext";
import type { Tag } from "../../definitions/Common";

function NoteView() {
	const { _id } = useParams<{ _id: string }>();

	const { useActive, update, add } = useDB();
	const notes = useActive<TLNote>("notes");
	const tags = useActive<Tag>("tags");
	const note = useMemo(() => notes.find((r) => r._id === _id), [notes, _id]);

	const [isEditingAtlas, setIsEditingAtlas] = useState(false);
	const [localNoteContent, setLocalNoteContent] = useState<AtlasContent | null>(
		null,
	);
	const [isSavingAtlas, setIsSavingAtlas] = useState(false);
	const [atlasSaveError, setAtlasSaveError] = useState<string | null>(null);

	const noteAdapter = useMemo(() => getAtlasAdapter("note"), []);

	const noteContent = useMemo(() => {
		if (!note) return null;

		if (localNoteContent) return localNoteContent;

		if (isAtlasContent(note.content)) return note.content;

		return noteAdapter.createDefaultContent(note);
	}, [note, noteAdapter, localNoteContent]);

	const atlasContext = useMemo(() => {
		if (!note) return null;

		return {
			sourceType: "note" as const,
			entity: note,
			related: {
				notes,
				tags,
			},
		};
	}, [note, notes, tags]);

	function handleSaveNoteAtlasContent(
		payload: AtlasPageEditorSavePayload<"note">,
	) {
		if (!note) return;

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

				const updatedNote: TLNote = {
					...payload.entity,
					content: contentToSave,
				};

				await update("notes", String(updatedNote._id), updatedNote);
				await saveAtlasRelatedUpdates({
					updates: payload.relatedUpdates,
					entity: updatedNote,
					existingTags: tags,
					add,
					update,
				});

				setLocalNoteContent(null);
				setIsEditingAtlas(false);
			} catch (error) {
				console.error("Failed to save note Atlas content:", error);

				setAtlasSaveError(
					error instanceof Error
						? error.message
						: "Failed to save note Atlas content.",
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
		<Container className="ViewPage Notes">
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

									{localNoteContent ? (
										<Button
											type="button"
											onClick={() => {
												setLocalNoteContent(null);
												setIsEditingAtlas(false);
											}}
										>
											Reset Local Changes
										</Button>
									) : null}
								</div>
							)}

							{noteContent && atlasContext ? (
								isEditingAtlas ? (
									<PageEditor
										key={note?._id}
										content={noteContent}
										adapter={noteAdapter}
										context={atlasContext}
										onSave={handleSaveNoteAtlasContent}
										onClose={() => setIsEditingAtlas(false)}
									/>
								) : (
									<AtlasRenderer content={noteContent} context={atlasContext} />
								)
							) : (
								<p>Note content is not available.</p>
							)}
						</main>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default NoteView;
