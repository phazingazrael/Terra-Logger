import { useState } from "react";
import { Alert, Box, Button, Checkbox, FormControlLabel, MenuItem, Paper, TextField, Typography } from "@mui/material";
import type { AtlasEditorContext } from "../../../../definitions/Atlas";
import { v7 as uuidv7 } from "uuid";
import { historicalYearLabel } from "../../../HistoryGenerator/eras/mapEras";
import type { TLDevelopmentalEra, TLDevelopmentalEraPlacement, TLMapEra } from "../../../../definitions/History";

export function EraChronologyBlockEditor({ context }: { context: AtlasEditorContext }) {
  if (context.sourceType !== "era") return null;
  const era = context.entity as TLMapEra;
  function changeDuration(value: string) {
    const length = value.trim() === "" ? Number.NaN : Number(value);
    context.onEntityFieldChange({ path: "length", value: length });
    context.onEntityFieldChange({ path: "firstYear", value: 1 });
    context.onEntityFieldChange({ path: "finalYear", value: length });
  }
  return <Box className="atlas-entity-block-editor" sx={{ display: "grid", gap: 2 }}>
    <Alert severity="info">
      Previous eras follow one another immediately before the current era.
      Changing a duration moves earlier era boundaries and refreshes event labels.
      NPC ages and event years stay unchanged.
    </Alert>
    {era.status === "previous" ? <TextField label="Duration (years)" type="number"
      value={Number.isFinite(era.length) ? era.length : ""}
      slotProps={{ htmlInput: { min: 1, step: 1 } }}
      onChange={(event) => changeDuration(event.target.value)} />
      : <TextField label="Current era year" value={era.finalYear} disabled />}
    <Typography color="text.secondary">
      {Number.isSafeInteger(era.length) && era.length > 0
        ? `Years 1–${era.finalYear} ${era.shortName}; ${era.length} years.`
        : "Enter a positive whole-number duration."}
    </Typography>
  </Box>;
}

