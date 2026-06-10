import type { AtlasRenderContext } from "../../../definitions/Atlas";

export function getValueAtPath(source: unknown, path?: string): unknown {
	if (!path) return undefined;
	return path.split(".").reduce<unknown>((current, segment) => {
		if (!current || typeof current !== "object") return undefined;
		return (current as Record<string, unknown>)[segment];
	}, source);
}

export function formatValue(value: unknown): string {
	if (value == null) return "";
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") return String(value);
	if (Array.isArray(value)) {
		return value
			.map((entry) => {
				if (typeof entry === "string") return entry;
				if (entry && typeof entry === "object" && "name" in entry) return String((entry as { name: unknown }).name);
				if (entry && typeof entry === "object" && "Name" in entry) return String((entry as { Name: unknown }).Name);
				return String(entry);
			})
			.filter(Boolean)
			.join(", ");
	}
	if (typeof value === "object" && "name" in value) return String((value as { name: unknown }).name);
	if (typeof value === "object" && "Name" in value) return String((value as { Name: unknown }).Name);
	return JSON.stringify(value);
}

export function getEntityValue(context: AtlasRenderContext, path?: string): unknown {
	return getValueAtPath(context.entity, path);
}
