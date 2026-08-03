import { type ReactNode, type SetStateAction, useEffect, useMemo, useReducer, useRef } from "react";
import type {
	AtlasAdapter,
	AtlasBlockPreset,
	AtlasContent,
	AtlasEditorContext,
	AtlasEntityBySource,
	AtlasPageEditorSavePayload,
	AtlasRelatedUpdate,
	AtlasRenderContext,
	AtlasSection,
	AtlasSourceType,
} from "../../../definitions/Atlas";
import {
	addSection,
	moveSection,
	removeSection as removeSectionFromDocument,
	replaceSection,
} from "../core/documentTree";
import { setValueAtPath } from "./entityFields/entityFieldAccess";
import { SectionEditor } from "./SectionEditor";
import "../styles/editor.css";
import { Button } from "@mui/material";

type AtlasSectionDraft = AtlasContent["sections"][number];

const EMPTY_SECTIONS: AtlasSection[] = [];

export type AtlasInlineEditorSection = Readonly<{
	id: string;
	title: string;
	render: ReactNode;
}>;

const EMPTY_INLINE_SECTIONS: readonly AtlasInlineEditorSection[] = [];


type PageEditorState<TSource extends AtlasSourceType> = {
	contentDraft: AtlasContent;
	entityDraft: AtlasEntityBySource[TSource];
	relatedUpdates: AtlasRelatedUpdate[];
	activeSectionId: string | null;
	selectedSectionPresetIndex: string;
};

type PageEditorAction<TSource extends AtlasSourceType> =
	| { type: "set-content"; value: SetStateAction<AtlasContent> }
	| { type: "set-entity"; value: SetStateAction<AtlasEntityBySource[TSource]> }
	| { type: "set-related-updates"; value: SetStateAction<AtlasRelatedUpdate[]> }
	| { type: "set-active-section"; value: SetStateAction<string | null> }
	| { type: "set-section-preset"; value: SetStateAction<string> }
	| { type: "reset"; state: PageEditorState<TSource> };

function resolveStateAction<T>(current: T, action: SetStateAction<T>): T {
	return typeof action === "function"
		? (action as (value: T) => T)(current)
		: action;
}

function pageEditorReducer<TSource extends AtlasSourceType>(
	state: PageEditorState<TSource>,
	action: PageEditorAction<TSource>,
): PageEditorState<TSource> {
	switch (action.type) {
		case "set-content":
			return { ...state, contentDraft: resolveStateAction(state.contentDraft, action.value) };
		case "set-entity":
			return { ...state, entityDraft: resolveStateAction(state.entityDraft, action.value) };
		case "set-related-updates":
			return { ...state, relatedUpdates: resolveStateAction(state.relatedUpdates, action.value) };
		case "set-active-section":
			return { ...state, activeSectionId: resolveStateAction(state.activeSectionId, action.value) };
		case "set-section-preset":
			return { ...state, selectedSectionPresetIndex: resolveStateAction(state.selectedSectionPresetIndex, action.value) };
		case "reset":
			return action.state;
	}
}

export type AtlasEditorToolbarContext<TSource extends AtlasSourceType> =
	Readonly<{
		content: AtlasContent;
		entity: AtlasEntityBySource[TSource];
		relatedUpdates: readonly AtlasRelatedUpdate[];
		replaceDraft: (next: {
			content?: AtlasContent;
			entity?: AtlasEntityBySource[TSource];
			relatedUpdates?: AtlasRelatedUpdate[];
		}) => void;
	}>;

type PageEditorProps<TSource extends AtlasSourceType> = Readonly<{
	content: AtlasContent;
	adapter: AtlasAdapter<TSource>;
	context: AtlasRenderContext<TSource>;
	onSave: (payload: AtlasPageEditorSavePayload<TSource>) => void;
	onClose?: () => void;
	inlineSections?: readonly AtlasInlineEditorSection[];
	renderToolbarActions?: (
		context: AtlasEditorToolbarContext<TSource>,
	) => ReactNode;
}>;

