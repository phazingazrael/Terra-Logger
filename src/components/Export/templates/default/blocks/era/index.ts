import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderEraAdditionalSections, renderEraOverview, renderEraSection, renderEraTimeline } from "../../../../builder/eraMarkdown";
import { readString } from "../../../../builder/markdownUtils";

const frontmatter: MarkdownBlock = {
  id: "default.era.frontmatter",
  render: ({ entity }) => [
    "---",
    "type: era",
    `name: ${JSON.stringify(readString(entity, "name"))}`,
    `short_name: ${JSON.stringify(readString(entity, "shortName"))}`,
    `status: ${JSON.stringify(readString(entity, "status"))}`,
    `terra_id: ${JSON.stringify(readString(entity, "_id"))}`,
    `map_id: ${JSON.stringify(readString(entity, "mapId"))}`,
    `first_year: ${entity.firstYear}`,
    `final_year: ${entity.finalYear}`,
    `duration_years: ${entity.length}`,
    "---",
  ].join("\n"),
};

const mainContent: MarkdownBlock = {
  id: "default.era.mainContent",
  render(context) {
    const { entity } = context;
    const overview = renderEraOverview(context);
    const chronology = renderEraSection(context, "Chronology", "section era-chronology");
    const events = renderEraSection(context, "Notable Events", "section notable-events");
    const notes = renderEraSection(context, "Notes", "section editor-notes");
    return [
      `# ${readString(entity, "name")}`,
      "## Overview",
      overview,
      "## Timeline",
      renderEraTimeline(context),
      entity.status === "current" ? "Ongoing — the final recorded year is the present year." : "Concluded — the final year is the end of this era.",
      chronology,
      "## Notable Events",
      events,
      "## Notes",
      notes,
      renderEraAdditionalSections(context),
    ].filter(Boolean).join("\n\n");
  },
};

export function getDefaultEraBlocks(): MarkdownBlock[] {
  return [frontmatter, mainContent];
}
