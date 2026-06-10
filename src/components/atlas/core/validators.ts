import { ATLAS_CONTENT_SCHEMA, ATLAS_CONTENT_VERSION, type AtlasContent } from "../../../definitions/Atlas";

export function isAtlasContent(value: unknown): value is AtlasContent {
	if (!value || typeof value !== "object") return false;
	const maybe = value as Partial<AtlasContent>;
	return (
		maybe.schema === ATLAS_CONTENT_SCHEMA &&
		maybe.kind === "AtlasContent" &&
		maybe.version === ATLAS_CONTENT_VERSION &&
		Array.isArray(maybe.sections)
	);
}
