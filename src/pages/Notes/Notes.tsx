import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Container,
	Grid2 as Grid,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, Suspense, lazy } from "react";
import { useDB } from "../../db/DataContext";

import { BookLoader } from "../../components/Util";

import type { TLNote } from "../../definitions/TerraLogger";

const NoteCard = lazy(() => import("../../components/Cards/note"));

import "./Notes.css";

function NotesPage() {
	// state management from DBProvider
	const { useActive, activeMapId } = useDB();
	const notes = useActive<TLNote>("notes");

	const idTypes = useMemo(
		() =>
			Array.from(new Set(notes.map((note) => note.id.replace(/\d+|-/g, "")))),
		[notes],
	);

	// On map change, scroll to top
	// biome-ignore lint/correctness/useExhaustiveDependencies: Map change should scroll to top
	useEffect(() => {
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);

	return (
		<Container>
			<div className="contentSubBody NotesPage">
				{/* Loading state while IndexedDB query resolves */}
				{!notes.length ? (
					<BookLoader />
				) : notes.length === 0 ? (
					<div
						className="no-results"
						style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
					>
						<Typography variant="h6" color="text.secondary">
							No results found
						</Typography>
					</div>
				) : (
					<Suspense fallback={<BookLoader />}>
						{idTypes.map((idType) => (
							<Accordion key={idType}>
								<AccordionSummary>
									<Typography
										color="text.secondary"
										className="noteType"
										variant="h5"
									>
										{idType === "burg"
											? "city"
											: idType === "state" || idType === "stateLabel"
												? "country"
												: idType}
									</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Grid container spacing={2} className="noteGrid">
										{notes
											.filter(
												(note) => note.id.replace(/\d+|-/g, "") === idType,
											)
											.map((note) => (
												<Grid size={2} key={note._id + note.name} id={note._id}>
													<NoteCard {...note} />
												</Grid>
											))}
									</Grid>
								</AccordionDetails>
							</Accordion>
						))}
					</Suspense>
				)}
			</div>
		</Container>
	);
}

export default NotesPage;