function usePageEditorModel<TSource extends AtlasSourceType>({
	content,
	adapter,
	context,
	onSave,
	onClose,
	inlineSections = EMPTY_INLINE_SECTIONS,
	renderToolbarActions,
}: Readonly<PageEditorProps<TSource>>) {
	const activePanelBodyRef = useRef<HTMLDivElement | null>(null);

	const [state, dispatch] = useReducer(pageEditorReducer<TSource>, {
		contentDraft: structuredClone(content),
		entityDraft: structuredClone(context.entity),
		relatedUpdates: [],
		activeSectionId: inlineSections[0]?.id ?? content.sections[0]?.id ?? null,
		selectedSectionPresetIndex: "",
	});

	const { contentDraft, entityDraft, relatedUpdates, activeSectionId, selectedSectionPresetIndex } = state;
	const setContentDraft = (value: SetStateAction<AtlasContent>) => dispatch({ type: "set-content", value });
	const setEntityDraft = (value: SetStateAction<AtlasEntityBySource[TSource]>) => dispatch({ type: "set-entity", value });
	const setRelatedUpdates = (value: SetStateAction<AtlasRelatedUpdate[]>) => dispatch({ type: "set-related-updates", value });
	const setActiveSectionId = (value: SetStateAction<string | null>) => dispatch({ type: "set-active-section", value });
	const setSelectedSectionPresetIndex = (value: SetStateAction<string>) => dispatch({ type: "set-section-preset", value });

	const sectionPresets = adapter.sectionPresets;
	const blockPresets = adapter.blockPresets;

	const sections = contentDraft.sections ?? EMPTY_SECTIONS;

	const activeInlineSection =
		inlineSections.find((section) => section.id === activeSectionId) ?? null;

	const activeSection =
		sections.find((section) => section.id === activeSectionId) ?? null;

	const activeSectionIndex = activeSection
		? sections.findIndex((section) => section.id === activeSection.id)
		: -1;

	const canRemoveActiveSection =
		activeSection?.editor?.editable !== false &&
		activeSection?.editor?.removable !== false;

	const previewContext: AtlasRenderContext<TSource> = useMemo(
		() => ({
			...context,
			entity: entityDraft,
		}),
		[context, entityDraft],
	);

	const editorContext: AtlasEditorContext<TSource> = useMemo(
		() => ({
			...previewContext,
			onEntityFieldChange: ({ path, value }) => {
				setEntityDraft((current) => setValueAtPath(current, path, value));
			},
			onRelatedUpdate: (update) => {
				setRelatedUpdates((current) => upsertRelatedUpdate(current, update));
			},
		}),
		[previewContext],
	);

	const dirty =
		JSON.stringify(contentDraft) !== JSON.stringify(content) ||
		JSON.stringify(entityDraft) !== JSON.stringify(context.entity) ||
		relatedUpdates.length > 0;

	useEffect(() => {
		const validInline = inlineSections.some(
			(section) => section.id === activeSectionId,
		);
		const validAtlas = sections.some(
			(section) => section.id === activeSectionId,
		);

		if (!activeSectionId || (!validInline && !validAtlas)) {
			setActiveSectionId(inlineSections[0]?.id ?? sections[0]?.id ?? null);
		}
	}, [sections, inlineSections, activeSectionId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: resets scroll on section change
	useEffect(() => {
		const panel = activePanelBodyRef.current;

		if (!panel) return;

		const frame = window.requestAnimationFrame(() => {
			panel.scrollTo({
				top: 0,
				left: 0,
				behavior: "auto",
			});
		});

		return () => window.cancelAnimationFrame(frame);
	}, [activeSectionId]);

	function handleDiscard() {
		dispatch({
			type: "reset",
			state: {
				contentDraft: structuredClone(content),
				entityDraft: structuredClone(context.entity),
				relatedUpdates: [],
				activeSectionId: inlineSections[0]?.id ?? content.sections[0]?.id ?? null,
				selectedSectionPresetIndex: "",
			},
		});
	}

	function handleClose() {
		if (dirty) {
			const shouldClose = window.confirm(
				"Discard unsaved changes and close the editor?",
			);

			if (!shouldClose) return;
		}

		onClose?.();
	}

	function handleAddSection() {
		const presetIndex = Number(selectedSectionPresetIndex);
		const preset = sectionPresets[presetIndex];

		if (!preset) return;

		const section = preset.create(entityDraft);

		setContentDraft((current) => addSection(current, section));
		setActiveSectionId(section.id);
		setSelectedSectionPresetIndex("");
	}

	function handleMoveActiveSection(direction: "up" | "down") {
		if (!activeSection) return;

		setContentDraft((current) => {
			const from = current.sections.findIndex(
				(section) => section.id === activeSection.id,
			);

			if (from === -1) return current;

			const to = direction === "up" ? from - 1 : from + 1;

			if (to < 0 || to >= current.sections.length) return current;

			return moveSection(current, from, to);
		});
	}

	const toolbarContext: AtlasEditorToolbarContext<TSource> = {
		content: contentDraft,
		entity: entityDraft,
		relatedUpdates,
		replaceDraft: (next) => {
			if (next.content) {
				const nextContent = structuredClone(next.content);

				setContentDraft(nextContent);

				const selectionStillExists =
					nextContent.sections.some(
						(section) => section.id === activeSectionId,
					) || inlineSections.some((section) => section.id === activeSectionId);

				if (!selectionStillExists) {
					setActiveSectionId(
						inlineSections[0]?.id ?? nextContent.sections[0]?.id ?? null,
					);
				}
			}

			if (next.entity) {
				setEntityDraft(structuredClone(next.entity));
			}

			if (next.relatedUpdates) {
				setRelatedUpdates([...next.relatedUpdates]);
			}
		},
	};

	function handleRemoveActiveSection() {
		if (!activeSection) return;

		const shouldRemove = window.confirm(
			`Remove the "${getSectionTitle(activeSection)}" section?`,
		);

		if (!shouldRemove) return;

		const removedIndex = sections.findIndex(
			(section) => section.id === activeSection.id,
		);

		const nextContent = removeSectionFromDocument(
			contentDraft,
			activeSection.id,
		);

		const nextSection =
			nextContent.sections[removedIndex] ??
			nextContent.sections[removedIndex - 1] ??
			null;

		setContentDraft(nextContent);
		setActiveSectionId(nextSection?.id ?? inlineSections[0]?.id ?? null);
	}
	return { context, onSave, inlineSections, renderToolbarActions, activePanelBodyRef, contentDraft, setContentDraft, entityDraft, relatedUpdates, activeSectionId, setActiveSectionId, selectedSectionPresetIndex, setSelectedSectionPresetIndex, sectionPresets, blockPresets, sections, activeInlineSection, activeSection, activeSectionIndex, canRemoveActiveSection, editorContext, dirty, handleDiscard, handleClose, handleAddSection, handleMoveActiveSection, toolbarContext, handleRemoveActiveSection };
}

type PageEditorModel<TSource extends AtlasSourceType> = ReturnType<
	typeof usePageEditorModel<TSource>
>;

function PageEditorView<TSource extends AtlasSourceType>(
	model: PageEditorModel<TSource>,
) {
	const { context, onSave, inlineSections, renderToolbarActions, activePanelBodyRef, contentDraft, setContentDraft, entityDraft, relatedUpdates, activeSectionId, setActiveSectionId, selectedSectionPresetIndex, setSelectedSectionPresetIndex, sectionPresets, blockPresets, sections, activeInlineSection, activeSection, activeSectionIndex, canRemoveActiveSection, editorContext, dirty, handleDiscard, handleClose, handleAddSection, handleMoveActiveSection, toolbarContext, handleRemoveActiveSection } = model;
	return (
		<div className="atlas-embedded-editor">
			<div className="atlas-embedded-editor-workspace">
				<header className="atlas-embedded-editor-topbar">
					<strong>Edit {context.entity.name}</strong>

					<div className="atlas-embedded-editor-topbar__actions">
						{renderToolbarActions?.(toolbarContext)}

						<Button
							type="button"
							variant="outlined"
							disabled={!dirty}
							onClick={() =>
								onSave({
									content: contentDraft,
									entity: entityDraft,
									relatedUpdates,
								})
							}
						>
							Save
						</Button>

						<Button
							type="button"
							variant="outlined"
							disabled={!dirty}
							onClick={handleDiscard}
						>
							Discard
						</Button>

						<Button type="button" variant="outlined" onClick={handleClose}>
							Close
						</Button>
					</div>
				</header>

				<div className="atlas-embedded-editor-shell">
					<aside className="atlas-embedded-editor-rail">
						<div className="atlas-embedded-editor-rail__header">
							<strong>Sections</strong>

							<div className="atlas-embedded-editor-add-section">
								<label>
									Add section
									<select
										value={selectedSectionPresetIndex}
										onChange={(event) =>
											setSelectedSectionPresetIndex(event.target.value)
										}
									>
										<option value="">Select section type...</option>

										{sectionPresets.map((preset, index) => (
											<option key={preset.id} value={index}>
												{getSectionPresetLabel(preset, index)}
											</option>
										))}
									</select>
								</label>

								<Button
									variant="outlined"
									type="button"
									size="small"
									disabled={!selectedSectionPresetIndex}
									onClick={handleAddSection}
								>
									Add
								</Button>
							</div>
						</div>

						<div className="atlas-embedded-editor-section-list">
							{inlineSections.map((section) => {
								const isActive = section.id === activeSectionId;

								return (
									<button
										key={section.id}
										type="button"
										className={
											isActive
												? "atlas-embedded-editor-section-tab atlas-embedded-editor-section-tab--active"
												: "atlas-embedded-editor-section-tab"
										}
										onClick={() => setActiveSectionId(section.id)}
									>
										<span>{section.title}</span>
									</button>
								);
							})}

							{sections.map((section) => {
								const isActive = section.id === activeSection?.id;

								return (
									<button
										key={section.id}
										type="button"
										className={
											isActive
												? "atlas-embedded-editor-section-tab atlas-embedded-editor-section-tab--active"
												: "atlas-embedded-editor-section-tab"
										}
										onClick={() => setActiveSectionId(section.id)}
									>
										<span>{getSectionTitle(section)}</span>
									</button>
								);
							})}
						</div>
					</aside>

					<main className="atlas-embedded-editor-panel">
						{activeInlineSection ? (
							<>
								<header className="atlas-embedded-editor-panel__header">
									<strong>{activeInlineSection.title}</strong>
								</header>

								<div
									className="atlas-embedded-editor-panel__body"
									ref={activePanelBodyRef}
								>
									{activeInlineSection.render}
								</div>
							</>
						) : activeSection ? (
							<>
								<header className="atlas-embedded-editor-panel__header">
									<strong>{getSectionTitle(activeSection)}</strong>

									<div className="atlas-embedded-editor-panel__actions">
										<Button
											type="button"
											variant="outlined"
											disabled={activeSectionIndex <= 0}
											onClick={() => handleMoveActiveSection("up")}
										>
											Move Up
										</Button>

										<Button
											type="button"
											variant="outlined"
											disabled={
												activeSectionIndex === -1 ||
												activeSectionIndex >= sections.length - 1
											}
											onClick={() => handleMoveActiveSection("down")}
										>
											Move Down
										</Button>

										<Button
											type="button"
											variant="outlined"
											color="error"
											disabled={
												!canRemoveActiveSection ||
												activeSection.title === "Political Information" ||
												activeSection.title === "Economy"
											}
											onClick={handleRemoveActiveSection}
										>
											Remove Section
										</Button>
									</div>
								</header>

								<div
									className="atlas-embedded-editor-panel__body"
									ref={activePanelBodyRef}
								>
									<SectionEditor
										key={activeSection.id}
										section={activeSection}
										blockPresets={blockPresets as AtlasBlockPreset[]}
										context={editorContext}
										onChange={(section) =>
											setContentDraft((current) =>
												replaceSection(current, section),
											)
										}
									/>
								</div>
							</>
						) : (
							<div className="atlas-embedded-editor-empty">
								<p>No section selected.</p>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
}

export function PageEditor<TSource extends AtlasSourceType>({
	content,
	adapter,
	context,
	onSave,
	onClose,
	inlineSections = EMPTY_INLINE_SECTIONS,
	renderToolbarActions,
}: Readonly<PageEditorProps<TSource>>) {
	const model = usePageEditorModel({ content, adapter, context, onSave, onClose, inlineSections, renderToolbarActions });
	return <PageEditorView<TSource> {...model} />;
}

function getSectionTitle(section: AtlasSectionDraft): string {
	const record = section as {
		title?: unknown;
		label?: unknown;
		name?: unknown;
	};

	return String(
		record.title ?? record.label ?? record.name ?? "Untitled section",
	);
}

function getSectionPresetLabel(preset: unknown, index: number): string {
	if (!preset || typeof preset !== "object") {
		return `Section ${index + 1}`;
	}

	const record = preset as {
		label?: unknown;
		title?: unknown;
		name?: unknown;
	};

	return String(
		record.label ?? record.title ?? record.name ?? `Section ${index + 1}`,
	);
}

function upsertRelatedUpdate(
	current: AtlasRelatedUpdate[],
	next: AtlasRelatedUpdate,
): AtlasRelatedUpdate[] {
	if (next.action === "add") {
		const existingIndex = current.findIndex(
			(update) =>
				update.store === next.store &&
				update.action === "add" &&
				update.value._id === next.value._id,
		);

		if (existingIndex === -1) {
			return [...current, next];
		}

		return current.map((update, index) =>
			index === existingIndex ? next : update,
		);
	}

	const existingIndex = current.findIndex(
		(update) =>
			update.store === next.store &&
			update.action === "update" &&
			update.key === next.key,
	);

	if (existingIndex === -1) {
		return [...current, next];
	}

	return current.map((update, index) =>
		index === existingIndex ? next : update,
	);
}
