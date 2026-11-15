import { useEffect, useRef, useState } from "react";
import { Alert, Box } from "@mui/material";
import type {
	AtlasContent,
	AtlasGridSpan,
	AtlasRenderContext,
	AtlasSection,
} from "../../../definitions/Atlas";
import { useDB } from "../../../db/DataContext";
import { getAtlasAdapter } from "../adapters/registry";
import { AtlasRenderer } from "./Renderer";

const stores = {
	city: "cities",
	country: "countries",
	culture: "cultures",
	religion: "religions",
	note: "notes",
	npc: "npcs",
	era: "eras",
} as const;

export function AtlasView({
	content,
	context,
}: Readonly<{
	content: AtlasContent;
	context: AtlasRenderContext;
}>) {
	const { update } = useDB();
	const pending = useRef(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const adapter = getAtlasAdapter(context.sourceType);
	const pageKey = `${context.sourceType}:${context.entity._id}`;
	const [savedWidths, setSavedWidths] = useState<{
		pageKey: string;
		spans: Record<string, AtlasGridSpan>;
	}>({ pageKey, spans: {} });
	const spans = savedWidths.pageKey === pageKey ? savedWidths.spans : {};
	const currentContent: AtlasContent = {
		...content,
		sections: content.sections.map((section) =>
			spans[section.id] === undefined
				? section
				: {
						...section,
						wrapper: { ...section.wrapper, gridSpan: spans[section.id] },
					},
		),
	};

	useEffect(() => {
		if (savedWidths.pageKey !== pageKey) {
			setSavedWidths({ pageKey, spans: {} });
			return;
		}
		const remaining = Object.fromEntries(
			Object.entries(savedWidths.spans).filter(
				([id, span]) =>
					content.sections.find((section) => section.id === id)?.wrapper
						.gridSpan !== span,
			),
		);
		if (
			Object.keys(remaining).length !== Object.keys(savedWidths.spans).length
		) {
			setSavedWidths({ pageKey, spans: remaining });
		}
	}, [content, pageKey, savedWidths]);

	const drag = useRef<{
		pointerId: number;
		startX: number;
		pitch: number;
		direction: number;
		columns: number;
		startSpan: number;
		span: number;
	} | null>(null);
	const [preview, setPreview] = useState<{
		sectionId: string;
		gridSpan: AtlasGridSpan;
	} | null>(null);

	function resizeMetrics(handle: HTMLElement) {
		const section = handle.closest<HTMLElement>(".atlas-section");
		const grid = section?.parentElement;
		if (!section || !grid) return null;
		const style = getComputedStyle(grid);
		const columns = style.gridTemplateColumns.split(/\s+/).length;
		const gap = parseFloat(style.columnGap) || 0;
		const pitch = (grid.getBoundingClientRect().width + gap) / columns;
		const width = section.getBoundingClientRect().width;
		return {
			columns,
			pitch,
			span: Math.max(1, Math.min(columns, Math.round((width + gap) / pitch))),
		};
	}

	function spanValue(span: number): AtlasGridSpan {
		return span === 1 ? "single" : span === 2 ? "wide" : "full";
	}

	function cancelResize() {
		drag.current = null;
		setPreview(null);
	}

	async function changeSpan(section: AtlasSection, gridSpan: AtlasGridSpan) {
		if (pending.current) return;
		pending.current = true;
		setSaving(true);
		setError(null);
		try {
			const next: AtlasContent = {
				...currentContent,
				meta: { ...currentContent.meta, updatedAt: new Date().toISOString() },
				sections: currentContent.sections.map((item) =>
					item.id === section.id
						? { ...item, wrapper: { ...item.wrapper, gridSpan } }
						: item,
				),
			};
			await update(stores[context.sourceType], String(context.entity._id), {
				...context.entity,
				content: next,
			});
			// Keep the saved width visible until the parent receives the updated content.
			setSavedWidths((current) => ({
				pageKey,
				spans: {
					...(current.pageKey === pageKey ? current.spans : {}),
					[section.id]: gridSpan,
				},
			}));
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Failed to save section width.",
			);
		} finally {
			pending.current = false;
			setSaving(false);
		}
	}

	function renderSectionControls(section: AtlasSection) {
		const classes = (section.wrapper.className ?? "").split(/\s+/);
		if (
			!adapter.resizableSectionClasses?.some((name) => classes.includes(name))
		)
			return null;
		return ([-1, 1] as const).map((direction) => (
			<Box
				key={direction}
				component="button"
				type="button"
				className={`atlas-section__resize-handle ${direction === -1 ? "atlas-section__resize-handle--left" : "atlas-section__resize-handle--right"}`}
				disabled={saving}
				aria-label={`Resize ${section.title}${direction === -1 ? " from left edge" : " from right edge"}`}
				title="Drag to resize. Arrow keys adjust width; Home/End select minimum/full width. Double-click resets to default."
				onPointerDown={(event) => {
					if (pending.current || event.button !== 0 || !event.isPrimary) return;
					const metrics = resizeMetrics(event.currentTarget);
					if (!metrics || metrics.columns < 2) return;
					event.preventDefault();
					event.currentTarget.focus();
					event.currentTarget.setPointerCapture(event.pointerId);
					drag.current = {
						pointerId: event.pointerId,
						startX: event.clientX,
						pitch: metrics.pitch,
						direction,
						columns: metrics.columns,
						startSpan: metrics.span,
						span: metrics.span,
					};
				}}
				onPointerMove={(event) => {
					const current = drag.current;
					if (!current || current.pointerId !== event.pointerId) return;
					const span = Math.max(
						1,
						Math.min(
							current.columns,
							Math.round(
								current.startSpan +
									(current.direction * (event.clientX - current.startX)) /
										current.pitch,
							),
						),
					);
					if (span === current.span) return;
					current.span = span;
					setPreview({ sectionId: section.id, gridSpan: spanValue(span) });
				}}
				onPointerUp={(event) => {
					const current = drag.current;
					if (!current || current.pointerId !== event.pointerId) return;
					drag.current = null;
					if (current.span === current.startSpan) {
						setPreview(null);
						return;
					}
					void changeSpan(section, spanValue(current.span)).finally(() =>
						setPreview(null),
					);
				}}
				onPointerCancel={cancelResize}
				onLostPointerCapture={() => {
					if (drag.current) cancelResize();
				}}
				onDoubleClick={() => {
					void changeSpan(section, "auto");
				}}
				onKeyDown={(event) => {
					if (event.key === "Escape") {
						cancelResize();
						return;
					}
					if (drag.current || pending.current) return;
					const metrics = resizeMetrics(event.currentTarget);
					if (!metrics || metrics.columns < 2) return;
					const span =
						event.key === "ArrowLeft"
							? metrics.span - 1
							: event.key === "ArrowRight"
								? metrics.span + 1
								: event.key === "Home"
									? 1
									: event.key === "End"
										? metrics.columns
										: null;
					if (span === null) return;
					event.preventDefault();
					void changeSpan(
						section,
						event.key === "End"
							? "full"
							: spanValue(Math.max(1, Math.min(metrics.columns, span))),
					);
				}}
			>
				<span aria-hidden="true">⋮</span>
			</Box>
		));
	}

	const visibleContent = preview
		? {
				...currentContent,
				sections: currentContent.sections.map((section) =>
					section.id === preview.sectionId
						? {
								...section,
								wrapper: { ...section.wrapper, gridSpan: preview.gridSpan },
							}
						: section,
				),
			}
		: currentContent;

	return (
		<Box className="atlas-view-container">
			{error ? <Alert severity="error">{error}</Alert> : null}
			<AtlasRenderer
				content={visibleContent}
				context={context}
				className="atlas-view"
				renderSectionControls={renderSectionControls}
			/>
		</Box>
	);
}
