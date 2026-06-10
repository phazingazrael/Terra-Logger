import type { AtlasAdapter, AtlasEntityBySource, AtlasSourceType } from "../../../definitions/Atlas";
import { cityAdapter } from "./cityAdapter";
import { countryAdapter } from "./countryAdapter";
import { cultureAdapter } from "./cultureAdapter";
import { noteAdapter } from "./noteAdapter";
import { religionAdapter } from "./religionAdapter";

export const atlasAdapters = {
  city: cityAdapter,
  country: countryAdapter,
  culture: cultureAdapter,
  religion: religionAdapter,
  note: noteAdapter,
} satisfies { [K in AtlasSourceType]: AtlasAdapter<K> };

export function getAtlasAdapter<TSource extends AtlasSourceType>(sourceType: TSource): AtlasAdapter<TSource> {
  return atlasAdapters[sourceType] as unknown as AtlasAdapter<TSource>;
}

export function createDefaultAtlasContent<TSource extends AtlasSourceType>(
  sourceType: TSource,
  entity: AtlasEntityBySource[TSource],
) {
  return getAtlasAdapter(sourceType).createDefaultContent(entity);
}
