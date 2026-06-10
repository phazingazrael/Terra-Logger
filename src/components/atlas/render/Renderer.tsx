import type {
	AtlasContent,
	AtlasRenderContext,
} from "../../../definitions/Atlas";
import { isAtlasContent } from "../core/validators";
import { SectionRenderer } from "./SectionRenderer";
import { ClearSectionRenderer } from "./ClearSectionRenderer";

export function AtlasRenderer({
	content,
	context,
}: Readonly<{
	content: AtlasContent;
	context: AtlasRenderContext;
}>) {
	if (!isAtlasContent(content)) {
		return (
			<div>
				<p>Page content is not available yet.</p>
			</div>
		);
	}
	return (
		<div className={`${content.layout.className ?? ""}`.trim()}>
			{content.sections.map((section) => {
				const SectionComponent =
					section.wrapper.variant === "clear"
						? ClearSectionRenderer
						: SectionRenderer;

				return (
					<SectionComponent
						key={section.id}
						section={section}
						context={context}
					/>
				);
			})}
		</div>
	);
}
