import type { AtlasReferenceSerializerId } from "./entityFieldTypes";
import { getValueAtPath, isRecord } from "./entityFieldAccess";

export function getReferenceOptionValue(entity: unknown): string {
  if (!isRecord(entity)) return "";

  const candidate =
    entity._id ??
    entity.id ??
    entity.i ??
    entity.name ??
    entity.Name ??
    entity.title;

  return candidate == null ? "" : String(candidate);
}

export function getReferenceOptionLabel(
  entity: unknown,
  labelPath?: string,
): string {
  if (!isRecord(entity)) return "";

  if (labelPath) {
    const value = getValueAtPath(entity, labelPath);

    if (value != null && value !== "") return String(value);
  }

  const candidate =
    entity.nameFull ??
    entity.name ??
    entity.Name ??
    entity.title ??
    entity.id ??
    entity._id;

  return candidate == null ? "" : String(candidate);
}

export function getCurrentReferenceValue(value: unknown): string {
  if (value == null) return "";

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (!isRecord(value)) return "";

  const candidate =
    value._id ??
    value.id ??
    value.i ??
    value.name ??
    value.Name ??
    value.title;

  return candidate == null ? "" : String(candidate);
}

export function serializeReferenceValue(
  serializer: AtlasReferenceSerializerId | undefined,
  selectedEntity: unknown,
): unknown {
  if (!isRecord(selectedEntity)) return selectedEntity;

  switch (serializer ?? "raw") {
    case "id":
      return selectedEntity.id ?? "";

    case "numericId": {
      const value = Number(selectedEntity.id ?? selectedEntity.i ?? 0);
      return Number.isFinite(value) ? value : 0;
    }

    case "_id":
      return selectedEntity._id ?? "";

    case "name":
      return selectedEntity.name ?? selectedEntity.Name ?? "";

    case "cityCountryRef":
      return {
        _id: selectedEntity._id,
        id: Number(selectedEntity.id ?? 0),
        name: selectedEntity.name ?? "",
        nameFull: selectedEntity.nameFull ?? selectedEntity.name ?? "",
        govForm: getValueAtPath(selectedEntity, "political.form") ?? "",
        govName: getValueAtPath(selectedEntity, "political.formName") ?? "",
      };

    case "cityCultureRef":
      return {
        _id: selectedEntity._id,
        id: String(selectedEntity.id ?? ""),
        name: selectedEntity.name ?? "",
      };

    case "countryCultureRef":
    case "religionCultureRef":
      return {
        _id: selectedEntity._id,
        id: String(selectedEntity.id ?? ""),
      };

    case "religionCenterRef":
      return {
        i: Number(selectedEntity.id ?? selectedEntity.i ?? 0),
        _id: selectedEntity._id,
        name: selectedEntity.name ?? "",
      };

    case "raw":
    default:
      return structuredClone(selectedEntity);
  }
}
