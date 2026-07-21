import { Box } from "@mui/material";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	Fragment,
	type ReactNode,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";

type VirtualizedCardGridProps<T> = {
	items: readonly T[];
	getKey: (item: T, index: number) => string;
	renderItem: (item: T, index: number) => ReactNode;
	estimateRowHeight?: number;
	gap?: number;
	minColumnWidth?: number;
	overscan?: number;
	className?: string;
};

function getColumnCount(width: number, minColumnWidth: number, gap: number) {
	return Math.max(1, Math.floor((width + gap) / (minColumnWidth + gap)));
}

export function VirtualizedCardGrid<T>({
	items,
	getKey,
	renderItem,
	estimateRowHeight = 360,
	gap = 16,
	minColumnWidth = 240,
	overscan = 3,
	className,
}: Readonly<VirtualizedCardGridProps<T>>) {
	const gridRef = useRef<HTMLDivElement | null>(null);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
	const [width, setWidth] = useState(0);
	const [scrollMargin, setScrollMargin] = useState(0);

	useLayoutEffect(() => {
		setScrollElement(document.querySelector<HTMLElement>(".Content"));
	}, []);

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		const updateMeasurements = () => {
			setWidth(grid.clientWidth);
			if (scrollElement) {
				const gridRect = grid.getBoundingClientRect();
				const scrollRect = scrollElement.getBoundingClientRect();
				setScrollMargin(
					gridRect.top - scrollRect.top + scrollElement.scrollTop,
				);
			}
		};

		updateMeasurements();
		const observer = new ResizeObserver(updateMeasurements);
		observer.observe(grid);
		if (scrollElement) observer.observe(scrollElement);
		window.addEventListener("resize", updateMeasurements);

		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateMeasurements);
		};
	}, [scrollElement]);

	const columnCount = useMemo(
		() => getColumnCount(width, minColumnWidth, gap),
		[gap, minColumnWidth, width],
	);
	const rowCount = Math.ceil(items.length / columnCount);

	const virtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => scrollElement,
		estimateSize: () => estimateRowHeight,
		overscan,
		scrollMargin,
		getItemKey: (rowIndex) => {
			const firstItemIndex = rowIndex * columnCount;
			const firstItem = items[firstItemIndex];
			return firstItem
				? `row-${getKey(firstItem, firstItemIndex)}`
				: `row-${rowIndex}`;
		},
	});

	useEffect(() => {
		virtualizer.measure();
	}, [columnCount, items, virtualizer]);

	return (
		<Box
			ref={gridRef}
			className={className}
			sx={{
				position: "relative",
				height: virtualizer.getTotalSize(),
				width: "100%",
			}}
		>
			{virtualizer.getVirtualItems().map((virtualRow) => {
				const startIndex = virtualRow.index * columnCount;
				const rowItems = items.slice(startIndex, startIndex + columnCount);

				return (
					<Box
						key={virtualRow.key}
						ref={virtualizer.measureElement}
						data-index={virtualRow.index}
						sx={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							transform: `translateY(${virtualRow.start - scrollMargin}px)`,
							display: "grid",
							gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
							gap: `${gap}px`,
							paddingBottom: `${gap}px`,
						}}
					>
						{rowItems.map((item, columnIndex) => {
							const itemIndex = startIndex + columnIndex;
							return (
								<Fragment key={getKey(item, itemIndex)}>
									{renderItem(item, itemIndex)}
								</Fragment>
							);
						})}
					</Box>
				);
			})}
		</Box>
	);
}
