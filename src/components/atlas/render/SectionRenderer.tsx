import type {
	AtlasRenderContext,
	AtlasSection,
} from "../../../definitions/Atlas";
import { BlockRenderer } from "./BlockRenderer";
import { Paper, Typography } from "@mui/material";

export function SectionRenderer({
	section,
	context,
}: Readonly<{
	section: AtlasSection;
	context: AtlasRenderContext;
}>) {
	if (section.editor.collapsed) return null;
	return (
		<Paper
			className={`atlas-section ${section.wrapper.className ?? ""}`.trim()}
		>
			<section data-section-id={section.id}>
				<div className="atlas-section__header">
					<Typography color="text.secondary" variant="h2">
						{section.title}
					</Typography>
				</div>
				<div className="atlas-section__blocks">
					{section.blocks.map((block) => (
						<BlockRenderer key={block.id} block={block} context={context} />
					))}
				</div>
			</section>
		</Paper>
	);
}
