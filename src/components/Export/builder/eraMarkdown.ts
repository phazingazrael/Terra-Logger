import type { TLEraEvent } from "../../../definitions/History";
import type { ExportContext } from "./exportTypes";
import { renderAtlasSectionByLabelToMarkdown, renderEntityDescriptionBodyToMarkdown, renderUnhandledAtlasSectionsToMarkdown } from "./atlasContentMarkdown";
import { readString } from "./markdownUtils";

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
    handledSectionLabels: ["Header", "Overview", "Chronology", "Notable Events", "Notes"],
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
