import type { Tag } from "../../../../definitions/Common";
import type { AtlasSourceType } from "../../../../definitions/Atlas";
import {
	coerceValueForField,
	createDefaultObjectFromFields,
	createLocalId,
	getValueAtPath,
	insertArrayItem,
	isRecord,
	removeArrayItem,
	setValueAtPath,
	updateArrayItem,
} from "./entityFieldAccess";
import type {
	AtlasEntityFieldEditorProps,
	AtlasEntityFieldOption,
	AtlasEntityFieldSchema,
} from "./entityFieldTypes";
import {
	getCurrentReferenceValue,
	getReferenceOptionLabel,
	getReferenceOptionValue,
	serializeReferenceValue,
} from "./referenceSerialization";
import { useMemo, useState } from "react";
import { getAllTags } from "../../../Tags/Tags";
import {
	Autocomplete,
	Button,
	Chip,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Switch,
	TextField,
} from "@mui/material";

export function EntityFieldEditor<TSource extends AtlasSourceType>({
	sourceType,
	entity,
	related,
	schema,
	value,
	onChange,
}: AtlasEntityFieldEditorProps<TSource>) {
	if (schema) {
		if (schema.label && schema.label === "Short Name") schema.label = "Name";
	}
	return (
		<div className="atlas-entity-field">
			{/** biome-ignore lint/a11y/noLabelWithoutControl: too bad */}
			<label className="atlas-entity-field__label">
				<span>{schema.label}</span>
				{schema.description ? <small>{schema.description}</small> : null}
			</label>

			{renderFieldEditor({
				sourceType,
				entity,
				related,
				schema,
				value,
				onChange,
			})}
		</div>
	);
}

function renderFieldEditor<TSource extends AtlasSourceType>(
	props: AtlasEntityFieldEditorProps<TSource>,
) {
	const { schema, value, onChange } = props;

	switch (schema.editor) {
		case "textarea":
			return (
				<textarea
					value={String(value ?? "")}
					placeholder={schema.placeholder}
					onChange={(event) => onChange(event.target.value)}
				/>
			);

		case "number":
			return (
				<input
					type="number"
					value={String(value ?? "")}
					placeholder={schema.placeholder}
					onChange={(event) =>
						onChange(coerceValueForField(event.target.value, schema, value))
					}
				/>
			);

		case "boolean":
			return (
				<FormControlLabel
					className="atlas-boolean-switch"
					control={
						<Switch
							checked={Boolean(value)}
							onChange={(_, checked) => onChange(checked)}
						/>
					}
					label={value ? "True" : "False"}
				/>
			);
		case "select":
			return <SelectFieldEditor {...props} />;

		case "stringList":
			return (
				<StringListEditor schema={schema} value={value} onChange={onChange} />
			);

		case "tagList":
			return <TagListEditor {...props} />;

		case "reference":
			return <ReferenceEditor {...props} />;

		case "referenceList":
			return <ReferenceListEditor {...props} />;

		case "object":
			return <ObjectEditor {...props} />;

		case "objectList":
			return <ObjectListEditor {...props} />;

		case "readonly":
			return <pre>{JSON.stringify(value, null, 2)}</pre>;

		// case "text":
		default:
			return (
				<input
					type="text"
					value={String(value ?? "")}
					placeholder={schema.placeholder}
					onChange={(event) => onChange(event.target.value)}
				/>
			);
	}
}

