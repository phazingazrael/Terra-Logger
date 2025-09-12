import { useEffect, useState, } from "react";
import { Container, Typography, Paper } from "@mui/material";

import { useParams } from "react-router-dom";
import { getDataFromStore } from "../../db/interactions";

import type { TLNote } from "../../definitions/TerraLogger";

import "./viewStyles.css";

import DOMPurify from "dompurify";

function NoteView() {
  const noteId = useParams();
  const [note, setNote] = useState<TLNote>();

  useEffect(() => {
    if (noteId !== undefined) {
      getDataFromStore("notes", noteId._id).then((data) => {
        setNote(data as TLNote);
      });
    }
  }, [noteId]);

  return (
    <Container className="Notes">
      <div className="contentSubBody">
        <Paper color="text.secondary">
        <div className="wiki">
          <main className="content">
            <div className="description">

              <div className="header">
                <div className="info">
                  <Typography variant="h1">
                    {note?.name}
                  </Typography>
                </div>
              </div>
              <Typography color="text.secondary" component="h2">
                Note Details
              </Typography>
              <Typography color="text.secondary" component="pre" className="noteBody"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(note?.legend || '')
                } as { __html: string }}
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