export function DevelopmentalEraBlockEditor({ context }: { context: AtlasEditorContext }) {
  if (context.sourceType !== "developmentalEra") return null;
  const era = context.entity as TLDevelopmentalEra;
  const historical = context.related?.eras ?? [];
  const cities = context.related?.cities ?? [];
  const countries = (context.related?.countries ?? []).filter((country) => country.id !== 0);
  function changePlacement(id: string, patch: Partial<TLDevelopmentalEraPlacement>) {
    context.onEntityFieldChange({ path: "placements",
      value: era.placements.map((item) => item.id === id ? { ...item, ...patch, estimated: false } : item) });
  }
  return <Box sx={{ display: "grid", gap: 2 }}>
    <Alert severity="info">
      Imported levels describe current development, not historical adoption dates.
      Associate each period with a Country or City and choose its historical-era years.
      City periods replace inherited Country periods for this developmental era. Neutral Cities remain independent.
      Periods may overlap or recur; they do not change cell development or NPC ages.
    </Alert>
    <TextField label="Development threshold (1–100)" type="number" value={Number.isFinite(era.level) ? era.level : ""}
      slotProps={{ htmlInput: { min: 1, max: 100, step: 1 } }}
      onChange={(event) => context.onEntityFieldChange({ path: "level", value: event.target.value === "" ? Number.NaN : Number(event.target.value) })} />
    <FormControlLabel label="Use this era for cell classification" control={<Checkbox checked={era.active}
      onChange={(_, checked) => context.onEntityFieldChange({ path: "active", value: checked })} />} />
    {era.source ? <Typography variant="caption">
      AFMG source: {era.source.name}, threshold {era.source.level}{era.source.present ? "" : " (no longer in source)"}.
    </Typography> : null}
    <Typography variant="body2" color="text.secondary">
      Historical span recorded at creation: {historicalYearLabel(era.estimateBasis.startYear, historical)} – {historicalYearLabel(era.estimateBasis.endYear, historical)}.
    </Typography>
    {era.placements.map((placement, index) => <Paper key={placement.id} variant="outlined" sx={{ p: 2, display: "grid", gap: 2 }}>
      <Typography variant="h6">Placement {index + 1} · {placement.estimated ? "Estimated" : "Manually dated"}</Typography>
      <TextField select label="Associated Country or City"
        value={placement.subject ? `${placement.subject.type}:${placement.subject.entityId}` : ""}
        onChange={(event) => {
          const selected = [...countries.map((country) => ({ type: "country" as const, entityId: country._id })),
            ...cities.map((city) => ({ type: "city" as const, entityId: city._id }))]
            .find((subject) => `${subject.type}:${subject.entityId}` === event.target.value);
          changePlacement(placement.id, { subject: selected });
        }}>
        <MenuItem value="">Unassigned</MenuItem>
        {placement.subject && !(placement.subject.type === "city" ? cities : countries)
          .some((item) => item._id === placement.subject?.entityId) ?
          <MenuItem value={`${placement.subject.type}:${placement.subject.entityId}`}>Unavailable {placement.subject.type}</MenuItem> : null}
        {countries.map((country) => <MenuItem key={country._id} value={`country:${country._id}`}>
          Country: {country.name}{country.development?.eraId === era._id ? " · current cell average matches" : ""}
        </MenuItem>)}
        {cities.map((city) => <MenuItem key={city._id} value={`city:${city._id}`}>
          City: {city.name}{city.development?.eraId === era._id ? " · current cell matches" : ""}
        </MenuItem>)}
      </TextField>
      {!placement.subject ? <Alert severity="info">This period is unassigned and does not imply worldwide adoption.</Alert> : null}
      <DevelopmentalDateField label="Start" value={placement.startYear} eras={historical}
        onChange={(startYear) => changePlacement(placement.id, { startYear })} />
      <DevelopmentalDateField label="End" value={placement.endYear} eras={historical}
        onChange={(endYear) => changePlacement(placement.id, { endYear })} />
      {placement.startYear > placement.endYear ? <Alert severity="error">The end must follow or equal the start.</Alert> : null}
      <Button color="error" onClick={() => context.onEntityFieldChange({ path: "placements",
        value: era.placements.filter((item) => item.id !== placement.id) })}>Remove placement</Button>
    </Paper>)}
    <Button variant="outlined" onClick={() => {
      const year = historical.find((item) => item.status === "current")?.timelineEndYear ?? era.estimateBasis.endYear;
      context.onEntityFieldChange({ path: "placements",
        value: [...era.placements, { id: uuidv7(), startYear: year, endYear: year, estimated: false }] });
    }}>Add placement / recurrence</Button>
  </Box>;
}

function DevelopmentalDateField({ label, value, eras, onChange }: {
  label: string; value: number; eras: readonly TLMapEra[]; onChange: (year: number) => void;
}) {
  const [selectedId, setSelectedId] = useState(() => eras.find((era) => value >= era.timelineStartYear && value <= era.timelineEndYear)?._id ?? "");
  const selected = eras.find((era) => era._id === selectedId);
  const year = selected ? selected.firstYear + value - selected.timelineStartYear : value;
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
    <TextField select label={`${label} historical era`} value={selected?._id ?? ""}
      onChange={(event) => {
        setSelectedId(event.target.value);
        const era = eras.find((item) => item._id === event.target.value);
        if (era) onChange(era.timelineStartYear);
      }}>
      <MenuItem value="">Absolute timeline year</MenuItem>
      {[...eras].sort((a, b) => a.timelineStartYear - b.timelineStartYear).map((era) =>
        <MenuItem key={era._id} value={era._id}>{era.name}</MenuItem>)}
    </TextField>
    <TextField type="number" label={selected ? `${label} local year` : `${label} timeline year`}
      value={Number.isFinite(year) ? year : ""} slotProps={{ htmlInput: { step: 1 } }}
      helperText={historicalYearLabel(value, eras)}
      onBlur={() => setSelectedId(eras.find((era) => value >= era.timelineStartYear && value <= era.timelineEndYear)?._id ?? "")}
      onChange={(event) => {
        const local = event.target.value === "" ? Number.NaN : Number(event.target.value);
        onChange(selected ? selected.timelineStartYear + local - selected.firstYear : local);
      }} />
  </Box>;
}
