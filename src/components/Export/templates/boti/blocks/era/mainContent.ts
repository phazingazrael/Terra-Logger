import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { renderEraAdditionalSections, renderEraOverview, renderEraSection } from "../../../../builder/eraMarkdown";

function callout(type: string, title: string, body: string): string {
  return `> [!${type}]- ${title}\n${body.split(/\r?\n/).map((line) => line ? `> ${line}` : ">").join("\n")}`;
}

export const botiEraMainContentBlock: MarkdownBlock = {
  id: "boti.era.mainContent",
  render(context) {
    const chronology = [
      "**Beginning:** Year `=this.FirstYear` `=this.ShortName`",
      "**Present / Final Recorded Year:** Year `=this.FinalYear` `=this.ShortName`",
      "**Recorded Duration:** `=this.Length` years (inclusive)",
      context.entity.status === "current"
        ? "Ongoing — the final recorded year is the present year."
        : "Concluded — the final year is the end of this era.",
      renderEraSection(context, "Chronology", "section era-chronology"),
    ].filter(Boolean).join("\n\n");
    return [
      "# `=this.Name`",
      callout("overview", "Overview", renderEraOverview(context)),
      callout("history", "Chronology", chronology),
      callout("story", "Notable Events", renderEraSection(context, "Notable Events", "section notable-events")),
      callout("notes", "Notes", renderEraSection(context, "Notes", "section editor-notes")),
      renderEraAdditionalSections(context),
    ].filter(Boolean).join("\n\n");
  },
};
