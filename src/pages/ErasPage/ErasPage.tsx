import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Link, Paper, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useTheme,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useActive, useActiveMap, useDB } from "../../db/DataContext";
import type { TLDevelopmentalEra, TLMapEra } from "../../definitions/History";
import { createDevelopmentalEraRecords, historicalYearLabel } from "../../components/HistoryGenerator/eras/mapEras";
import { createPreviousEra } from "../../components/HistoryGenerator/eras/model";
import type { TLCity, TLCountry, MapInf } from "../../definitions/TerraLogger";

function MapErasPage({ map }: { map: MapInf }) {
  const navigate = useNavigate();
  const records = useActive<TLMapEra>("eras");
  const developmentRecords = useActive<TLDevelopmentalEra>("developmentalEras");
  const cities = useActive<TLCity>("cities");
  const countries = useActive<TLCountry>("countries");
  const developmental = useMemo(() => [...developmentRecords].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name)), [developmentRecords]);
  const associationCounts = useMemo(() => new Map(developmental.map((era) =>
    [era._id, developmentalAssociationCounts(era, cities, countries)])), [developmental, cities, countries]);
  const [tab, setTab] = useState(0);
  const eras = useMemo(() => [...records].sort((a, b) => a.timelineStartYear - b.timelineStartYear), [records]);
  const { add } = useDB();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", shortName: "", duration: "100", level: "1" });
  async function addEra() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      if (tab === 1) {
        const level = Number(form.level);
        if (!form.level.trim() || !Number.isInteger(level) || level < 1 || level > 100) {
          throw new Error("Development threshold must be a whole number from 1 to 100.");
        }
        const record = createDevelopmentalEraRecords(map.mapId, [{ name: form.name, level }], eras)[0];
        await add("developmentalEras", { ...record, source: undefined });
        setOpen(false);
        navigate(`/view_developmental_era/${record._id}`);
        return;
      }
      const duration = Number(form.duration);
      if (!form.duration.trim() || !Number.isSafeInteger(duration) || duration < 1) {
        throw new Error("Era duration must be a positive whole number.");
      }
      const era = createPreviousEra({
        name: form.name, shortName: form.shortName,
        firstYear: 1,
        finalYear: duration,
      }, Math.min(...eras.map((item) => item.timelineStartYear)) - 1);
      await add("eras", { ...era, _id: era.id, mapId: map.mapId, status: "previous" });
      setOpen(false);
      navigate(`/view_era/${era.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to add this era.");
    } finally { setSaving(false); }
  }
  return <Container><Box className="contentSubBody" sx={{ display: "grid", gap: 2, minWidth: 0 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
      <Typography variant="h2" sx={{ flexGrow: 1 }}>Eras</Typography>
      {tab !== 2 ? <Button variant="contained" disabled={!eras.length} onClick={() => {
        setForm({ name: "", shortName: "", duration: "100",
          level: String(Array.from({ length: 100 }, (_, index) => index + 1).find((level) =>
            !developmental.some((era) => era.active && era.level === level)) ?? 100) });
        setError(null); setOpen(true);
      }}>{tab === 0 ? "Add Previous Era" : "Add Developmental Era"}</Button> : null}
    </Box>
    <Tabs value={tab} onChange={(_, value: number) => { setTab(value); setError(null); }} aria-label="Era categories" variant="scrollable" scrollButtons="auto">
      <Tab id="historical-eras-tab" aria-controls="historical-eras-panel" label="Historical Eras" />
      <Tab id="developmental-eras-tab" aria-controls="developmental-eras-panel" label="Developmental Eras" />
      <Tab id="era-timeline-tab" aria-controls="era-timeline-panel" label="Timeline" />
    </Tabs>
    {tab === 0 ? <TableContainer component={Paper} role="tabpanel" id="historical-eras-panel" aria-labelledby="historical-eras-tab">
      <Table aria-label="Eras in chronological order">
        <TableHead><TableRow>
          <TableCell>Era</TableCell><TableCell>Status</TableCell>
          <TableCell>Era years</TableCell><TableCell>Duration</TableCell>
        </TableRow></TableHead>
        <TableBody>{eras.map((era) => <TableRow key={era._id}>
          <TableCell><Link component={RouterLink} to={`/view_era/${era._id}`}>
            {era.name || "Unnamed era"} {era.shortName ? `(${era.shortName})` : ""}
          </Link></TableCell>
          <TableCell><Chip size="small" label={era.status === "current" ? "Current" : "Previous Era"} /></TableCell>
          <TableCell>{era.firstYear}–{era.finalYear}</TableCell>
          <TableCell>{era.length}</TableCell>
        </TableRow>)}
          {eras.length === 0 ? <TableRow><TableCell colSpan={4}>No eras are available.</TableCell></TableRow> : null}
        </TableBody>
      </Table>
    </TableContainer> : tab === 1 ? <TableContainer component={Paper} role="tabpanel" id="developmental-eras-panel" aria-labelledby="developmental-eras-tab">
      <Table aria-label="Developmental eras by threshold">
        <TableHead><TableRow><TableCell>Era</TableCell><TableCell>Threshold</TableCell><TableCell>Status</TableCell><TableCell>Countries</TableCell><TableCell>Cities</TableCell></TableRow></TableHead>
        <TableBody>{developmental.map((era) => <TableRow key={era._id}>
          <TableCell><Link component={RouterLink} to={`/view_developmental_era/${era._id}`}>{era.name}</Link></TableCell>
          <TableCell>{era.level}</TableCell><TableCell><Chip size="small" label={era.active && era.placements.length ? "Active" : "Inactive"} /></TableCell>
          <TableCell>{associationCounts.get(era._id)?.countries ?? 0}</TableCell>
          <TableCell>{associationCounts.get(era._id)?.cities ?? 0}</TableCell>
        </TableRow>)}
          {!developmental.length ? <TableRow><TableCell colSpan={5}>No developmental eras are available for this map.</TableCell></TableRow> : null}
        </TableBody>
      </Table>
    </TableContainer> : <Box role="tabpanel" id="era-timeline-panel" aria-labelledby="era-timeline-tab" sx={{ minWidth: 0 }}>
      <CombinedEraTimeline historical={eras} developmental={developmental} />
    </Box>}
    <Dialog open={open} onClose={() => { if (!saving) setOpen(false); }} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={(event) => { event.preventDefault(); void addEra(); }}>
        <DialogTitle>{tab === 0 ? "Add Previous Era" : "Add Developmental Era"}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Typography color="text.secondary">
            {tab === 0 ? "The new era comes before the earliest saved era. Each era counts its own years from 1."
              : "The threshold classifies cells. Add regional adoption periods and historical-era dates after creating this era."}
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField autoFocus required label="Era name" value={form.name} disabled={saving}
            onChange={(event) => setForm({ ...form, name: event.target.value })} />
          {tab === 0 ? <><TextField required label="Abbreviation" value={form.shortName} disabled={saving}
            onChange={(event) => setForm({ ...form, shortName: event.target.value })} />
          <TextField required type="number" label="Duration (years)" value={form.duration} disabled={saving}
            slotProps={{ htmlInput: { min: 1, step: 1 } }} onChange={(event) => setForm({ ...form, duration: event.target.value })} /></>
            : <TextField required type="number" label="Development threshold" value={form.level} disabled={saving}
              slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }} onChange={(event) => setForm({ ...form, level: event.target.value })} />}
        </DialogContent>
        <DialogActions>
          <Button disabled={saving} onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? "Saving..." : "Create Era"}</Button>
        </DialogActions>
      </Box>
    </Dialog>
  </Box></Container>;
}

export default function ErasPage() {
  const map = useActiveMap<MapInf>();
  if (!map) return <Container><Typography>Select a map or wait for it to finish loading.</Typography></Container>;
  return <MapErasPage key={map.mapId} map={map} />;
}


function developmentalAssociationCounts(era: TLDevelopmentalEra, cities: readonly TLCity[], countries: readonly TLCountry[]) {
  const countryIds = new Set(era.placements.filter((placement) => placement.subject?.type === "country")
    .map((placement) => placement.subject?.entityId));
  const assignedCountries = new Set(countries.filter((country) => country.id !== 0 && countryIds.has(country._id)).map((country) => country._id));
  const cityIds = new Set(era.placements.filter((placement) => placement.subject?.type === "city")
    .map((placement) => placement.subject?.entityId));
  return { countries: assignedCountries.size, cities: cities.filter((city) => cityIds.has(city._id) ||
    (city.country.id !== 0 && assignedCountries.has(city.country._id))).length };
}

type EraTimelinePeriod = {
  key: string; eraId: string; name: string; start: number; end: number;
  estimated: boolean; active: boolean; assigned: boolean; count: number;
};

// Identical regional periods share a visual branch; stored placements remain independent.
function eraTimelinePeriods(developmental: readonly TLDevelopmentalEra[]): EraTimelinePeriod[] {
  const groups = new Map<string, EraTimelinePeriod>();
  for (const era of developmental) for (const placement of era.placements) {
    const key = JSON.stringify([era._id, placement.startYear, placement.endYear, placement.estimated, !!placement.subject]);
    const existing = groups.get(key);
    if (existing) { existing.count += 1; continue; }
    groups.set(key, { key, eraId: era._id, name: era.name, start: placement.startYear, end: placement.endYear,
      estimated: placement.estimated, active: era.active, assigned: !!placement.subject, count: 1 });
  }
  return [...groups.values()].sort((a, b) => a.start - b.start || a.end - b.end || a.key.localeCompare(b.key));
}

type EraBranch = {
  key: string; eraId: string; name: string; to: string; start: number; end: number;
  lane: number; estimated: boolean; active: boolean;
};
type EraGraphEvent = {
  key: string; year: number; name: string; to: string;
  kind: "historical" | "start" | "end" | "present";
  branchKey?: string; range?: string;
};

// Reuse a lane only after an interval ends; same-year overlaps stay in separate lanes.
function eraTimelineGraph(historical: readonly TLMapEra[], periods: readonly EraTimelinePeriod[]) {
  const laneEnds: number[] = [];
  const branches: EraBranch[] = periods.map((period) => ({
    key: period.key, eraId: period.eraId, name: `${period.name} · ${period.count} ${period.assigned ? "regional" : "unassigned"} period${period.count === 1 ? "" : "s"}`,
    to: `/view_developmental_era/${period.eraId}`, start: period.start, end: period.end,
    lane: 0, estimated: period.estimated, active: period.active,
  })).sort((a, b) => a.start - b.start || a.end - b.end || a.key.localeCompare(b.key));
  for (const branch of branches) {
    const free = laneEnds.findIndex((end) => end < branch.start);
    branch.lane = free < 0 ? laneEnds.length : free;
    laneEnds[branch.lane] = branch.end;
  }
  const events: EraGraphEvent[] = historical.map((era) => ({
    key: `historical:${era._id}`, year: era.timelineStartYear, name: era.name, to: `/view_era/${era._id}`,
    kind: "historical", range: `${historicalYearLabel(era.timelineStartYear, historical)} – ${historicalYearLabel(era.timelineEndYear, historical)}`,
  }));
  for (const era of historical) if (era.status === "current") events.push({
    key: `present:${era._id}`, year: era.timelineEndYear, name: `Present · ${era.name}`, to: `/view_era/${era._id}`, kind: "present",
  });
  for (const branch of branches) {
    events.push({ key: `start:${branch.key}`, year: branch.start, name: branch.name, to: branch.to, kind: "start", branchKey: branch.key });
    events.push({ key: `end:${branch.key}`, year: branch.end, name: branch.name, to: branch.to, kind: "end", branchKey: branch.key });
  }
  const priority = { historical: 0, start: 1, end: 2, present: 3 };
  events.sort((a, b) => a.year - b.year || priority[a.kind] - priority[b.kind] || a.key.localeCompare(b.key));
  return { branches, events, lanes: laneEnds.length };
}

function CombinedEraTimeline({ historical, developmental }: {
  historical: readonly TLMapEra[]; developmental: readonly TLDevelopmentalEra[];
}) {
  const theme = useTheme();
  const eraColors = useMemo(() => new Map(
    [...developmental].sort((a, b) => a._id.localeCompare(b._id)).map((era, index) =>
      [era._id, `hsl(${(index * 137.508) % 360} 65% ${theme.palette.mode === "dark" ? 65 : 38}%)`]),
  ), [developmental, theme.palette.mode]);
  const [page, setPage] = useState(0);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [focusedBranch, setFocusedBranch] = useState<string | null>(null);
  const periods = useMemo(() => eraTimelinePeriods(developmental), [developmental]);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(periods.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const visiblePeriods = useMemo(() => periods.slice(currentPage * pageSize, (currentPage + 1) * pageSize), [periods, currentPage]);
  const { branches, events, lanes } = useMemo(() => eraTimelineGraph(historical, visiblePeriods), [historical, visiblePeriods]);
  if (!events.length) return <Typography>No dated eras are available.</Typography>;
  const branchByKey = new Map(branches.map((branch) => [branch.key, branch]));
  const requestedBranch = hoveredBranch ?? focusedBranch;
  const highlightedBranch = requestedBranch === "historical" || (requestedBranch && branchByKey.has(requestedBranch)) ? requestedBranch : null;
  const opacity = (key: string, normal = 1) => highlightedBranch ? key === highlightedBranch ? 1 : 0.15 : normal;
  const branchAt = (target: EventTarget | null) => target instanceof Element
    ? target.closest("[data-era-branch]")?.getAttribute("data-era-branch") ?? null : null;
  const positions = new Map(events.map((event, index) => [event.key, index]));
  const x = (lane: number) => 44 + lane * 24;
  const graphWidth = Math.max(64, 68 + lanes * 24);
  const color = (branch: EraBranch) => eraColors.get(branch.eraId) ?? theme.palette.primary.main;
  return <Box sx={{ display: "grid", gap: 1.5, minWidth: 0 }}>
    <Typography color="text.secondary">
      Historical eras form the main line. Regional adoption periods branch and rejoin at their dated boundaries.
      Unassigned periods do not imply worldwide adoption.
      Identical dated periods share a branch; each page shows up to 20 complete branches.
      Events follow date order; spacing is not proportional to elapsed years.
    </Typography>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
      <Button disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous periods</Button>
      <Typography variant="body2" role="status">{periods.length
        ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, periods.length)} of ${periods.length} grouped periods`
        : "Historical eras only"}</Typography>
      <Button disabled={currentPage + 1 >= pageCount} onClick={() => setPage(currentPage + 1)}>Next periods</Button>
    </Box>
    <Box role="region" aria-label="Branched Era timeline" tabIndex={0}
      onPointerMove={(event) => { if (event.pointerType !== "touch") setHoveredBranch(branchAt(event.target)); }}
      onPointerLeave={() => setHoveredBranch(null)}
      onFocusCapture={(event) => setFocusedBranch(branchAt(event.target))}
      onBlurCapture={() => setFocusedBranch(null)}
      sx={{ overflow: "auto", maxHeight: "65vh", maxWidth: "100%", minWidth: 0 }}>
      <Box component="ol" sx={{ listStyle: "none", m: 0, p: 0, minWidth: graphWidth + 320 }}>
        {events.map((event, index) => {
          const branch = event.branchKey ? branchByKey.get(event.branchKey) : undefined;
          const stroke = branch ? color(branch) : theme.palette.primary.main;
          return <Box component="li" key={event.key} sx={{ display: "grid", gridTemplateColumns: `${graphWidth}px minmax(0, 1fr)`, minHeight: 96 }}>
            <Box aria-hidden="true" sx={{ position: "relative" }}>
              <Box data-era-branch="historical" sx={{ position: "absolute", left: 15, width: 3, bgcolor: "primary.main", opacity: opacity("historical"),
                top: index === 0 && event.kind !== "start" ? 28 : 0, bottom: index === events.length - 1 ? "calc(100% - 28px)" : 0 }} />
              {branches.filter((line) => index > (positions.get(`start:${line.key}`) ?? -1) &&
                index < (positions.get(`end:${line.key}`) ?? -1)).map((line) => <Box key={line.key} data-era-branch={line.key}
                  sx={{ position: "absolute", left: x(line.lane) - 1, top: 0, bottom: 0,
                    borderLeft: `3px ${line.estimated ? "dashed" : "solid"} ${color(line)}`, opacity: opacity(line.key, line.active ? 1 : 0.45) }} />)}
              {branch && event.kind === "start" ? <Box data-era-branch={branch.key} sx={{ position: "absolute", left: x(branch.lane) - 1, top: 28, bottom: 0,
                borderLeft: `3px ${branch.estimated ? "dashed" : "solid"} ${stroke}`, opacity: opacity(branch.key, branch.active ? 1 : 0.45) }} /> : null}
              <svg aria-hidden="true" focusable="false" width={graphWidth} height="48" style={{ display: "block", position: "absolute", top: 0, left: 0, overflow: "visible", pointerEvents: "none" }}>
                {branch ? <path data-era-branch={branch.key} pointerEvents="stroke" fill="none" stroke={stroke}
                  strokeWidth={highlightedBranch === branch.key ? 4 : 3} opacity={opacity(branch.key, branch.active ? 1 : 0.45)}
                  strokeDasharray={branch.estimated ? "5 4" : undefined}
                  d={event.kind === "start"
                    ? `M 16 0 C 16 18, ${x(branch.lane)} 8, ${x(branch.lane)} 28`
                    : `M ${x(branch.lane)} 0 C ${x(branch.lane)} 18, 16 8, 16 28`} /> : null}
                <circle data-era-branch={branch?.key ?? "historical"} pointerEvents="all"
                  opacity={opacity(branch?.key ?? "historical")} cx={branch && event.kind === "start" ? x(branch.lane) : 16} cy="28" r="5"
                  fill={theme.palette.background.paper} stroke={stroke} strokeWidth="3" />
              </svg>
            </Box>
            <Paper data-era-branch={branch?.key ?? "historical"} variant="outlined"
              sx={{ p: 1.5, mb: 1.5, borderLeft: `3px solid ${stroke}`,
                opacity: opacity(branch?.key ?? "historical", branch && !branch.active ? 0.65 : 1),
                boxShadow: highlightedBranch === (branch?.key ?? "historical") ? `0 0 0 1px ${stroke}` : undefined }}>
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                <Link component={RouterLink} to={event.to}>{event.name}</Link>
                <Chip size="small" label={event.kind === "historical" ? "Historical era" : event.kind === "present" ? "Present"
                  : event.kind === "start" ? "Developmental era begins" : "Developmental era ends"} variant="outlined" />
                {branch?.estimated ? <Chip size="small" label="Estimated" /> : null}
                {branch && !branch.active ? <Chip size="small" label="Inactive" /> : null}
              </Box>
              <Typography variant="body2" sx={{ mt: 1 }}>{historicalYearLabel(event.year, historical)}</Typography>
              {event.range ? <Typography variant="caption" color="text.secondary">{event.range}</Typography> : null}
            </Paper>
          </Box>;
        })}
      </Box>
    </Box>
    {developmental.some((era) => !era.placements.length) ? <Typography variant="caption" color="text.secondary">
      Developmental eras without placements are available in the Developmental Eras tab.
    </Typography> : null}
  </Box>;
}
