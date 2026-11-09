import { Alert, Box, TextField, Typography } from "@mui/material";
import type { AtlasEditorContext } from "../../../../definitions/Atlas";
import type { TLMapEra } from "../../../../definitions/History";

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
