/** biome-ignore-all lint/a11y/noStaticElementInteractions: I said so */
import type { DragEvent, ReactNode } from "react";
import { useState } from "react";
import "../styles/dnd.css";

const BLOCK_DRAG_TYPE = "application/x-atlas-block-index";

type SortableRenderProps = {
	dragHandleProps: {
		type: "button";
		draggable: boolean;
		disabled: boolean;
		title: string;
		"aria-label": string;
		className: string;
		onDragStart: (event: DragEvent<HTMLButtonElement>) => void;
		onDragEnd: () => void;
	};
	stateClassName: string;
};

type BlockSortableProps = {
	index: number;
	reorderable: boolean;
	onMove: (fromIndex: number, toIndex: number) => void;
	children: (props: SortableRenderProps) => ReactNode;
};

export function BlockSortable({
	index,
	reorderable,
	onMove,
	children,
}: BlockSortableProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isDragOver, setIsDragOver] = useState(false);

	function handleDragStart(event: DragEvent<HTMLButtonElement>) {
		if (!reorderable) {
			event.preventDefault();
			return;
		}

		event.dataTransfer.effectAllowed = "move";
		event.dataTransfer.setData(BLOCK_DRAG_TYPE, String(index));
		setIsDragging(true);
	}

	function handleDragOver(event: DragEvent<HTMLDivElement>) {
		if (!reorderable) return;

		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
		setIsDragOver(true);
	}

	function handleDragLeave(event: DragEvent<HTMLDivElement>) {
		const nextTarget = event.relatedTarget;

		if (
			nextTarget instanceof Node &&
			event.currentTarget.contains(nextTarget)
		) {
			return;
		}

		setIsDragOver(false);
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setIsDragOver(false);

		const rawIndex = event.dataTransfer.getData(BLOCK_DRAG_TYPE);
		const fromIndex = Number(rawIndex);

		if (!Number.isInteger(fromIndex)) return;
		if (fromIndex === index) return;

		onMove(fromIndex, index);
	}

	function handleDragEnd() {
		setIsDragging(false);
		setIsDragOver(false);
	}

	const stateClassName = [
		"atlas-dnd-sortable",
		isDragging ? "atlas-dnd-sortable--dragging" : "",
		isDragOver ? "atlas-dnd-sortable--over" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className={stateClassName}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{children({
				stateClassName,
				dragHandleProps: {
					type: "button",
					draggable: reorderable,
					disabled: !reorderable,
					title: reorderable
						? "Drag to reorder block"
						: "This block cannot be reordered",
					"aria-label": "Drag to reorder block",
					className: "atlas-dnd-handle",
					onDragStart: handleDragStart,
					onDragEnd: handleDragEnd,
				},
			})}
		</div>
	);
}
