import type { TLDevelopmentalEra, TLEraEvent } from "../../../definitions/History";
import { developmentalPlacementSubject, developmentalPlacementsForEntity, historicalYearLabel } from "../../HistoryGenerator/eras/mapEras";
import type { TLCity, TLCountry } from "../../../definitions/TerraLogger";
import type { ExportContext, MarkdownBlock } from "./exportTypes";
import { renderAtlasSectionByLabelToMarkdown, renderEntityDescriptionBodyToMarkdown, renderUnhandledAtlasSectionsToMarkdown } from "./atlasContentMarkdown";
import { exportDocumentLink, markdownTable, readString } from "./markdownUtils";

function markdownTimeline(
  entries: Array<{ year: number; dateText?: string; name: string; details?: string }>,
  yearLabel: (year: number) => string,
  headingLevel = 3,
): string {
  const dates = new Map<string, { label: string; entries: typeof entries }>();
  // Sort whole years; retain saved order when dates within a year cannot be compared.
  for (const entry of [...entries].sort((left, right) => left.year - right.year)) {
    const dateText = entry.dateText?.replace(/\s+/g, " ").trim() ?? "";
    const key = JSON.stringify([entry.year, dateText]);
    const group = dates.get(key) ?? {
      label: [yearLabel(entry.year), dateText].filter(Boolean).join(" — "), entries: [],
    };
    group.entries.push(entry);
    dates.set(key, group);
  }
  return [...dates.values()].map((group) => [
    `${"#".repeat(headingLevel)} ${group.label}`,
    group.entries.map((entry) => [
      `- **${entry.name.replace(/\r?\n/g, " ")}**`,
      entry.details ? `\n${entry.details.split(/\r?\n/).map((line) => line ? `  ${line}` : "").join("\n")}` : "",
    ].filter(Boolean).join("\n")).join("\n\n"),
  ].join("\n\n")).join("\n\n");
}

