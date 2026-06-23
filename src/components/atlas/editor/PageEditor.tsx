import { useEffect, useMemo, useRef, useState } from "react";
import type {
	AtlasAdapter,
	AtlasContent,
	AtlasEditorContext,
	AtlasEntityBySource,
	AtlasPageEditorSavePayload,
	AtlasRelatedUpdate,
	AtlasRenderContext,
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
import { commonBlockPresets, commonSectionPresets } from "../adapters/shared";

type AtlasSectionDraft = AtlasContent["sections"][number];

type PageEditorProps<TSource extends AtlasSourceType> = Readonly<{
	content: AtlasContent;
	adapter: AtlasAdapter<TSource>;
	context: AtlasRenderContext<TSource>;
	onSave: (payload: AtlasPageEditorSavePayload<TSource>) => void;
	onClose?: () => void;
}>;

export function PageEditor<TSource extends AtlasSourceType>({
	content,
	context,
	onSave,
	onClose,
}: Readonly<PageEditorProps<TSource>>) {
	const activePanelBodyRef = useRef<HTMLDivElement | null>(null);

	const [contentDraft, setContentDraft] = useState<AtlasContent>(() =>
		structuredClone(content),
	);

	const [entityDraft, setEntityDraft] = useState<AtlasEntityBySource[TSource]>(
		() => structuredClone(context.entity),
	);

	const [relatedUpdates, setRelatedUpdates] = useState<AtlasRelatedUpdate[]>(
		[],
	);

	const [activeSectionId, setActiveSectionId] = useState<string | null>(
		content.sections[0]?.id ?? null,
	);

	const [selectedSectionPresetIndex, setSelectedSectionPresetIndex] =
		useState("");

	const sectionPresets = useMemo(() => commonSectionPresets(), []);
	const blockPresets = useMemo(() => commonBlockPresets(), []);

	const sections = contentDraft.sections ?? [];

	const activeSection = useMemo(
		() =>
			sections.find((section) => section.id === activeSectionId) ??
			sections[0] ??
			null,
		[sections, activeSectionId],
	);

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
		if (sections.length === 0) {
			setActiveSectionId(null);
			return;
		}

		if (
			!activeSectionId ||
			!sections.some((section) => section.id === activeSectionId)
		) {
			setActiveSectionId(sections[0].id);
		}
	}, [sections, activeSectionId]);

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
		setContentDraft(structuredClone(content));
		setEntityDraft(structuredClone(context.entity));
		setRelatedUpdates([]);
		setActiveSectionId(content.sections[0]?.id ?? null);
		setSelectedSectionPresetIndex("");
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

	function handleRemoveActiveSection() {
		if (!activeSection) return;

		const shouldRemove = window.confirm(
			`Remove the "${getSectionTitle(activeSection)}" section?`,
		);

		if (!shouldRemove) return;

		setContentDraft((current) =>
			removeSectionFromDocument(current, activeSection.id),
		);
	}

	return (
		<div className="atlas-embedded-editor">
			<div className="atlas-embedded-editor-workspace">
				<header className="atlas-embedded-editor-topbar">
					<strong>Edit {context.entity.name}</strong>

					<div className="atlas-embedded-editor-topbar__actions">
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
								<select
									value={selectedSectionPresetIndex}
									onChange={(event) =>
										setSelectedSectionPresetIndex(event.target.value)
									}
								>
									<option value="">Add section...</option>

									{sectionPresets.map((preset, index) => (
										// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
										<option key={`section-preset-${index}`} value={index}>
											{getSectionPresetLabel(preset, index)}
										</option>
									))}
								</select>

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
						{activeSection ? (
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
										section={activeSection}
										blockPresets={blockPresets}
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
