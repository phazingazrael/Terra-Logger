import type {
	AtlasBlock,
	AtlasEditorContext,
	AtlasSourceType,
} from "../../../../definitions/Atlas";
import { EntityFieldEditor } from "../entityFields/EntityFieldEditor";
import {
	computedBlockEditableFields,
	getEntityFieldSchema,
	getEntityFieldSchemas,
} from "../entityFields/entityFieldCatalog";
import { getValueAtPath } from "../entityFields/entityFieldAccess";

export function EntityBlockEditor({
	block,
	context,
}: {
	block: AtlasBlock;
	context: AtlasEditorContext;
}) {
	const schemas = getSchemasForBlock(block, context);

	if (schemas.length === 0) {
		return (
			<div className="atlas-entity-block-editor">
				<p>
					<strong>{block.label ?? "Entity-bound block"}</strong>
				</p>
				<p>
					No editable entity fields are registered for{" "}
					<code>
						{block.binding?.entityPath ?? block.binding?.resolver ?? block.type}
					</code>
					.
				</p>
			</div>
		);
	}

	const capitalizedLabel = (block.label ?? block.type)
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");

	return (
		<div className="atlas-entity-block-editor">
			<header className="atlas-entity-block-editor__header">
				<strong>{capitalizedLabel}</strong>
				<small>{schemas.length} editable field(s)</small>
			</header>

			<div className="atlas-entity-block-editor__fields">
				{schemas.map((schema) => (
					<EntityFieldEditor
						key={schema.path}
						sourceType={context.sourceType}
						entity={context.entity}
						related={context.related}
						schema={schema}
						value={getValueAtPath(context.entity, schema.path)}
						onChange={(value) =>
							context.onEntityFieldChange({
								path: schema.path,
								value,
							})
						}
						onRelatedUpdate={context.onRelatedUpdate}
					/>
				))}
			</div>
		</div>
	);
}

function getSchemasForBlock(block: AtlasBlock, context: AtlasEditorContext) {
	const sourceType = context.sourceType as AtlasSourceType;

	const directPaths = getDirectEntityPaths(block, sourceType);

	if (directPaths.length > 0) {
		return getEntityFieldSchemas(sourceType, directPaths);
	}

	if (block.dataMode === "computed") {
		const computedPaths =
			computedBlockEditableFields[sourceType]?.[block.type] ??
			computedBlockEditableFields[sourceType]?.[
				String(block.binding?.resolver ?? "")
			] ??
			getFallbackComputedPaths(block, sourceType);

		return getEntityFieldSchemas(sourceType, computedPaths);
	}

	return [];
}

function getDirectEntityPaths(
	block: AtlasBlock,
	sourceType: AtlasSourceType,
): string[] {
	const paths: string[] = [];

	if (block.binding?.entityPath) {
		paths.push(normalizeEntityPath(block.binding.entityPath, sourceType));
	}

	const groups = block.props.groups;

	if (Array.isArray(groups)) {
		for (const group of groups) {
			if (!group || typeof group !== "object") continue;

			const entityPath = (group as Record<string, unknown>).entityPath;

			if (typeof entityPath === "string") {
				paths.push(normalizeEntityPath(entityPath, sourceType));
			}
		}
	}

	return [...new Set(paths)].filter(Boolean);
}

function getFallbackComputedPaths(
	block: AtlasBlock,
	sourceType: AtlasSourceType,
): string[] {
	const resolver = String(block.binding?.resolver ?? "");

	if (block.type === "description" || resolver === "generic.description") {
		return sourceType === "note" ? ["legend"] : ["description"];
	}

	if (resolver === "tags") {
		return ["tags"];
	}

	if (resolver.startsWith(`${sourceType}.`)) {
		return [normalizeEntityPath(resolver, sourceType)];
	}

	const schema = getEntityFieldSchema(sourceType, resolver);

	return schema ? [resolver] : [];
}

function normalizeEntityPath(
	path: string,
	sourceType: AtlasSourceType,
): string {
	if (path.startsWith(`${sourceType}.`)) {
		return path.slice(sourceType.length + 1);
	}

	return path;
}
