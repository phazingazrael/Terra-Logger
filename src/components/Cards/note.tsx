import { Chip, Card } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link } from "react-router-dom";

import AssignmentIcon from "@mui/icons-material/Assignment";

import type { TLNote } from "../../definitions/TerraLogger";
import { getNoteCategory } from "../atlas/adapters/noteAdapter";

import "./cards.css";

function getNoteTypeClass(type: string): string {
	return type
		.replace(/([a-z])([A-Z])/g, "$1-$2")
		.replace(/[^a-zA-Z0-9_-]+/g, "-")
		.toLowerCase();
}

function NoteCard(props: Readonly<TLNote>) {
	const note = props;
	const category = getNoteCategory(note);
	const noteTypeClass = getNoteTypeClass(category.id);
	return (
		<Card className="note-card" title={note.name}>
			<Link to={`/view_note/${note._id}`} key={`city-${note._id}`}>
				<div className="note-icon">
					<AssignmentIcon sx={{ width: "100%", height: 50 }} />
				</div>
				<Chip
					label={note.name}
					className={`note-name note-type-${noteTypeClass}`}
					style={category.color
						? { backgroundColor: alpha(category.color, 0.37) } : undefined}
				/>
			</Link>
		</Card>
	);
}
export default NoteCard;