function StringListEditor({
	schema,
	value,
	onChange,
}: {
	schema: AtlasEntityFieldSchema;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const items = Array.isArray(value) ? value.map((item) => String(item)) : [];
	const hasOptions = Array.isArray(schema.options) && schema.options.length > 0;
	const [selectedOption, setSelectedOption] = useState("");
	const [customItem, setCustomItem] = useState("");

	function addItem(nextItem: string) {
		const trimmed = nextItem.trim();

		if (!trimmed) return;

		const alreadyExists = items.some(
			(item) => item.trim().toLowerCase() === trimmed.toLowerCase(),
		);

		if (alreadyExists) return;

		onChange([...items, trimmed]);
		setSelectedOption("");
		setCustomItem("");
	}

	function removeItem(index: number) {
		onChange(removeArrayItem(items, index));
	}

	if (hasOptions) {
		const applied = new Set(items.map((item) => item.toLowerCase()));

		const availableOptions =
			schema.options?.filter(
				(option) => !applied.has(String(option.value).toLowerCase()),
			) ?? [];

		return (
			<div className="atlas-string-option-list-editor">
				<div className="atlas-string-option-list-editor__applied">
					{items.length > 0 ? (
						items.map((item, index) => (
							<span
								// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
								key={`${schema.path}-${item}-${index}`}
								className="atlas-string-pill"
							>
								<span>{item}</span>

								<Button
									variant="outlined"
									type="button"
									onClick={() => removeItem(index)}
								>
									Remove
								</Button>
							</span>
						))
					) : (
						<p className="atlas-muted">
							No {schema.itemLabel?.toLowerCase() ?? "items"} listed.
						</p>
					)}
				</div>

				<label>
					Add existing {schema.itemLabel?.toLowerCase() ?? "item"}
					<select
						value={selectedOption}
						onChange={(event) => {
							setSelectedOption(event.target.value);
							addItem(event.target.value);
						}}
					>
						<option value="">Select...</option>

						{availableOptions.map((option) => (
							<option key={String(option.value)} value={String(option.value)}>
								{option.label}
							</option>
						))}
					</select>
				</label>

				<label>
					Add custom {schema.itemLabel?.toLowerCase() ?? "item"}
					<div className="atlas-string-option-list-editor__custom">
						<input
							value={customItem}
							placeholder={`New ${schema.itemLabel?.toLowerCase() ?? "item"}`}
							onChange={(event) => setCustomItem(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									addItem(customItem);
								}
							}}
						/>

						<Button
							variant="outlined"
							type="button"
							onClick={() => addItem(customItem)}
						>
							Add
						</Button>
					</div>
				</label>
			</div>
		);
	}

	return (
		<div className="atlas-entity-list-editor">
			{items.map((item, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
				<div key={`${schema.path}-${index}`} className="atlas-row-editor">
					<textarea
						value={item}
						placeholder={schema.itemLabel ?? "Item"}
						onChange={(event) =>
							onChange(updateArrayItem(items, index, event.target.value))
						}
					/>

					<Button
						variant="outlined"
						type="button"
						onClick={() => removeItem(index)}
					>
						Remove
					</Button>
				</div>
			))}

			<Button
				variant="outlined"
				type="button"
				onClick={() => onChange(insertArrayItem(items, ""))}
			>
				Add {schema.itemLabel ?? "item"}
			</Button>
		</div>
	);
}

type NewTagDraft = {
	name: string;
	description: string;
	type: string;
};

