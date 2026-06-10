import { useEffect, useMemo } from "react";
import { Container, Typography, Paper } from "@mui/material";

import { useParams } from "react-router-dom";

import type { TLNote } from "../../definitions/TerraLogger";

import "./viewStyles.css";

import { type AtlasContent, AtlasRenderer } from "../../components/atlas";
import { useDB } from "../../db/DataContext";

function NoteView() {
	const { _id } = useParams<{ _id: string }>();
	// const [note, setNote] = useState<TLNote>();

	const { useActive } = useDB();
	const notes = useActive<TLNote>("notes");
	const note = useMemo(() => notes.find((r) => r._id === _id), [notes, _id]);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	return (
		<Container className="ViewPage Notes">
			<div className="contentSubBody">
				<Paper color="text.secondary">
					<div className="wiki">
						<main className="content">
							<div className="description">
								<div className="header">
									<div className="info">
										<Typography variant="h1">{note?.name}</Typography>
									</div>
								</div>
								<Typography color="text.secondary" component="h2">
									Note Details
								</Typography>
								<AtlasRenderer
									content={note?.content as AtlasContent}
									context={{
										sourceType: "note",
										entity: note as TLNote,
										related: {
											notes,
										},
									}}
								/>
							</div>
						</main>
					</div>
				</Paper>
			</div>
		</Container>
	);
}

export default NoteView;
