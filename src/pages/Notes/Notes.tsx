import { AppBar, Button, Chip, Container, Typography } from "@mui/material";
import {
	lazy,
	Suspense,
	useDeferredValue,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import { BookLoader } from "../../components/Util";
import { VirtualizedCardGrid } from "../../components/Virtualized";
import { useDB } from "../../db/DataContext";

import type { TLNote } from "../../definitions/TerraLogger";

const NoteCard = lazy(() => import("../../components/Cards/note"));

import "./Notes.css";

type NoteTypeOption = {
	id: string;
	label: string;
	count: number;
};

function getNoteType(note: TLNote): string {
	return note.id.replace(/\d+|-/g, "") || note.type || "other";
}

function formatNoteType(type: string): string {
	if (type === "burg") return "City";
	if (type === "state" || type === "stateLabel") return "Country";

	return type
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.replace(/^./, (character) => character.toUpperCase());
}

function NotesPage() {
	const { useActive, activeMapId } = useDB();
	const notes = useActive<TLNote>("notes");

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState<string | null>(null);
	const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());
	const filterKey = `${activeMapId ?? "no-map"}:${selectedType ?? "all"}:${deferredQuery}`;

	const noteTypes = useMemo<NoteTypeOption[]>(() => {
		const counts = new Map<string, number>();

		for (const note of notes) {
			const type = getNoteType(note);
			counts.set(type, (counts.get(type) ?? 0) + 1);
		}

		return Array.from(counts, ([id, count]) => ({
			id,
			label: formatNoteType(id),
			count,
		})).sort((a, b) => a.label.localeCompare(b.label));
	}, [notes]);

	const filteredNotes = useMemo(() => {
		return notes.filter((note) => {
			if (selectedType && getNoteType(note) !== selectedType) return false;

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

			<div className="contentSubBody NotesPage">
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