export function renderEraSection(context: ExportContext, label: string, className: string): string {
  const authored = renderAtlasSectionByLabelToMarkdown({
    ...context, labels: [label, className],
  }).replace(/^#{1,6}\s+[^\n]*(?:\n|$)/, "").trim();
  if (className !== "section notable-events") return authored;
  return [renderEraEvents(context), authored].filter(Boolean).join("\n\n");
}

export function renderEraEvents(context: ExportContext): string {
  const events = Array.isArray(context.entity.events) ? context.entity.events as TLEraEvent[] : [];
  return markdownTimeline(events.map((event) => {
    const sources = (event.npcHistory ?? []).map((link) => {
      const npc = context.data.NPCs.find((item) => item._id === link.npcId);
      const entry = npc?.history.find((item) => item.id === link.entryId);
      return npc && entry ? `${exportDocumentLink(context, "npc", npc._id, npc.name)}: ${entry.title}` : "Source NPC history unavailable";
    });
    return {
      year: event.year, dateText: event.dateText, name: event.name,
      details: [event.description, sources.length ? `NPC history: ${sources.join("; ")}` : ""].filter(Boolean).join("\n\n"),
    };
  }), (year) => `Year ${year} ${readString(context.entity, "shortName")}`.trim());
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
  // Notable events have their own timeline; use boundaries only when none exist.
  if (Array.isArray(entity.events) && entity.events.length) return "";
  const name = readString(entity, "name");
  const shortName = readString(entity, "shortName");
  return markdownTimeline([
    { year: Number(entity.firstYear), name: `Beginning of ${name}` },
    { year: Number(entity.finalYear), name: entity.status === "current" ? "Present (ongoing)" : `End of ${name}` },
  ], (year) => `Year ${year} ${shortName}`.trim());
}

export function getDevelopmentalEraBlocks(): MarkdownBlock[] {
  return [{
    id: "developmentalEra.document",
    render(context) {
      const era = context.entity as unknown as TLDevelopmentalEra;
      const boti = context.templateId === "boti";
      const frontmatter = [
        "---",
        ...(boti ? ['BANNER: "[[Lore-Banner.jpg]]"', "NoteIcon: Lore"] : []),
        `${boti ? "Type" : "type"}: ${boti ? "Developmental Era" : "developmental-era"}`,
        `${boti ? "Name" : "name"}: ${JSON.stringify(era.name)}`,
        `${boti ? "Level" : "level"}: ${era.level}`,
        `${boti ? "Active" : "active"}: ${era.active}`,
        `map_id: ${JSON.stringify(era.mapId)}`,
        `created_at: ${JSON.stringify(era.createdAt)}`,
        `updated_at: ${JSON.stringify(era.updatedAt)}`,
        `estimate_basis_start_year: ${era.estimateBasis.startYear}`,
        `estimate_basis_end_year: ${era.estimateBasis.endYear}`,
        ...(era.source ? [
          `source_level: ${era.source.level}`,
          `source_name: ${JSON.stringify(era.source.name)}`,
          `source_present: ${era.source.present}`,
        ] : []),
        ...(boti ? ["tags: []"] : []),
        "---",
      ].join("\n");
      const section = (title: string, body: string) => boti
        ? `> [!${title === "Notes" ? "notes" : "history"}]- ${title}\n${body.split(/\r?\n/).map((line) => line ? `> ${line}` : ">").join("\n")}`
        : `## ${title}\n\n${body}`;
      const details = [renderDevelopmentalEraDates(context),
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

/** Keep complete data in the document while limiting rendered BotI rows. */
function paginatedDevelopmentTable(headers: string[], rows: Array<Array<string | string[]>>): string {
  if (!rows.length) return "None.";
  // Prevent authored names from closing the Markdown code fence.
  const data = JSON.stringify(rows).replace(/`/g, "\\u0060");
  return [
    "\x60\x60\x60dataviewjs",
    `const headers = ${JSON.stringify(headers)};`,
    `const rows = ${data};`,
    "const pageSize = 20; let page = 0;",
    'const root = dv.el("div", "");',
    'const controls = root.createEl("div");',
    'const previous = controls.createEl("button", { text: "Previous" });',
    'const status = controls.createEl("span");',
    'status.setAttribute("aria-live", "polite");',
    'const next = controls.createEl("button", { text: "Next" });',
    'const content = root.createEl("div");',
    "function renderPage() {",
    "  const pages = Math.max(1, Math.ceil(rows.length / pageSize));",
    '  status.textContent = " Page " + (page + 1) + " of " + pages + " · " + rows.length + " rows ";',
    "  previous.disabled = page === 0; next.disabled = page >= pages - 1;",
    "  content.replaceChildren();",
    '  const table = content.createEl("table");',
    '  const heading = table.createEl("thead").createEl("tr");',
    '  for (const title of headers) heading.createEl("th", { text: title, attr: { scope: "col" } });',
    '  const body = table.createEl("tbody");',
    "  for (const row of rows.slice(page * pageSize, (page + 1) * pageSize)) {",
    '    const line = body.createEl("tr");',
    '    for (const value of row) dv.el("span", value, { container: line.createEl("td") });',
    "  }",
    "}",
    'previous.addEventListener("click", () => { if (page > 0) { page--; renderPage(); } });',
    'next.addEventListener("click", () => { if ((page + 1) * pageSize < rows.length) { page++; renderPage(); } });',
    "renderPage();",
    "\x60\x60\x60",
  ].join("\n");
}

export function renderDevelopmentalEraDates(context: ExportContext): string {
  const era = context.entity as unknown as TLDevelopmentalEra;
  const boti = context.templateId === "boti";
  const year = (value: number) => historicalYearLabel(value, context.data.Eras ?? []);
  const subject = (placement: TLDevelopmentalEra["placements"][number]) =>
    developmentalPlacementSubject(placement, context.data.Cities, context.data.Countries);
  const dateHeaders = ["Placement", "Association", "Start", "End", "Dating"];
  const dateRows = era.placements.map((placement, index) => [
    String(index + 1), subject(placement), year(placement.startYear), year(placement.endYear), placement.estimated ? "Estimated" : "Manual",
  ]);
  const events = era.placements.flatMap((placement, index) => {
    const association = subject(placement);
    const details = `Period ${index + 1} · ${placement.estimated ? "Estimated" : "Manual"} dating · ${year(placement.startYear)} – ${year(placement.endYear)}`;
    return placement.startYear === placement.endYear
      ? [{ year: placement.startYear, name: `${association} — ${era.name} recorded for this year`, details }]
      : [
        { year: placement.startYear, name: `${association} entered ${era.name}`, details },
        { year: placement.endYear, name: `${association} left ${era.name}`, details },
      ];
  });
  const grouped = new Map<number, string[]>();
  for (const event of [...events].sort((left, right) => left.year - right.year)) {
    const entries = grouped.get(event.year) ?? [];
    entries.push(`${event.name} — ${event.details}`);
    grouped.set(event.year, entries);
  }
  const timeline = boti
    ? paginatedDevelopmentTable(["Date", "Events"], [...grouped].map(([date, entries]) => [year(date), entries]))
    : markdownTimeline(events, year, 4);
  const inherited = new Map<string, string[]>();
  for (const city of context.data.Cities) {
    for (const placement of developmentalPlacementsForEntity(era, city, "city")) {
      if (placement.subject?.type !== "country") continue;
      const cities = inherited.get(placement.id) ?? [];
      cities.push(exportDocumentLink(context, "city", city._id, city.name));
      inherited.set(placement.id, cities);
    }
  }
  const countryPeriods = era.placements.filter((placement) => placement.subject?.type === "country");
  const inheritedBody = boti
    ? paginatedDevelopmentTable(["Country period", "City"], countryPeriods.flatMap((placement) =>
      (inherited.get(placement.id) ?? ["None."]).map((city) => [
        `${subject(placement)} · ${year(placement.startYear)} – ${year(placement.endYear)}`, city,
      ])))
    : countryPeriods.map((placement) => [
      `#### Cities inheriting ${subject(placement)} (${year(placement.startYear)} – ${year(placement.endYear)})`,
      (inherited.get(placement.id) ?? []).map((city) => `- ${city}`).join("\n") || "None.",
    ].join("\n\n")).join("\n\n");
  return [
    "### Development Summary",
    `**Development threshold:** ${era.level} · ${era.active && era.placements.length ? "Active" : "Inactive"}`,
    "Regional adoption dates are independent of current cell development. City periods replace inherited Country periods for this developmental era. Unassigned periods do not imply worldwide adoption.",
    `**Historical span recorded at creation:** ${year(era.estimateBasis.startYear)} – ${year(era.estimateBasis.endYear)}`,
    ...(boti && era.placements.length ? ["*These tables show 20 rows per page. Enable JavaScript queries in Dataview settings to use them.*"] : []),
    "### Dated Placements",
    dateRows.length ? boti ? paginatedDevelopmentTable(dateHeaders, dateRows) : markdownTable(dateHeaders, dateRows) : "No dated placements.",
    events.length ? `### Timeline\n\n${timeline}` : "",
    countryPeriods.length ? `### Inherited Cities\n\n${inheritedBody}` : "",
  ].filter(Boolean).join("\n\n");
}
