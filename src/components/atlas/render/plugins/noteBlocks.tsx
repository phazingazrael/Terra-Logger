import DOMPurify from "dompurify";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { Typography } from "@mui/material";

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
};