function TagListEditor<TSource extends AtlasSourceType>({
	entity,
	related,
	value,
	onChange,
	onRelatedUpdate,
}: AtlasEntityFieldEditorProps<TSource>) {
	const appliedTags = normalizeAppliedTags(value);
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newTagDraft, setNewTagDraft] = useState<NewTagDraft>(() =>
		createEmptyNewTagDraft(),
	);

	const availableTags = useMemo(
		() =>
			sortTagsByTypeThenName(mergeAvailableTags(related?.tags, appliedTags)),
		[related?.tags, appliedTags],
	);

	function openCreateDialog() {
		setNewTagDraft(createEmptyNewTagDraft());
		setIsCreateDialogOpen(true);
	}

	function closeCreateDialog() {
		setIsCreateDialogOpen(false);
		setNewTagDraft(createEmptyNewTagDraft());
	}

	function createAndApplyTag() {
		const trimmedName = newTagDraft.name.trim();

		if (!trimmedName) return;

		const existing = availableTags.find(
			(tag) => normalizeTagText(tag.Name) === normalizeTagText(trimmedName),
		);

		if (existing) {
			const alreadyApplied = appliedTags.some(
				(tag) => tag._id === existing._id,
			);

			if (!alreadyApplied) {
				onChange(sortTagsByTypeThenName([...appliedTags, existing]));
			}

			closeCreateDialog();
			return;
		}

		const newTag: Tag & { mapId?: string } = {
			_id: createLocalId("tag"),
			Name: trimmedName,
			Type: formatCustomTagType(newTagDraft.type),
			Default: false,
			Description: newTagDraft.description.trim(),
			mapId: getEntityMapId(entity),
		};

		onRelatedUpdate?.({
			action: "add",
			store: "tags",
			value: newTag,
		});

		onChange(sortTagsByTypeThenName([...appliedTags, newTag]));
		closeCreateDialog();
	}

	return (
		<div className="atlas-tag-picker atlas-tag-picker--autocomplete">
			<Autocomplete
				multiple
				disableCloseOnSelect
				options={availableTags}
				value={sortTagsByTypeThenName(appliedTags)}
				groupBy={(tag) => getTagTypeLabel(tag)}
				getOptionLabel={(tag) => getTagName(tag)}
				isOptionEqualToValue={(option, selectedValue) =>
					option._id === selectedValue._id
				}
				onChange={(_, nextTags) => {
					onChange(sortTagsByTypeThenName(nextTags));
				}}
				renderTags={(selectedTags, getTagProps) =>
					selectedTags.map((tag, index) => (
						// biome-ignore lint/correctness/useJsxKeyInIterable: adding key is warned that is overwritten.
						<Chip
							label={formatTagChipLabel(tag)}
							size="small"
							{...getTagProps({ index })}
						/>
					))
				}
				renderInput={(params) => (
					<TextField
						{...params}
						label="Tags"
						placeholder="Search or select tags..."
					/>
				)}
			/>

			<div className="atlas-tag-picker__actions">
				<Button type="button" variant="outlined" onClick={openCreateDialog}>
					Create New Tag
				</Button>
			</div>

			<Dialog
				open={isCreateDialogOpen}
				onClose={closeCreateDialog}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>Create New Tag</DialogTitle>

				<DialogContent className="atlas-tag-dialog">
					<TextField
						label="Name"
						value={newTagDraft.name}
						onChange={(event) =>
							setNewTagDraft((current) => ({
								...current,
								name: event.target.value,
							}))
						}
						fullWidth
						autoFocus
						margin="normal"
					/>

					<TextField
						label="Description"
						value={newTagDraft.description}
						onChange={(event) =>
							setNewTagDraft((current) => ({
								...current,
								description: event.target.value,
							}))
						}
						fullWidth
						multiline
						minRows={4}
						margin="normal"
					/>

					<TextField
						label="Type"
						value={newTagDraft.type}
						onChange={(event) =>
							setNewTagDraft((current) => ({
								...current,
								type: event.target.value,
							}))
						}
						fullWidth
						margin="normal"
						helperText={`Saved as: ${formatCustomTagType(newTagDraft.type)}`}
					/>
				</DialogContent>

				<DialogActions>
					<Button type="button" onClick={closeCreateDialog}>
						Cancel
					</Button>

					<Button
						type="button"
						variant="contained"
						disabled={!newTagDraft.name.trim()}
						onClick={createAndApplyTag}
					>
						Create & Apply
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

function normalizeAppliedTags(value: unknown): Tag[] {
	if (!Array.isArray(value)) return [];

	return value
		.map((tag) => normalizeTag(tag))
		.filter((tag): tag is Tag => Boolean(tag));
}

function mergeAvailableTags(
	activeMapTags: Tag[] | undefined,
	appliedTags: Tag[],
): Tag[] {
	const output: Tag[] = [];
	const seen = new Set<string>();

	function addTag(tag: unknown) {
		const normalized = normalizeTag(tag);

		if (!normalized) return;
		if (seen.has(normalized._id)) return;

		seen.add(normalized._id);
		output.push(normalized);
	}

	for (const tag of activeMapTags ?? []) {
		addTag(tag);
	}

	for (const group of getAllTags()) {
		for (const tag of group.Tags ?? []) {
			addTag(tag);
		}
	}

	for (const tag of appliedTags) {
		addTag(tag);
	}

	return output.sort((a, b) => {
		const typeCompare = String(a.Type ?? "").localeCompare(
			String(b.Type ?? ""),
		);

		if (typeCompare !== 0) return typeCompare;

		return String(a.Name ?? "").localeCompare(String(b.Name ?? ""));
	});
}

function normalizeTag(value: unknown): Tag | null {
	if (!value || typeof value !== "object") return null;

	const record = value as Record<string, unknown>;
	const id = record._id;

	if (typeof id !== "string" || !id) return null;

	return {
		_id: id,
		Name: typeof record.Name === "string" ? record.Name : "",
		Type: typeof record.Type === "string" ? record.Type : "",
		Default: Boolean(record.Default),
		Description:
			typeof record.Description === "string" ? record.Description : "",
	};
}

function ReferenceEditor<TSource extends AtlasSourceType>({
	related,
	schema,
	value,
	onChange,
}: AtlasEntityFieldEditorProps<TSource>) {
	const options = schema.referenceCollection
		? (related?.[schema.referenceCollection] ?? [])
		: [];

	const currentValue = getCurrentReferenceValue(value);

	return (
		<select
			value={currentValue}
			onChange={(event) => {
				const selectedEntity = options.find(
					(option) => getReferenceOptionValue(option) === event.target.value,
				);

				onChange(
					selectedEntity
						? serializeReferenceValue(
								schema.referenceSerializer,
								selectedEntity,
							)
						: "",
				);
			}}
		>
			<option value="">Select...</option>

			{options.map((option, index) => {
				const optionValue = getReferenceOptionValue(option);

				return (
					<option
						// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
						key={`${schema.path}-${index}-${optionValue}`}
						value={optionValue}
					>
						{getReferenceOptionLabel(option, schema.referenceLabelPath)}
					</option>
				);
			})}
		</select>
	);
}

function ReferenceListEditor<TSource extends AtlasSourceType>({
	related,
	schema,
	value,
	onChange,
}: AtlasEntityFieldEditorProps<TSource>) {
	const items = Array.isArray(value) ? value : [];
	const options = schema.referenceCollection
		? (related?.[schema.referenceCollection] ?? [])
		: [];

	function addReference(rawValue: string) {
		const selectedEntity = options.find(
			(option) => getReferenceOptionValue(option) === rawValue,
		);

		if (!selectedEntity) return;

		onChange([
			...items,
			serializeReferenceValue(schema.referenceSerializer, selectedEntity),
		]);
	}

	return (
		<div className="atlas-entity-list-editor">
			{items.map((item, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
				<div key={`${schema.path}-${index}`} className="atlas-row-editor">
					<span>{getReferenceOptionLabel(item) || String(item)}</span>

					<Button
						variant="outlined"
						type="button"
						onClick={() => onChange(removeArrayItem(items, index))}
					>
						Remove
					</Button>
				</div>
			))}

			<select
				value=""
				onChange={(event) => {
					addReference(event.target.value);
					event.currentTarget.value = "";
				}}
			>
				<option value="">Add {schema.itemLabel ?? "reference"}...</option>

				{options.map((option, index) => {
					const optionValue = getReferenceOptionValue(option);

					return (
						<option
							// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
							key={`${schema.path}-add-${index}-${optionValue}`}
							value={optionValue}
						>
							{getReferenceOptionLabel(option, schema.referenceLabelPath)}
						</option>
					);
				})}
			</select>
		</div>
	);
}

function ObjectEditor<TSource extends AtlasSourceType>(
	props: AtlasEntityFieldEditorProps<TSource>,
) {
	const { schema, value, onChange } = props;
	const objectValue = isRecord(value) ? value : {};

	return (
		<div className="atlas-entity-object-card">
			{schema.itemFields?.map((field) => (
				<EntityFieldEditor
					key={field.path}
					sourceType={props.sourceType}
					entity={props.entity}
					related={props.related}
					schema={field}
					value={getValueAtPath(objectValue, field.path)}
					onChange={(nextValue) =>
						onChange(setValueAtPath(objectValue, field.path, nextValue))
					}
				/>
			))}
		</div>
	);
}

function ObjectListEditor<TSource extends AtlasSourceType>(
	props: AtlasEntityFieldEditorProps<TSource>,
) {
	const { schema, value, onChange } = props;
	const items = Array.isArray(value) ? value : [];

	return (
		<div className="atlas-entity-list-editor">
			{items.map((item, index) => {
				const objectItem = isRecord(item) ? item : {};

				return (
					<div
						// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
						key={`${schema.path}-${index}`}
						className="atlas-entity-object-card"
					>
						<header className="atlas-entity-object-card__header">
							<strong>
								{schema.itemLabel ?? "Item"} {index + 1}
							</strong>

							<Button
								variant="outlined"
								type="button"
								onClick={() => onChange(removeArrayItem(items, index))}
							>
								Remove
							</Button>
						</header>

						{schema.itemFields?.map((field) => (
							<EntityFieldEditor
								key={field.path}
								sourceType={props.sourceType}
								entity={props.entity}
								related={props.related}
								schema={field}
								value={getValueAtPath(objectItem, field.path)}
								onChange={(nextValue) =>
									onChange(
										updateArrayItem(
											items,
											index,
											setValueAtPath(objectItem, field.path, nextValue),
										),
									)
								}
							/>
						))}
					</div>
				);
			})}

			<Button
				variant="outlined"
				type="button"
				onClick={() =>
					onChange([
						...items,
						createDefaultObjectFromFields(schema.itemFields ?? []),
					])
				}
			>
				Add {schema.itemLabel ?? "item"}
			</Button>
		</div>
	);
}

function SelectFieldEditor<TSource extends AtlasSourceType>({
	sourceType,
	related,
	schema,
	value,
	onChange,
}: AtlasEntityFieldEditorProps<TSource>) {
	const options = getSelectOptions({
		sourceType,
		related,
		schema,
		value,
	});

	return (
		<select
			value={String(value ?? "")}
			onChange={(event) => onChange(event.target.value)}
		>
			<option value="">Select...</option>

			{options.map((option) => (
				<option key={String(option.value)} value={String(option.value)}>
					{option.label}
				</option>
			))}
		</select>
	);
}

function getSelectOptions<TSource extends AtlasSourceType>({
	sourceType,
	related,
	schema,
	value,
}: {
	sourceType: TSource;
	related: AtlasEntityFieldEditorProps<TSource>["related"];
	schema: AtlasEntityFieldSchema;
	value: unknown;
}): AtlasEntityFieldOption[] {
	const staticOptions = schema.options ?? [];

	if (sourceType === "country" && schema.path === "type") {
		return mergeSelectOptions(
			staticOptions,
			getKnownCountryTypeOptions(related?.countries, value),
		);
	}

	return mergeSelectOptions(staticOptions, valueToSelectOption(value));
}

function getKnownCountryTypeOptions(
	countries: unknown,
	currentValue: unknown,
): AtlasEntityFieldOption[] {
	const values = new Set<string>();

	if (Array.isArray(countries)) {
		for (const country of countries) {
			if (!country || typeof country !== "object") continue;

			const type = (country as Record<string, unknown>).type;

			if (typeof type === "string" && type.trim()) {
				values.add(type.trim());
			}
		}
	}

	if (typeof currentValue === "string" && currentValue.trim()) {
		values.add(currentValue.trim());
	}

	return Array.from(values)
		.sort((a, b) =>
			a.localeCompare(b, undefined, {
				sensitivity: "base",
				numeric: true,
			}),
		)
		.map((type) => ({
			label: type,
			value: type,
		}));
}

function valueToSelectOption(value: unknown): AtlasEntityFieldOption[] {
	if (typeof value !== "string" || !value.trim()) return [];

	return [
		{
			label: value,
			value,
		},
	];
}

function mergeSelectOptions(
	...optionGroups: AtlasEntityFieldOption[][]
): AtlasEntityFieldOption[] {
	const output: AtlasEntityFieldOption[] = [];
	const seen = new Set<string>();

	for (const options of optionGroups) {
		for (const option of options) {
			const key = String(option.value);

			if (!key.trim()) continue;
			if (seen.has(key)) continue;

			seen.add(key);
			output.push(option);
		}
	}

	return output;
}

function createEmptyNewTagDraft(): NewTagDraft {
	return {
		name: "",
		description: "",
		type: "",
	};
}

function formatCustomTagType(value: string): string {
	const trimmed = value
		.trim()
		.replace(/^Custom\s*-\s*/i, "")
		.trim();

	return `Custom - ${trimmed || "General"}`;
}

function formatTagChipLabel(tag: Tag): string {
	const name = getTagName(tag);
	const type = getTagTypeLabel(tag);

	if (!type || type === "Uncategorized") return name;

	return `${name} · ${type}`;
}

function sortTagsByTypeThenName(tags: Tag[]): Tag[] {
	return [...tags].sort((a, b) => {
		const typeCompare = getTagTypeLabel(a).localeCompare(
			getTagTypeLabel(b),
			undefined,
			{
				sensitivity: "base",
				numeric: true,
			},
		);

		if (typeCompare !== 0) return typeCompare;

		return getTagName(a).localeCompare(getTagName(b), undefined, {
			sensitivity: "base",
			numeric: true,
		});
	});
}

function getTagTypeLabel(tag: Tag): string {
	const type = tag.Type?.trim();

	if (!type) return "Uncategorized";

	return formatTagTypeLabel(type);
}

function formatTagTypeLabel(value: string): string {
	return value
		.trim()
		.replace(/_/g, " ")
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/\s+/g, " ")
		.trim();
}

function getTagName(tag: Tag): string {
	return tag.Name?.trim() || "Unnamed tag";
}

function normalizeTagText(value: string): string {
	return value.trim().toLowerCase();
}

function getEntityMapId(entity: unknown): string | undefined {
	if (!entity || typeof entity !== "object") return undefined;

	const mapId = (entity as Record<string, unknown>).mapId;

	return typeof mapId === "string" ? mapId : undefined;
}
