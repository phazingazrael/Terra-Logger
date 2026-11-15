import { entitySplitListBlock, findEconomyTradeBlock } from "../../core/presets";

import { SplitListBlockEditor } from "./SplitListBlockEditor";
import { useMemo, useState } from "react";
import { Box, Button, Checkbox, FormControlLabel, MenuItem, TextField } from "@mui/material";
import type { AtlasBlock, AtlasEditorContext } from "../../../../definitions/Atlas";
import type {
  TLCity,
  TLCountry,
  TLMapEconomy,
} from "../../../../definitions/TerraLogger";

import { cityEconomyField, countryEconomyField, sharedEconomyField, defaultEconomyValue, type EconomyField } from "../../core/economyFields";
import { EntityFieldEditor } from "../entityFields/EntityFieldEditor";
import { getEntityFieldSchemas } from "../entityFields/entityFieldCatalog";
import { getValueAtPath } from "../entityFields/entityFieldAccess";

export function EconomyBlockEditor({ context, onTradeBlockChange }: {
  context: AtlasEditorContext;
  onTradeBlockChange?: (block: AtlasBlock) => void;
}) {
  const [cityIndex, setCityIndex] = useState(0);
  const defaultTradeBlock = useMemo(() => entitySplitListBlock("Imports and Exports", [
    { label: "Exports", entityPath: "economy.exports", emptyText: "No exports listed." },
    { label: "Imports", entityPath: "economy.imports", emptyText: "No imports listed." },
  ]), []);
  if (context.sourceType !== "city" && context.sourceType !== "country") return null;
  const entity = context.entity as TLCity | TLCountry;
  const country = context.sourceType === "country" ? entity as TLCountry : undefined;
  const cities = (context.related?.cities ?? []).filter((city) => city.country.id === country?.id);
  const selectedCity = cities[cityIndex] ?? cities[0];
  const tradeBlock = findEconomyTradeBlock(context.section);
  return <div className="atlas-entity-list-editor">
    {getEntityFieldSchemas(context.sourceType, ["economy.description"]).map((schema) =>
      <EntityFieldEditor key={schema.path} sourceType={context.sourceType} entity={entity}
        related={context.related} economy={context.economy} schema={schema} onRelatedUpdate={context.onRelatedUpdate}
        value={getValueAtPath(entity, schema.path)}
        onChange={(value) => context.onEntityFieldChange({ path: schema.path, value })} />)}
    <SplitListBlockEditor block={tradeBlock ?? defaultTradeBlock} context={context}
      onChange={tradeBlock ? onTradeBlockChange : undefined} />
    <EconomyValueEditor label="Economy" field={country ? countryEconomyField : cityEconomyField}
      value={entity.economy ?? { description: "", imports: [], exports: [] }} onChange={(value) => context.onEntityFieldChange({ path: "economy", value })} />
    {country ? <>
      <p>Production totals recalculate from City production. Trade edits update the linked deals and recalculate totals on Save.</p>
      {selectedCity ? <>
        <TextField select label="Contributing City" value={Math.min(cityIndex, cities.length - 1)}
          onChange={(event) => setCityIndex(Number(event.target.value))}>
          {cities.map((city, index) => <MenuItem key={city._id} value={index}>{city.name} (#{city.id})</MenuItem>)}
        </TextField>
        <EconomyValueEditor key={selectedCity._id} label={selectedCity.name} field={cityEconomyField}
          value={selectedCity.economy ?? { description: "", imports: [], exports: [] }}
          onChange={(value) => context.onRelatedUpdate({ action: "update", store: "cities", key: selectedCity._id,
            value: { ...selectedCity, economy: value as TLCity["economy"] } })} />
      </> : <p>No contributing Cities.</p>}
    </> : <p>Imported trade edits update the linked deals. Removing an entry deletes those deals from the map on Save.</p>}
    <p>Goods, markets, deals, and cell assignments are shared by the whole map. Changes here affect every page using those records.</p>
    <EconomyValueEditor label="Shared map economy" field={sharedEconomyField}
      value={context.economy ?? { cells: { country: [] } }}
      onChange={(value) => context.onRelatedUpdate({ action: "update", store: "maps", key: entity.mapId ?? "",
        value: value as TLMapEconomy })} />
  </div>;
}

function EconomyValueEditor({ field, value, label, onChange }: Readonly<{
  field: EconomyField; value: unknown; label: string; onChange: (value: unknown) => void;
}>) {
  const [index, setIndex] = useState(0);
  const [keyDraft, setKeyDraft] = useState("");
  const [open, setOpen] = useState(false);
  if (value === undefined && field.optional) {
    return <Button type="button" onClick={() => onChange(defaultEconomyValue(field))}>Add {label}</Button>;
  }
  const clear = field.optional ? <Button type="button" onClick={() => onChange(undefined)}>Clear {label}</Button> : null;
  if (field.type === "number" || field.type === "text" || field.type === "choice") {
    return <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
      <TextField fullWidth size="small" label={label} select={field.type === "choice"}
        type={field.type === "number" ? "number" : "text"}
        value={value === null ? "__null__" : typeof value === "number" || typeof value === "string" ? value : ""}
        slotProps={{ htmlInput: field.type === "number" ? {
          min: field.signed ? undefined : 0, step: field.integer ? 1 : "any",
        } : {} }}
        onChange={(event) => onChange(field.type === "number"
          ? event.target.value === "" ? undefined : Number(event.target.value)
          : field.type === "choice" && event.target.value === "__null__" ? null : event.target.value)}>
        {field.type === "choice" ? field.values.map((item) => <MenuItem key={item ?? "__null__"}
          value={item ?? "__null__"}>{item ?? "None"}</MenuItem>) : null}
      </TextField>{clear}
    </Box>;
  }
  if (field.type === "boolean") return <Box><FormControlLabel label={label}
    control={<Checkbox checked={value === true} onChange={(_, checked) => onChange(checked)} />} />{clear}</Box>;
  const record = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  if (field.type === "object") return <Box className="atlas-entity-object-card" sx={{ display: "grid", gap: 2 }}>
    <strong>{label}</strong>{clear}
    {Object.entries(field.fields).map(([key, item]) => <EconomyValueEditor key={key} field={item}
      value={record[key]} label={item.label ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())}
      onChange={(next) => onChange({ ...record, [key]: next })} />)}
  </Box>;
  if (field.type === "variant") {
    const type = typeof record.type === "string" ? record.type : Object.keys(field.variants)[0];
    return <Box sx={{ display: "grid", gap: 2 }}>
      <TextField select label="Production type" value={type} onChange={(event) => onChange({
        ...defaultEconomyValue(field.variants[event.target.value]) as object, type: event.target.value,
      })}>{Object.keys(field.variants).map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}</TextField>
      {field.variants[type] ? <EconomyValueEditor key={type} field={field.variants[type]} value={record}
        label={label} onChange={(next) => onChange({ ...next as object, type })} /> : null}
    </Box>;
  }
  const items = field.type === "array" ? Array.isArray(value) ? value : [] : Object.entries(record);
  const selected = Math.min(index, Math.max(0, items.length - 1));
  return <Box component="details" className="atlas-entity-object-card" onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>{label} ({items.length})</summary>
    {open ? <Box sx={{ display: "grid", gap: 2, mt: 2 }}>
      {clear}
      {field.type === "array" ? <TextField label="Find record by ID or name" size="small" value={keyDraft}
        onChange={(event) => {
          const query = event.target.value.toLowerCase();
          setKeyDraft(event.target.value);
          const found = items.findIndex((item) => item && typeof item === "object" &&
            (String(item.id) === query || typeof item.name === "string" && item.name.toLowerCase().includes(query)));
          if (found >= 0) setIndex(found);
        }} /> : null}
      {items.length > 0 ? <>
        <TextField type="number" label="Record number" size="small" value={selected + 1}
          slotProps={{ htmlInput: { min: 1, max: items.length, step: 1 } }}
          onChange={(event) => setIndex(Math.max(0, Math.min(items.length - 1, Number(event.target.value) - 1)))} />
        {field.type === "array" ? <EconomyValueEditor key={selected} field={field.item} value={items[selected]}
          label={`${label} ${selected + 1}`} onChange={(next) => onChange(items.map((item, i) => i === selected ? next : item))} /> : <>
          <TextField label="Key" value={Object.keys(record)[selected]} onChange={(event) => {
            const key = event.target.value;
            if (!key || (key in record && key !== Object.keys(record)[selected])) return;
            onChange(Object.fromEntries(Object.entries(record).map(([old, item], i) => [i === selected ? key : old, item])));
          }} />
          <EconomyValueEditor key={selected} field={field.item} value={Object.values(record)[selected]}
            label="Value" onChange={(next) => onChange({ ...record, [Object.keys(record)[selected]]: next })} />
        </>}
        <Button type="button" onClick={() => onChange(field.type === "array" ? items.filter((_, i) => i !== selected)
          : Object.fromEntries(Object.entries(record).filter((_, i) => i !== selected)))}>Remove record</Button>
      </> : null}
      {field.type === "map" ? <TextField label="New key" value={keyDraft} onChange={(event) => setKeyDraft(event.target.value)} /> : null}
      <Button type="button" disabled={field.type === "map" && (!keyDraft || keyDraft in record)} onClick={() => {
        if (field.type === "array") onChange([...items, defaultEconomyValue(field.item)]);
        else { onChange({ ...record, [keyDraft]: defaultEconomyValue(field.item) }); setKeyDraft(""); }
        setIndex(items.length);
      }}>Add record</Button>
    </Box> : null}
  </Box>;
}
