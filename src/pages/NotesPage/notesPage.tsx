import { AppBar, Button, Chip, Container, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { getNoteCategory } from "../../components/atlas/adapters/noteAdapter";
import {
	lazy,
	Suspense,
	useDeferredValue,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import BookLoader from "../../components/Util/bookLoader";
import { VirtualizedCardGrid } from "../../components/Virtualized";
import { useActive, useDB } from "../../db/DataContext";

import type { TLNote } from "../../definitions/TerraLogger";

const NoteCard = lazy(() => import("../../components/Cards/note"));

import "./notesPage.css";

type NoteTypeOption = {
	id: string;
	label: string;
	count: number;
	color?: string;
};

function NotesPage() {
	const { activeMapId } = useDB();
	const notes = useActive<TLNote>("notes");

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());
	const filterKey = `${activeMapId ?? "no-map"}:${selectedType ?? "all"}:${deferredQuery}`;

	const noteTypes = useMemo<NoteTypeOption[]>(() => {
		const counts = new Map<string, NoteTypeOption>();

		for (const note of notes) {
			const category = getNoteCategory(note);
			const existing = counts.get(category.id);
			if (existing) existing.count += 1;
			else counts.set(category.id, { ...category, count: 1 });
		}

		return Array.from(counts.values())
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [notes]);

	const filteredNotes = useMemo(() => {
		return notes.filter((note) => {
			if (selectedType && getNoteCategory(note).id !== selectedType) return false;

			if (deferredQuery) {
				const searchableText =
					`${note.name ?? ""} ${note.legend ?? ""}`.toLowerCase();
				if (!searchableText.includes(deferredQuery)) return false;
			}

			return true;
		});
	}, [deferredQuery, notes, selectedType]);

	// Reset filters and scroll position whenever the active map changes.
	// biome-ignore lint/correctness/useExhaustiveDependencies: activeMapId intentionally controls the reset
	useEffect(() => {
		setSearchQuery("");
		setSelectedType(null);
		document.querySelector<HTMLElement>(".Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);

	// A selected type can disappear after a note update or map data refresh.
	useEffect(() => {
		if (selectedType && !noteTypes.some((type) => type.id === selectedType)) {
			setSelectedType(null);
		}
	}, [noteTypes, selectedType]);

	// Filtering can leave the shared virtualizer at an offset that no longer
	// exists in the smaller result set. Reset before paint and remount the grid
	// through filterKey so stale row measurements cannot produce blank bands.
	// biome-ignore lint/correctness/useExhaustiveDependencies: filterKey intentionally controls the reset
	useLayoutEffect(() => {
		document.querySelector<HTMLElement>(".Content")?.scrollTo({ top: 0 });
	}, [filterKey]);

	const resetFilters = () => {
		setSearchQuery("");
		setSelectedType(null);
	};

	return (
		<Container>
			<div className="contentSubBody NotesPage">
				<AppBar position="sticky" color="default">
					<div className="notes-filter-container">
						<div className="notes-filter-row">
							<input
								className="notes-search-input"
								placeholder="Search Notes..."
								type="search"
								value={searchQuery}
								onChange={(event) => setSearchQuery(event.target.value)}
							/>
							<Button variant="contained" color="error" onClick={resetFilters}>
								Reset Filters
							</Button>
						</div>

						<div className="note-type-chips">
							{noteTypes.map((type) => (
								<Chip
									clickable
									key={type.id}
									className={selectedType === type.id ? "selected" : ""}
									style={type.color ? {
										backgroundColor: selectedType === type.id
											? type.color : alpha(type.color, 0.25),
									} : undefined}
									label={`${type.label} (${type.count})`}
									onClick={() =>
										setSelectedType((current) =>
											current === type.id ? null : type.id,
										)
									}
								/>
							))}
						</div>
					</div>
				</AppBar>
				{!notes.length ? (
					<BookLoader />
				) : filteredNotes.length === 0 ? (
					<div className="no-results">
						<Typography variant="h6" color="text.secondary">
							No notes match the selected filters
						</Typography>
					</div>
				) : (
					<Suspense fallback={<BookLoader />}>
						<VirtualizedCardGrid
							key={filterKey}
							items={filteredNotes}
							getKey={(note) => note._id}
							renderItem={(note) => (
								<div id={note._id}>
									<NoteCard {...note} />
								</div>
							)}
							minColumnWidth={180}
							estimateRowHeight={300}
						/>
					</Suspense>
				)}
			</div>
		</Container>
	);
}

export default NotesPage;
