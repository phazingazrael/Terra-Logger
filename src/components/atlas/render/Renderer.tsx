import { type ReactNode, useEffect } from "react";
import type {
	AtlasContent,
	AtlasRenderContext,
	AtlasSection,
} from "../../../definitions/Atlas";
import { isAtlasContent } from "../core/validators";
import { SectionRenderer } from "./SectionRenderer";
import { ClearSectionRenderer } from "./ClearSectionRenderer";
import { getVisibleAtlasSection } from "./utils/blockVisibility";

export function AtlasRenderer({
	content,
	context,
	renderSectionControls,
	className,
}: Readonly<{
	content: AtlasContent;
	context: AtlasRenderContext;
	renderSectionControls?: (section: AtlasSection) => ReactNode;
	className?: string;
}>) {
	const validContent = isAtlasContent(content);
	const sectionStates = validContent
		? content.sections.map((section) => ({
				section,
				visibleSection: getVisibleAtlasSection(section, context),
			}))
		: [];
	const rendered = sectionStates.filter((item) => item.visibleSection);
	const skipped = sectionStates.filter((item) => !item.visibleSection);
	const sectionReport = validContent
		? [
				`[Atlas sections] ${context.sourceType}: ${content.meta.title} (${content.source.entityId})`,
				`Rendered (${rendered.length}):`,
				...rendered.map(({ section }, index) => `${index + 1}. ${section.title}`),
				`Skipped (${skipped.length}):`,
				...skipped.map(({ section }) =>
					`- ${section.title}: ${section.editor.collapsed ? "section collapsed" : "no visible blocks"}`,
				),
			].join("\n")
		: "";

	useEffect(() => {
		if (sectionReport) console.log(sectionReport);
	}, [sectionReport]);

	if (!isAtlasContent(content)) {
		return (
			<div>
				<p>Page content is not available yet.</p>
			</div>
		);
	}

	return (
		<div className={`${content.layout.className ?? ""} ${className ?? ""}`.trim()}>
			{sectionStates.map(({ section, visibleSection }) => {
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
						context={{ ...context, section }}
						controls={renderSectionControls?.(section)}
					/>
				);
			})}
		</div>
	);
}
