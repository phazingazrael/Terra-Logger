import type { ReactNode } from "react";
import type {
	AtlasRenderContext,
	AtlasSection,
} from "../../../definitions/Atlas";
import { BlockRenderer } from "./BlockRenderer";
import { Paper, Typography } from "@mui/material";

export function SectionRenderer({
	section,
	context,
	children,
	controls,
}: Readonly<{
	section: AtlasSection;
	context: AtlasRenderContext;
	children?: ReactNode;
	controls?: ReactNode;
}>) {
	return (
		<Paper
			data-grid-span={section.wrapper.gridSpan ?? "auto"}
			className={`atlas-section ${section.wrapper.className ?? ""}`.trim()}
		>
			{controls}
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
					{children}
				</div>
			</section>
		</Paper>
	);
}
