import { useState } from "react";
import { v7 as uuidv7 } from "uuid";
import { Alert, Autocomplete, Box, Button, Chip, MenuItem, TextField, Typography } from "@mui/material";
import type { AtlasEditorContext } from "../../../../definitions/Atlas";
import type { TLEraEvent, TLMapEra } from "../../../../definitions/History";
import { createEraEventFromNPC } from "../../../HistoryGenerator/eras/eraEvents";

export function EraEventsBlockEditor({ context }: { context: AtlasEditorContext }) {
  const [npcId, setNPCId] = useState("");
  const [entryId, setEntryId] = useState("");
  if (context.sourceType !== "era") return null;
  const era = context.entity as TLMapEra;
  const events = era.events ?? [];
  const npcs = context.related?.npcs ?? [];
  const npc = npcs.find((item) => item._id === npcId) ?? null;
  const entry = npc?.history.find((item) => item.id === entryId);
  const selectedLink = npc && entry ? { npcId: npc._id, entryId: entry.id } : null;
  function save(items: TLEraEvent[]) { context.onEntityFieldChange({ path: "events", value: items }); }
  function change(id: string, patch: Partial<TLEraEvent>) {
    save(events.map((item) => item.id === id ? { ...item, ...patch } : item));
  }
  function move(index: number, offset: number) {
    const next = [...events];
    const [item] = next.splice(index, 1);
    next.splice(index + offset, 0, item);
    save(next);
  }
  return <Box className="atlas-entity-list-editor" sx={{ display: "grid", gap: 2 }}>
    <Typography color="text.secondary">Display order is saved as shown. Date text is optional; local year is required.</Typography>
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Button type="button" variant="outlined" onClick={() => save([...events, {
        id: uuidv7(), name: "", year: era.firstYear, description: "",
      }])}>Add event</Button>
      <Button type="button" disabled={events.length < 2} onClick={() => save([...events].sort((a, b) =>
        (Number.isFinite(a.year) ? a.year : Infinity) - (Number.isFinite(b.year) ? b.year : Infinity)))}>Sort by year</Button>
    </Box>
    <Box sx={{ display: "grid", gap: 1 }}>
      <Typography variant="subtitle2">Add or link selected NPC history</Typography>
      <Autocomplete options={npcs} value={npc} getOptionLabel={(item) => item.fullName || item.name}
        isOptionEqualToValue={(a, b) => a._id === b._id}
        onChange={(_event, value) => { setNPCId(value?._id ?? ""); setEntryId(""); }}
        renderInput={(params) => <TextField {...params} label="NPC" />} />
      <TextField select label="History entry" value={entryId} disabled={!npc}
        onChange={(event) => setEntryId(event.target.value)}>
        <MenuItem value="">Select history entry</MenuItem>
        {(npc?.history ?? []).map((item) => <MenuItem key={item.id} value={item.id}>{item.title}</MenuItem>)}
      </TextField>
      <Button type="button" variant="outlined" disabled={!npc || !entry || events.some((item) => item.npcHistory?.some((link) =>
        link.npcId === npcId && link.entryId === entryId))} onClick={() => {
        if (npc && entry) save([...events, createEraEventFromNPC(era, npc, entry)]);
      }}>Add selected history as an event</Button>
      <Typography variant="caption">Only selected entries are added. Births and appointments are available when recorded in NPC history. Imported years must fall within this era.</Typography>
    </Box>
    {events.map((item, index) => <Box key={item.id} className="atlas-entity-object-card" sx={{ display: "grid", gap: 2 }}>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</Button>
        <Button type="button" disabled={index === events.length - 1} onClick={() => move(index, 1)}>Move down</Button>
        <Button type="button" color="error" onClick={() => save(events.filter((event) => event.id !== item.id))}>Remove event</Button>
      </Box>
      <TextField required label="Event name" value={item.name} onChange={(event) => change(item.id, { name: event.target.value })} />
      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
        <TextField required label={`Local year (${era.shortName})`} type="number"
          value={Number.isFinite(item.year) ? item.year : ""}
          error={!Number.isSafeInteger(item.year) || item.year < era.firstYear || item.year > era.finalYear}
          helperText={`Years ${era.firstYear}–${era.finalYear}`} slotProps={{ htmlInput: { min: era.firstYear, max: era.finalYear, step: 1 } }}
          onChange={(event) => change(item.id, { year: event.target.value.trim() ? Number(event.target.value) : Number.NaN })} />
        <TextField label="Date text (optional)" value={item.dateText ?? ""} placeholder="3rd day of Frostfall"
          onChange={(event) => change(item.id, { dateText: event.target.value })} />
      </Box>
      <TextField multiline minRows={3} label="Details / description" value={item.description}
        onChange={(event) => change(item.id, { description: event.target.value })} />
      <Button type="button" disabled={!selectedLink || item.npcHistory?.some((link) =>
        link.npcId === selectedLink.npcId && link.entryId === selectedLink.entryId)} onClick={() => {
        if (selectedLink) change(item.id, { npcHistory: [...(item.npcHistory ?? []), selectedLink] });
      }}>Link selected NPC history to this event</Button>
      {(item.npcHistory ?? []).map((link) => {
        const sourceNPC = npcs.find((candidate) => candidate._id === link.npcId);
        const sourceEntry = sourceNPC?.history.find((candidate) => candidate.id === link.entryId);
        return <Chip key={`${link.npcId}:${link.entryId}`} label={sourceNPC && sourceEntry
          ? `${sourceNPC.name}: ${sourceEntry.title}` : "Source NPC history unavailable"}
          onDelete={() => change(item.id, { npcHistory: item.npcHistory?.filter((candidate) =>
            candidate.npcId !== link.npcId || candidate.entryId !== link.entryId) })} />;
      })}
    </Box>)}
    <Alert severity="info">NPC links do not change NPC ages, history years, or text. Event details are editable copies; deleting a timeline event only removes its links.</Alert>
  </Box>;
}
