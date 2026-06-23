import type { AtlasEntityFieldSchema } from "./entityFieldTypes";

export function getValueAtPath(source: unknown, path?: string): unknown {
  if (!path) return undefined;

  return path.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;

    return (current as Record<string, unknown>)[segment];
  }, source);
}

export function setValueAtPath<T>(source: T, path: string, value: unknown): T {
  if (!path) return source;

  const clone = structuredClone(source) as Record<string, unknown>;
  const segments = path.split(".").filter(Boolean);

  if (segments.length === 0) return clone as T;

  let current = clone;

  for (const segment of segments.slice(0, -1)) {
    const next = current[segment];

    if (!next || typeof next !== "object" || Array.isArray(next)) {
      current[segment] = {};
    }

    current = current[segment] as Record<string, unknown>;
  }

  current[segments[segments.length - 1]] = value;

  return clone as T;
}

export function updateArrayItem<T>(
  array: T[],
  index: number,
  nextValue: T,
): T[] {
  return array.map((item, currentIndex) =>
    currentIndex === index ? nextValue : item,
  );
}

export function removeArrayItem<T>(array: T[], index: number): T[] {
  return array.filter((_, currentIndex) => currentIndex !== index);
}

export function insertArrayItem<T>(array: T[], value: T): T[] {
  return [...array, value];
}

export function moveArrayItem<T>(
  array: T[],
  fromIndex: number,
  toIndex: number,
): T[] {
  const clone = [...array];
  const [item] = clone.splice(fromIndex, 1);

  if (item === undefined) return array;

  clone.splice(toIndex, 0, item);

  return clone;
}

export function coerceValueForField(
  rawValue: string,
  schema: AtlasEntityFieldSchema,
  currentValue: unknown,
): unknown {
  if (schema.editor === "number" || typeof currentValue === "number") {
    const numberValue = Number(rawValue);

    return Number.isFinite(numberValue) ? numberValue : currentValue;
  }

  return rawValue;
}

export function createDefaultValueForField(
  schema: AtlasEntityFieldSchema,
): unknown {
  switch (schema.editor) {
    case "number":
      return 0;

    case "boolean":
      return false;

    case "stringList":
    case "tagList":
    case "referenceList":
    case "objectList":
      return [];

    case "object":
      return createDefaultObjectFromFields(schema.itemFields ?? []);

    case "textarea":
    case "text":
    case "select":
    case "reference":
    case "readonly":
    default:
      return "";
  }
}

export function createDefaultObjectFromFields(
  fields: AtlasEntityFieldSchema[],
): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const field of fields) {
    output[field.path] = createDefaultValueForField(field);
  }

  return output;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function createLocalId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
