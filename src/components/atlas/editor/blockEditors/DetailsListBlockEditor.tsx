import type {
	AtlasBlock,
	AtlasEditorContext,
} from "../../../../definitions/Atlas";
import { detailsRowResolvers } from "../../render/detailsRowResolvers";
import { EntityFieldEditor } from "../entityFields/EntityFieldEditor";
import { getEntityFieldSchema } from "../entityFields/entityFieldCatalog";
import { getValueAtPath } from "../entityFields/entityFieldAccess";
import { Button } from "@mui/material";

type Row = {
	label: string;
	value?: string;
	valueMode?: "static" | "entity" | "computed";
	resolver?: string;
	args?: Record<string, unknown>;
	emptyText?: string;
};

export function DetailsListBlockEditor({
	block,
	context,
	onChange,
}: Readonly<{
	block: AtlasBlock;
	context: AtlasEditorContext;
	onChange: (block: AtlasBlock) => void;
}>) {
	const rows = (
		Array.isArray(block.props.rows) ? block.props.rows : []
	) as Row[];

	function setRows(nextRows: Row[]) {
		onChange({ ...block, props: { ...block.props, rows: nextRows } });
	}

	function updateRow(index: number, nextRow: Row) {
		setRows(
			rows.map((row, currentIndex) => (currentIndex === index ? nextRow : row)),
		);
	}

	function removeRow(index: number) {
		setRows(
			rows.filter((row, currentIndex) => {
				if (currentIndex !== index) return true;

				return row.valueMode === "computed";
			}),
		);
	}

	return (
		<div className="atlas-field-stack">
			{rows.map((row, index) => {
				const mode = row.valueMode ?? "static";
				const isComputed = mode === "computed";

				return (
					// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
					<div key={`row-${index}`} className="atlas-details-row-editor">
						<div className="atlas-row-editor">
							<input
								value={row.label}
								placeholder="Label"
								onChange={(event) =>
									updateRow(index, {
										...row,
										label: event.target.value,
									})
								}
							/>

							{!isComputed ? (
								<Button
									variant="outlined"
									type="button"
									onClick={() => removeRow(index)}
								>
									Remove
								</Button>
							) : null}
						</div>

						<DetailsRowValueEditor
							row={row}
							context={context}
							onStaticChange={(value) =>
								updateRow(index, {
									...row,
									value,
									valueMode: "static",
								})
							}
						/>
					</div>
				);
			})}

			<Button
				variant="outlined"
				type="button"
				onClick={() =>
					setRows([
						...rows,
						{
							label: "Label",
							value: "Value",
							valueMode: "static",
						},
					])
				}
			>
				Add row
			</Button>
		</div>
	);
}

function DetailsRowValueEditor({
	row,
	context,
	onStaticChange,
}: {
	row: Row;
	context: AtlasEditorContext;
	onStaticChange: (value: string) => void;
}) {
	const mode = row.valueMode ?? "static";

	if (mode === "computed") {
		const resolvedValue = resolveComputedValue(row, context);

		return (
			<ResolvedDetailsValueEditor
				value={resolvedValue}
				disabled
				emptyText={row.emptyText}
			/>
		);
	}

	if (mode === "entity") {
		const entityPath = row.value ?? "";
		const schema = getEntityFieldSchema(context.sourceType, entityPath);
		const resolvedValue = getValueAtPath(context.entity, entityPath);

		if (!schema) {
			return (
				<ResolvedDetailsValueEditor
					value={resolvedValue}
					emptyText={row.emptyText}
					onChange={(nextValue) =>
						context.onEntityFieldChange({
							path: entityPath,
							value: nextValue,
						})
					}
				/>
			);
		}

		if (isSimpleDetailsField(schema.editor)) {
			return (
				<ResolvedDetailsValueEditor
					value={resolvedValue}
					emptyText={row.emptyText}
					onChange={(nextValue) =>
						context.onEntityFieldChange({
							path: schema.path,
							value: coerceDetailsValue(nextValue, resolvedValue),
						})
					}
				/>
			);
		}

		return (
			<EntityFieldEditor
				sourceType={context.sourceType}
				entity={context.entity}
				related={context.related}
				schema={schema}
				value={resolvedValue}
				onChange={(value) =>
					context.onEntityFieldChange({
						path: schema.path,
						value,
					})
				}
				onRelatedUpdate={context.onRelatedUpdate}
			/>
		);
	}

	return (
		<textarea
			value={String(row.value ?? "")}
			placeholder={row.emptyText ?? "Value"}
			onChange={(event) => onStaticChange(event.target.value)}
		/>
	);
}

function ResolvedDetailsValueEditor({
	value,
	emptyText,
	disabled = false,
	onChange,
}: {
	value: unknown;
	emptyText?: string;
	disabled?: boolean;
	onChange?: (value: string | boolean) => void;
}) {
	if (typeof value === "boolean") {
		return (
			<select
				value={String(value)}
				disabled={disabled}
				onChange={(event) => onChange?.(event.target.value === "true")}
			>
				<option value="true">True</option>
				<option value="false">False</option>
			</select>
		);
	}

	return (
		<textarea
			value={formatDetailsValue(value, emptyText)}
			disabled={disabled}
			placeholder={emptyText ?? "Value"}
			onChange={(event) => onChange?.(event.target.value)}
		/>
	);
}

function resolveComputedValue(row: Row, context: AtlasEditorContext): unknown {
	if (!row.resolver) return row.emptyText ?? "";

	const resolver = detailsRowResolvers[row.resolver];

	if (!resolver) return row.emptyText ?? "";

	return resolver(context, row.args);
}

function formatDetailsValue(value: unknown, emptyText?: string): string {
	if (value == null || value === "") return emptyText ?? "";
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);

	if (Array.isArray(value)) {
		return value
			.map((item) => {
				if (typeof item === "string") return item;
				if (typeof item === "number" || typeof item === "boolean")
					return String(item);

				if (item && typeof item === "object") {
					const record = item as Record<string, unknown>;
					return String(record.name ?? record.Name ?? record.label ?? "");
				}

				return "";
			})
			.filter(Boolean)
			.join("\n");
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;

		return String(
			record.name ?? record.Name ?? record.label ?? JSON.stringify(value),
		);
	}

	return String(value);
}

function coerceDetailsValue(
	nextValue: string | boolean,
	currentValue: unknown,
): unknown {
	if (typeof nextValue === "boolean") return nextValue;

	if (typeof currentValue === "number") {
		const numberValue = Number(nextValue);

		return Number.isFinite(numberValue) ? numberValue : currentValue;
	}

	return nextValue;
}

function isSimpleDetailsField(editor: string): boolean {
	return (
		editor === "text" ||
		editor === "textarea" ||
		editor === "number" ||
		editor === "boolean" ||
		editor === "select" ||
		editor === "readonly"
	);
}
