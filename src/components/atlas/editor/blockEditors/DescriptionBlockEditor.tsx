import { useEffect, useMemo, useState } from "react";
import type {
	AtlasEditorContext,
	AtlasSourceType,
} from "../../../../definitions/Atlas";
import type { TLNote } from "../../../../definitions/TerraLogger";
import {
	createRichTextJson,
	htmlToRichTextJson,
	readPlainTextFromRichTextValue,
	richTextJsonToHtml,
} from "../../core/richText";
import { RichTextEditor } from "../../rte/RichTextEditor";

type DescriptionSource = {
	key: string;
	json: string;
	matchedNote: TLNote | null;
	entityPath: "description" | "legend";
};

export function DescriptionBlockEditor({
	context,
}: {
	context: AtlasEditorContext;
}) {
	const source = useMemo(
		() => resolveDescriptionEditorSource(context),
		[context],
	);
	const [loadedSourceKey, setLoadedSourceKey] = useState(source.key);
	const [editorValue, setEditorValue] = useState(source.json);

	useEffect(() => {
		if (source.key === loadedSourceKey) return;

		setLoadedSourceKey(source.key);
		setEditorValue(source.json);
	}, [source.key, source.json, loadedSourceKey]);

	function handleChange(json: string) {
		setEditorValue(json);

		const plainText = readPlainTextFromRichTextValue(json).trim();
		const html = plainText ? richTextJsonToHtml(json).trim() : "";

		context.onEntityFieldChange({
			path: source.entityPath,
			value: html,
		});

		if (source.matchedNote) {
			context.onRelatedUpdate({
				action: "update",
				store: "notes",
				key: source.matchedNote._id,
				value: {
					...source.matchedNote,
					legend: html,
				},
			});
		}
	}

	return (
		<div className="atlas-description-editor">
			{source.matchedNote ? (
				<p className="atlas-description-editor__source">
					Loaded from matching note: <strong>{source.matchedNote.name}</strong>
				</p>
			) : null}

			<RichTextEditor value={editorValue} onChange={handleChange} />
		</div>
	);
}

function resolveDescriptionEditorSource(
	context: AtlasEditorContext,
): DescriptionSource {
	const entityPath = getDescriptionEntityPath(context.sourceType);
	const entityDescription = getEntityDescriptionValue(
		context.entity,
		entityPath,
	);
	const matchedNote = findMatchingDescriptionNote(context);
	const sourceKey = getDescriptionSourceKey(context, matchedNote);

	if (context.sourceType === "note") {
		return {
			key: sourceKey,
			json: normalizeDescriptionToRichTextJson(entityDescription),
			matchedNote: null,
			entityPath,
		};
	}

	if (matchedNote) {
		const noteDescription =
			getNoteDescriptionValue(matchedNote) || entityDescription;

		return {
			key: sourceKey,
			json: normalizeDescriptionToRichTextJson(noteDescription),
			matchedNote,
			entityPath,
		};
	}

	return {
		key: sourceKey,
		json: normalizeDescriptionToRichTextJson(entityDescription),
		matchedNote: null,
		entityPath,
	};
}

function getDescriptionEntityPath(
	sourceType: AtlasSourceType,
): "description" | "legend" {
	return sourceType === "note" ? "legend" : "description";
}

function getEntityDescriptionValue(
	entity: unknown,
	path: "description" | "legend",
): string {
	if (!entity || typeof entity !== "object") return "";

	const record = entity as Record<string, unknown>;
	const value = record[path];

	return typeof value === "string" ? value : "";
}

function findMatchingDescriptionNote(
	context: AtlasEditorContext,
): TLNote | null {
	if (context.sourceType === "note") return null;

	const notes = context.related?.notes ?? [];
	const entityNames = getEntityNameCandidates(context.entity);
	const wantedType = normalizeType(context.sourceType);

	if (entityNames.size === 0) return null;

	return (
		notes.find((note) => {
			const noteName = normalizeName(note.name);
			const noteType = normalizeType(note.type);

			const nameMatches = entityNames.has(noteName);
			const typeMatches =
				noteType === wantedType || noteType === `${wantedType}s`;

			return nameMatches && typeMatches;
		}) ?? null
	);
}

function normalizeDescriptionToRichTextJson(value: string): string {
	const trimmed = value.trim();

	if (!trimmed) return createRichTextJson("");

	if (looksLikeRichTextJson(trimmed)) {
		return trimmed;
	}

	if (looksLikeHtml(trimmed)) {
		return htmlToRichTextJson(trimmed);
	}

	return createRichTextJson(trimmed);
}

function getEntityNameCandidates(entity: unknown): Set<string> {
	if (!entity || typeof entity !== "object") return new Set();

	const record = entity as Record<string, unknown>;

	return new Set(
		[record.name, record.nameFull].map(normalizeName).filter(Boolean),
	);
}

function normalizeName(value: unknown): string {
	if (typeof value !== "string") return "";

	return value
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

function normalizeType(value: unknown): string {
	if (typeof value !== "string") return "";

	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "");
}

function looksLikeHtml(value: string): boolean {
	return /<\/?[a-z][\s\S]*>/i.test(value);
}

function looksLikeRichTextJson(value: string): boolean {
	return (
		value.startsWith("{") && value.includes('"type"') && value.includes('"doc"')
	);
}

function getDescriptionSourceKey(
	context: AtlasEditorContext,
	matchedNote: TLNote | null,
): string {
	const entityId = getEntityId(context.entity);

	if (matchedNote) {
		return `${context.sourceType}:${entityId}:note:${matchedNote._id}`;
	}

	return `${context.sourceType}:${entityId}:entity`;
}

function getEntityId(entity: unknown): string {
	if (!entity || typeof entity !== "object") return "unknown";

	const record = entity as Record<string, unknown>;

	return String(record._id ?? record.id ?? record.name ?? "unknown");
}

function getNoteDescriptionValue(note: TLNote): string {
	const record = note as Record<string, unknown>;

	for (const key of ["legend", "description", "Description"]) {
		const value = record[key];

		if (typeof value === "string" && value.trim()) {
			return value;
		}
	}

	return "";
}
