import { Box, Chip, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { TLMapEra } from "../../../definitions/History";
import type { TLNPC } from "../../../definitions/TerraLogger";

export function EraTimeline({ era, npcs }: { era: TLMapEra; npcs: readonly TLNPC[] }) {
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
