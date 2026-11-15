import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useActive, useActiveMap, useDB } from "../../db/DataContext";
import type { TLMapEra } from "../../definitions/History";
import { createPreviousEra } from "../../components/HistoryGenerator/eras/model";
import type { MapInf } from "../../definitions/TerraLogger";

function MapErasPage({ map }: { map: MapInf }) {
  const navigate = useNavigate();
  const records = useActive<TLMapEra>("eras");
  const eras = useMemo(() => [...records].sort((a, b) => a.timelineStartYear - b.timelineStartYear), [records]);
  const { add } = useDB();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", shortName: "", duration: "100" });
  async function addEra() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
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
  return <Container><Box className="contentSubBody" sx={{ display: "grid", gap: 2 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
      <Typography variant="h2" sx={{ flexGrow: 1 }}>Eras</Typography>
      <Button variant="contained" disabled={!eras.length} onClick={() => {
        setForm({ name: "", shortName: "", duration: "100" });
        setError(null); setOpen(true);
      }}>Add Previous Era</Button>
    </Box>
    <TableContainer component={Paper}>
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
    </TableContainer>
    <Dialog open={open} onClose={() => { if (!saving) setOpen(false); }} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={(event) => { event.preventDefault(); void addEra(); }}>
        <DialogTitle>Add Previous Era</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Typography color="text.secondary">
            The new era comes before the earliest saved era. Each era counts its own years from 1.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField autoFocus required label="Era name" value={form.name} disabled={saving}
            onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <TextField required label="Abbreviation" value={form.shortName} disabled={saving}
            onChange={(event) => setForm({ ...form, shortName: event.target.value })} />
          <TextField required type="number" label="Duration (years)" value={form.duration} disabled={saving}
            slotProps={{ htmlInput: { min: 1, step: 1 } }} onChange={(event) => setForm({ ...form, duration: event.target.value })} />
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
