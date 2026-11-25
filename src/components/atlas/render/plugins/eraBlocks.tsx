import { Box, Chip, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { TLCity, TLNPC } from "../../../../definitions/TerraLogger";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { developmentalPlacementSubject, developmentalPlacementsForEntity, historicalYearLabel } from "../../../HistoryGenerator/eras/mapEras";
import type { TLDevelopmentalEra, TLMapEra } from "../../../../definitions/History";

export const eraBlockPlugins: Record<string, AtlasBlockPlugin> = {
  developmentalEraHeader: {
    type: "developmentalEraHeader", label: "Developmental Era",
    Render: ({ context }) => {
      if (context.sourceType !== "developmentalEra") return null;
      const era = context.entity as TLDevelopmentalEra;
      return <div className="header"><div className="info">
        <Typography variant="h1">{era.name}</Typography>
        <Chip size="small" label={era.active && era.placements.length ? "Active developmental era" : "Inactive developmental era"} />
        <Typography color="text.secondary">Development threshold: {era.level}</Typography>
      </div></div>;
    },
  },
  developmentalEraPlacements: {
    type: "developmentalEraPlacements", label: "Development & Dates",
    Render: ({ context }) => {
      if (context.sourceType !== "developmentalEra") return null;
      const era = context.entity as TLDevelopmentalEra;
      const historical = context.related?.eras ?? [];
      const inheritedCities = new Map<string, TLCity[]>();
      for (const city of context.related?.cities ?? []) {
        for (const placement of developmentalPlacementsForEntity(era, city, "city")) {
          if (placement.subject?.type !== "country") continue;
          const members = inheritedCities.get(placement.id) ?? [];
          members.push(city); inheritedCities.set(placement.id, members);
        }
      }
      return <Box sx={{ display: "grid", gap: 2 }}>
        <Typography>Development threshold: {era.level} · {era.active && era.placements.length ? "Active" : "Inactive"}</Typography>
        {era.placements.length ? era.placements.map((placement) => <Paper key={placement.id} variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2">{developmentalPlacementSubject(placement, context.related?.cities, context.related?.countries)}</Typography>
          <Chip size="small" label={placement.estimated ? "Estimated" : "Manually dated"} />
          <Typography sx={{ mt: 1 }}>{historicalYearLabel(placement.startYear, historical)} – {historicalYearLabel(placement.endYear, historical)}</Typography>
          {placement.subject?.type === "country" ? <details>
            <summary>Cities inheriting this period</summary>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
              {(inheritedCities.get(placement.id) ?? []).map((city) =>
                <Link key={city._id} component={RouterLink} to={`/view_city/${city._id}`}>{city.name}</Link>)}
            </Box>
          </details> : null}
        </Paper>) : <Typography color="text.secondary">No dated placements.</Typography>}
        <Typography variant="caption" color="text.secondary">Cell development is independent of these dates.</Typography>
      </Box>;
    },
  },
  eraHeader: {
    type: "eraHeader", label: "Era",
    Render: ({ context }) => {
      if (context.sourceType !== "era") return null;
      const era = context.entity as TLMapEra;
      return <div className="header"><div className="info">
        <Typography variant="h1">{era.name}</Typography>
        <Typography color="text.secondary">{era.shortName}</Typography>
        <Chip size="small" label={era.status === "current" ? "Current era" : "Previous era"} />
      </div></div>;
    },
  },
  eraTimeline: {
    type: "eraTimeline", label: "Notable Events",
    Render: ({ context }) => context.sourceType === "era"
      ? <EraTimeline era={context.entity as TLMapEra} npcs={context.related?.npcs ?? []} /> : null,
  },
  eraChronology: {
    type: "eraChronology", label: "Chronology",
    Render: ({ context }) => {
      if (context.sourceType !== "era") return null;
      const era = context.entity as TLMapEra;
      const rows = [
        { label: "Era years", value: `${era.firstYear}–${era.finalYear} ${era.shortName}` },
        { label: era.status === "current" ? "Years in current era" : "Duration", value: `${era.length} years` },
      ];
      return <Box className="atlas-details-list" sx={{ display: "grid", gap: 2 }}>
        {rows.map((row) => <Box key={row.label} className="detail-container">
          <Typography component="span" className="detail-label">{row.label}</Typography>
          <Typography component="span" className="detail-value">{row.value}</Typography>
        </Box>)}
      </Box>;
    },
  },
};

function EraTimeline({ era, npcs }: { era: TLMapEra; npcs: readonly TLNPC[] }) {
  const events = era.events ?? [];
  if (!events.length) return <Typography color="text.secondary">No notable events recorded.</Typography>;
  return <Box component="ol" sx={{ listStyle: "none", m: 0, pl: 2, borderLeft: 2, borderColor: "divider", display: "grid", gap: 2 }}>
    {events.map((event) => <Paper component="li" key={event.id} id={`era-event-${event.id}`} variant="outlined"
      sx={{ p: 2, position: "relative", overflowWrap: "anywhere", "&::before": { content: '""', position: "absolute",
        width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", left: -23, top: 20 } }}>
      <Chip size="small" color="primary" label={`Year ${event.year} ${era.shortName}${event.dateText ? ` · ${event.dateText}` : ""}`} />
      <Typography variant="h6" component="h3" sx={{ mt: 1 }}>{event.name}</Typography>
      <Typography sx={{ mt: 1, whiteSpace: "pre-wrap" }}>{event.description}</Typography>
      {(event.npcHistory ?? []).map((link) => {
        const npc = npcs.find((item) => item._id === link.npcId);
        const entry = npc?.history.find((item) => item.id === link.entryId);
        return npc ? <Link key={`${link.npcId}:${link.entryId}`} component={RouterLink} to={`/view_npc/${npc._id}`}
          sx={{ display: "block", mt: 1 }}>{npc.name}: {entry?.title ?? "Source history unavailable"}</Link>
          : <Typography key={`${link.npcId}:${link.entryId}`} variant="caption">Source NPC history unavailable</Typography>;
      })}
    </Paper>)}
  </Box>;
}
