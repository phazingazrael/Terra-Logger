import { entitySplitListBlock } from "../../core/presets";
import { findEconomyTradeBlock } from "../../core/ensureEconomySummary";
import { SplitListBlockEditor } from "./SplitListBlockEditor";
import { useMemo, useState } from "react";
import { MenuItem, TextField } from "@mui/material";
import type { AtlasBlock, AtlasEditorContext } from "../../../../definitions/Atlas";
import type { TLCity, TLCountry } from "../../../../definitions/TerraLogger";
import type { TLMapEconomy } from "../../../../definitions/Economy";
import { cityEconomyField, countryEconomyField, sharedEconomyField } from "../../core/economyFields";
import { EntityFieldEditor } from "../entityFields/EntityFieldEditor";
import { getEntityFieldSchemas } from "../entityFields/entityFieldCatalog";
import { getValueAtPath } from "../entityFields/entityFieldAccess";
import { EconomyValueEditor } from "./EconomyValueEditor";

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
