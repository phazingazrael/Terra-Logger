import { useEffect, useState } from "react";
import { Container, Typography, Paper } from "@mui/material";

import { useParams } from "react-router-dom";
import { getDataFromStore } from "../../db/interactions";

import type { TLNote } from "../../definitions/TerraLogger";

import "./viewStyles.css";

import DOMPurify from "dompurify";

function NoteView() {
	const { _id } = useParams<{ _id: string }>();
	const [note, setNote] = useState<TLNote>();

	useEffect(() => {
		if (!_id) return;

		getDataFromStore("notes", _id).then((data) => {
			setNote(data as TLNote);
		});
	}, [_id]);

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
								<Typography
									color="text.secondary"
									component="pre"
									className="noteBody"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: html is sanitized
									dangerouslySetInnerHTML={
										{
											__html: DOMPurify.sanitize(note?.legend || ""),
										} as { __html: string }
									}
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
