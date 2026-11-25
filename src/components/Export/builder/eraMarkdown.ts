import type { TLDevelopmentalEra, TLEraEvent } from "../../../definitions/History";
import { developmentalPlacementSubject, historicalYearLabel } from "../../HistoryGenerator/eras/mapEras";
import type { TLCity, TLCountry } from "../../../definitions/TerraLogger";
import type { ExportContext, MarkdownBlock } from "./exportTypes";
import { renderAtlasSectionByLabelToMarkdown, renderEntityDescriptionBodyToMarkdown, renderUnhandledAtlasSectionsToMarkdown } from "./atlasContentMarkdown";
import { markdownTable, readString } from "./markdownUtils";

function mermaidTimeline(rows: string[][]): string {
  if (!rows.length) return "";
  const entities: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", ":": "&colon;",
    "#": "&num;", "%": "&percnt;", "`": "&grave;",
  };
  const label = (value: string) => value.replace(/\s+/g, " ").trim()
    .replace(/[&<>:#%`]/g, (character) => entities[character]);
  return ["```mermaid", "timeline", ...rows.map(([time, event]) =>
    `    ${label(time)} : ${label(event)}`), "```"].join("\n");
}

export function renderEraSection(context: ExportContext, label: string, className: string): string {
  const authored = renderAtlasSectionByLabelToMarkdown({
    ...context, labels: [label, className],
  }).replace(/^#{1,6}\s+[^\n]*(?:\n|$)/, "").trim();
  if (className !== "section notable-events") return authored;
  const events = Array.isArray(context.entity.events) ? context.entity.events as TLEraEvent[] : [];
  const timeline = mermaidTimeline(events.map((event) => [
    `Year ${event.year} ${readString(context.entity, "shortName")}${event.dateText ? ` — ${event.dateText}` : ""}`, event.name,
  ]));
  const descriptions = events.map((event) => {
    const sources = (event.npcHistory ?? []).map((link) => {
      const npc = context.data.NPCs.find((item) => item._id === link.npcId);
      const entry = npc?.history.find((item) => item.id === link.entryId);
      return npc && entry ? `${npc.name}: ${entry.title}` : "Source NPC history unavailable";
    });
    const details = [event.description, sources.length ? `NPC history: ${sources.join("; ")}` : ""].filter(Boolean).join("\n");
    return [
      `### ${event.name.replace(/\r?\n/g, " ")}`,
      `Year ${event.year} ${readString(context.entity, "shortName")}${event.dateText ? ` — ${event.dateText}` : ""}`,
      details,
    ].filter(Boolean).join("\n\n");
  }).join("\n\n");
  return [timeline, descriptions, authored].filter(Boolean).join("\n\n");
}

export function renderEraOverview(context: ExportContext): string {
  return renderEraSection(context, "Overview", "section description") ||
    (readString(context.entity, "description") ? renderEntityDescriptionBodyToMarkdown(context) : "");
}

export function renderEraAdditionalSections(context: ExportContext): string {
  return renderUnhandledAtlasSectionsToMarkdown({
    ...context,
    handledSectionLabels: ["Header", "Overview", "Chronology", "Development & Dates", "Notable Events", "Notes"],
    handledSectionClassNames: ["section header", "section description", "section era-chronology", "section notable-events", "section editor-notes"],
  });
}

export function renderEraTimeline({ entity }: ExportContext): string {
  const firstYear = readString(entity, "firstYear");
  const finalYear = readString(entity, "finalYear");
  const shortName = readString(entity, "shortName");
  const name = readString(entity, "name");
  const ongoing = entity.status === "current";
  const beginning = `Beginning of ${name}`;
  const ending = ongoing ? "Present (ongoing)" : `End of ${name}`;
  const date = (year: string) => `${year} ${shortName}`.trim();
  const rows = firstYear === finalYear
    ? [[date(firstYear), `${beginning}; ${ending}`]]
    : [[date(firstYear), beginning], [date(finalYear), ending]];
  return mermaidTimeline(rows);
}

export function getDevelopmentalEraBlocks(): MarkdownBlock[] {
  return [{
    id: "developmentalEra.document",
    render(context) {
      const era = context.entity as unknown as TLDevelopmentalEra;
      const boti = context.templateId === "boti";
      const year = (value: number) => historicalYearLabel(value, context.data.Eras ?? []);
      const frontmatter = [
        "---",
        ...(boti ? ['BANNER: "[[Lore-Banner.jpg]]"', "NoteIcon: Lore"] : []),
        `${boti ? "Type" : "type"}: ${boti ? "Developmental Era" : "developmental-era"}`,
        `${boti ? "Name" : "name"}: ${JSON.stringify(era.name)}`,
        `${boti ? "Level" : "level"}: ${era.level}`,
        `${boti ? "Active" : "active"}: ${era.active}`,
        `terra_id: ${JSON.stringify(era._id)}`,
        `map_id: ${JSON.stringify(era.mapId)}`,
        `created_at: ${JSON.stringify(era.createdAt)}`,
        `updated_at: ${JSON.stringify(era.updatedAt)}`,
        `estimate_basis: ${JSON.stringify(era.estimateBasis)}`,
        `placements: ${JSON.stringify(era.placements)}`,
        ...(era.source ? [`afmg_source: ${JSON.stringify(era.source)}`] : []),
        ...(boti ? ["tags: []"] : []),
        "---",
      ].join("\n");
      const section = (title: string, body: string) => boti
        ? `> [!${title === "Notes" ? "notes" : "history"}]- ${title}\n${body.split(/\r?\n/).map((line) => line ? `> ${line}` : ">").join("\n")}`
        : `## ${title}\n\n${body}`;
      const subject = (placement: TLDevelopmentalEra["placements"][number]) =>
        developmentalPlacementSubject(placement, context.data.Cities, context.data.Countries);
      const dates = markdownTable(["Placement", "Association", "Start", "End", "Dating"], era.placements.map((placement, index) => [
        String(index + 1), subject(placement), year(placement.startYear), year(placement.endYear), placement.estimated ? "Estimated" : "Manual",
      ]));
      const timeline = mermaidTimeline(era.placements.flatMap((placement, index) => placement.startYear === placement.endYear
        ? [[year(placement.startYear), `Placement ${index + 1} · ${subject(placement)}`]]
        : [[year(placement.startYear), `Placement ${index + 1} · ${subject(placement)} begins`], [year(placement.endYear), `Placement ${index + 1} · ${subject(placement)} ends`]]));
      const details = [
        `**Development threshold:** ${era.level} · ${era.active ? "Active" : "Inactive"}`,
        "Regional adoption dates are independent of current cell development. City periods replace inherited Country periods for this developmental era. Unassigned periods do not imply worldwide adoption.",
        `**Historical span recorded at creation:** ${year(era.estimateBasis.startYear)} – ${year(era.estimateBasis.endYear)}`,
        dates || "No dated placements.",
        timeline,
        renderEraSection(context, "Development & Dates", "section era-chronology"),
      ].filter(Boolean).join("\n\n");
      return [
        frontmatter,
        `# ${era.name.replace(/\r?\n/g, " ")}`,
        section("Overview", renderEraOverview(context)),
        section("Development & Dates", details),
        section("Notes", renderEraSection(context, "Notes", "section editor-notes")),
        renderEraAdditionalSections(context),
      ].filter(Boolean).join("\n\n");
    },
  }];
}

export function renderDevelopmentSummary(context: ExportContext): string {
  if (context.sourceType !== "city" && context.sourceType !== "country") return "";
  const development = (context.entity as unknown as TLCity | TLCountry).development;
  if (!development) return "";
  const name = development.eraName ?? "Unclassified";
  const target = development.eraId ? context.developmentalEraPaths?.[development.eraId] : undefined;
  let label = name;
  if (target && context.documentPath) {
    const from = context.documentPath.split("/").slice(0, -1);
    const to = target.split("/");
    while (from.length && to.length && from[0] === to[0]) { from.shift(); to.shift(); }
    const relative = [...from.map(() => ".."), ...to].map(encodeURIComponent).join("/");
    label = `[${name.replace(/[[\]\r\n]/g, " ")}](${relative})`;
  }
  const body = [
    `${label} (level ${Number(development.level.toFixed(2))})`,
    context.sourceType === "country" ? "Mean of populated map cells; individual Cities may be in different developmental eras." : "",
  ].filter(Boolean).join("\n\n");
  return context.templateId === "boti"
    ? `> [!history]- Development\n${body.split("\n").map((line) => line ? `> ${line}` : ">").join("\n")}`
    : `## Development\n\n${body}`;
}
