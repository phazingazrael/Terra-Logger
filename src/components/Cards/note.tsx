import {
  Chip,

} from "@mui/material";
import { Link } from "react-router-dom";

import AssignmentIcon from '@mui/icons-material/Assignment';

import type { TLNote } from "../../definitions/TerraLogger";

import "./cards.css";


function NoteCard(props: Readonly<TLNote>) {
  const note = props;

  return (
      <div className="note-card" title={note.name}>
        <Link to={`/view_note/${note._id}`} key={`city-${note._id}`}>
          <div className="note-icon">
            <AssignmentIcon sx={{ width: "100%", height: 50 }} />
          </div>
          <Chip label={note.name} className="note-name" />
        </Link>
      </div>
  );
}
export default NoteCard;

