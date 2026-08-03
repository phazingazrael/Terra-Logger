import type {
	AtlasBlock,
	AtlasEditorContext,
} from "../../../../definitions/Atlas";
import { detailsRowResolvers } from "../../render/detailsRowResolvers";
import { EntityFieldEditor } from "../entityFields/EntityFieldEditor";
import { getEntityFieldSchema } from "../entityFields/entityFieldCatalog";
import { getValueAtPath } from "../entityFields/entityFieldAccess";
import { Button } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

type Row = {
	id: string;
	label: string;
	value?: string;
	valueMode?: "static" | "entity" | "computed";
	resolver?: string;
	args?: Record<string, unknown>;
	emptyText?: string;
	hideWhenEmpty?: boolean;
	hideWhenEqualTo?: string;
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

	function updateRow(rowId: string, nextRow: Row) {
		setRows(rows.map((row) => (row.id === rowId ? nextRow : row)));
	}

	function removeRow(rowId: string) {
		setRows(
			rows.filter((row) => row.id !== rowId || row.valueMode === "computed"),
		);
	}

	return (
		<div className="atlas-field-stack">
			{rows.map((row) => {
				const mode = row.valueMode ?? "static";
				const isComputed = mode === "computed";

				return (
					<div key={row.id} className="atlas-details-row-editor">
						<div className="atlas-row-editor">
							<label>
								Row label
								<input
									value={row.label}
									placeholder="Label"
									onChange={(event) =>
										updateRow(row.id, {
											...row,
											label: event.target.value,
										})
									}
								/>
							</label>

							{!isComputed ? (
								<Button
									variant="outlined"
									type="button"
									onClick={() => removeRow(row.id)}
								>
									Remove
								</Button>
							) : null}
						</div>

						<DetailsRowValueEditor
							row={row}
							context={context}
							onStaticChange={(value) =>
								updateRow(row.id, {
									...row,
									value,
									valueMode: "static",
									id: uuidv4(),
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
							id: uuidv4(),
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
				label={row.label || "Detail value"}
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
					label={row.label || "Detail value"}
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
					label={row.label || "Detail value"}
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
	label,
	onChange,
}: {
	value: unknown;
	emptyText?: string;
	disabled?: boolean;
	label: string;
	onChange?: (value: string | boolean) => void;
}) {
	if (typeof value === "boolean") {
		return (
			<select
				aria-label={label}
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
			.flatMap((item) => {
				if (typeof item === "string") return item ? [item] : [];
				if (typeof item === "number" || typeof item === "boolean") {
					return [String(item)];
				}

				if (item && typeof item === "object") {
					const record = item as Record<string, unknown>;
					const text = String(record.name ?? record.Name ?? record.label ?? "");
					return text ? [text] : [];
				}

				return [];
			})
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
