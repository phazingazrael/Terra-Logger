import { useMemo, useState } from "react";
import {
  Alert, Box, Button, Chip, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useActiveMap } from "../../db/DataContext";
import { appendPreviousMapEra } from "../../db/eras";
import { getMapEras } from "../../components/HistoryGenerator/eras/mapEras";
import type { MapInf } from "../../definitions/TerraLogger";

function MapErasPage({ map }: { map: MapInf }) {
  const navigate = useNavigate();
  const eras = useMemo(() => getMapEras(map), [map]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", shortName: "", duration: "100" });
  const filtered = eras.filter((era) => `${era.name} ${era.shortName}`.toLowerCase().includes(query.trim().toLowerCase()));
  async function addEra() {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const era = await appendPreviousMapEra(map.mapId, {
        name: form.name, shortName: form.shortName,
        firstYear: 1,
        finalYear: form.duration.trim() === "" ? Number.NaN : Number(form.duration),
      });
      setOpen(false);
      navigate(`/view_era/${encodeURIComponent(era.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to add this era.");
    } finally { setSaving(false); }
  }
  return <Container><Box className="contentSubBody" sx={{ display: "grid", gap: 2 }}>
    <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
      <Typography variant="h2" sx={{ flexGrow: 1 }}>Eras</Typography>
      <Button variant="contained" onClick={() => {
        setForm({ name: "", shortName: "", duration: "100" });
        setError(null); setOpen(true);
      }}>Add Previous Era</Button>
    </Box>
    <TextField label="Search eras" type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
    <TableContainer component={Paper}>
      <Table aria-label="Eras in chronological order">
        <TableHead><TableRow>
          <TableCell>Era</TableCell><TableCell>Status</TableCell>
          <TableCell>Era years</TableCell><TableCell>Duration</TableCell>
        </TableRow></TableHead>
        <TableBody>{filtered.map((era) => <TableRow key={era.id}>
          <TableCell><Link component={RouterLink} to={`/view_era/${encodeURIComponent(era.id)}`}>
            {era.name || "Unnamed era"} {era.shortName ? `(${era.shortName})` : ""}
          </Link></TableCell>
          <TableCell><Chip size="small" label={era.status === "current" ? "Current" : "Previous Era"} /></TableCell>
          <TableCell>{era.firstYear}–{era.finalYear}</TableCell>
          <TableCell>{era.length}</TableCell>
        </TableRow>)}
          {filtered.length === 0 ? <TableRow><TableCell colSpan={4}>No eras match your search.</TableCell></TableRow> : null}
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
