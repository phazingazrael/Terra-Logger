import { Chip, Card } from "@mui/material";
import { Link } from "react-router-dom";

import AssignmentIcon from "@mui/icons-material/Assignment";

import type { TLNote } from "../../definitions/TerraLogger";

import "./cards.css";

function getNoteTypeClass(id: string): string {
	return id
		.replace(/\d+|-/g, "")
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.toLowerCase();
}

function NoteCard(props: Readonly<TLNote>) {
	const note = props;
	const noteTypeClass = getNoteTypeClass(note.id);
	return (
		<Card className="note-card" title={note.name}>
			<Link to={`/view_note/${note._id}`} key={`city-${note._id}`}>
				<div className="note-icon">
					<AssignmentIcon sx={{ width: "100%", height: 50 }} />
				</div>
				<Chip
					label={note.name}
					className={`note-name note-type-${noteTypeClass}`}
				/>
			</Link>
		</Card>
	);
}
export default NoteCard;
