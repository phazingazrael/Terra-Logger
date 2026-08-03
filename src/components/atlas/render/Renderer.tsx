import type {
	AtlasContent,
	AtlasRenderContext,
} from "../../../definitions/Atlas";
import { isAtlasContent } from "../core/validators";
import { SectionRenderer } from "./SectionRenderer";
import { ClearSectionRenderer } from "./ClearSectionRenderer";
import { getVisibleAtlasSection } from "./utils/blockVisibility";

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
				const visibleSection = getVisibleAtlasSection(section, context);

				if (!visibleSection) {
					return null;
				}

				const SectionComponent =
					visibleSection.wrapper.variant === "clear"
						? ClearSectionRenderer
						: SectionRenderer;

				return (
					<SectionComponent
						key={visibleSection.id}
						section={visibleSection}
						context={context}
					/>
				);
			})}
		</div>
	);
}
