import DOMPurify from "dompurify";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { Typography } from "@mui/material";
import type { TLNote } from "../../../../definitions/TerraLogger";

export const noteBlockPlugins: Record<string, AtlasBlockPlugin> = {
	noteLegend: {
		type: "noteLegend",
		label: "Note Legend",
		Render: ({ context }) => {
			const note = context.entity as { legend?: string };
			return (
				<Typography
					color="text.secondary"
					component="pre"
					className="noteBody"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: html is sanitized
					dangerouslySetInnerHTML={{
						__html: DOMPurify.sanitize(note?.legend || ""),
					}}
				/>
			);
		},
	},
	noteHeader: {
		type: "noteHeader",
		label: "Note Header",
		Render: ({ context }) => {
			const note = context.entity as TLNote;

			return (
				<div className="header">
					<div className="info">
						<Typography variant="h1">{note?.name}</Typography>
					</div>
				</div>
			);
		},
	},
};
