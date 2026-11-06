import { Typography } from "@mui/material";
import { BlockRenderer } from "./BlockRenderer";
import type {
	AtlasRenderContext,
	AtlasSection,
} from "../../../definitions/Atlas";

export function ClearSectionRenderer({
	section,
	context,
}: Readonly<{
	section: AtlasSection;
	context: AtlasRenderContext;
}>) {
	return (
		<div
			className={`atlas-section clear ${section.wrapper.className ?? ""}`.trim()}
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
		</div>
	);
}
