import { EraTimeline } from "../EraTimeline";
import { Box, Chip, Typography } from "@mui/material";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import type { TLMapEra } from "../../../../definitions/History";

export const eraBlockPlugins: Record<string, AtlasBlockPlugin> = {
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
