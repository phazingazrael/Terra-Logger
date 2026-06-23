import { Button } from "@mui/material";
import type {
	AtlasBlock,
	AtlasEditorContext,
} from "../../../../definitions/Atlas";
import {
	getValueAtPath,
	updateArrayItem,
	removeArrayItem,
	insertArrayItem,
} from "../entityFields/entityFieldAccess";

type SplitListGroup = {
	name?: string;
	label?: string;
	children?: unknown[];
	entityPath?: string;
	emptyText?: string;
};

export function SplitListBlockEditor({
	block,
	context,
	onChange,
}: {
	block: AtlasBlock;
	context: AtlasEditorContext;
	onChange: (block: AtlasBlock) => void;
}) {
	const groups = getGroups(block);
	const isEntityBacked = block.dataMode === "entity";

	function setGroups(nextGroups: SplitListGroup[]) {
		onChange({
			...block,
			props: {
				...block.props,
				groups: nextGroups,
			},
		});
	}

	function updateGroup(index: number, nextGroup: SplitListGroup) {
		setGroups(
			groups.map((group, currentIndex) =>
				currentIndex === index ? nextGroup : group,
			),
		);
	}

	function removeGroup(index: number) {
		setGroups(groups.filter((_, currentIndex) => currentIndex !== index));
	}

	function addGroup() {
		if (isEntityBacked) {
			const label = window.prompt("Sub-list name", "New List")?.trim();

			if (!label) return;

			const entityPath = createEntityPathForNewGroup(label, groups);

			setGroups([
				...groups,
				{
					label,
					entityPath,
					emptyText: `No ${label.toLowerCase()} listed.`,
				},
			]);

			context.onEntityFieldChange({
				path: entityPath,
				value: [],
			});

			return;
		}

		setGroups([
			...groups,
			{
				name: "New List",
				children: ["New item"],
			},
		]);
	}

	return (
		<div className="atlas-split-list-editor">
			<div className="atlas-split-list-editor__wrapper">
				{groups.map((group, groupIndex) => (
					<SplitListGroupEditor
						// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
						key={`split-group-${groupIndex}-${getGroupDisplayName(group, groupIndex)}`}
						block={block}
						context={context}
						group={group}
						groupIndex={groupIndex}
						onChange={(nextGroup) => updateGroup(groupIndex, nextGroup)}
						onRemove={() => removeGroup(groupIndex)}
					/>
				))}
			</div>

			<Button variant="outlined" type="button" onClick={addGroup}>
				Add sub-list
			</Button>
		</div>
	);
}

function SplitListGroupEditor({
	block,
	context,
	group,
	groupIndex,
	onChange,
	onRemove,
}: {
	block: AtlasBlock;
	context: AtlasEditorContext;
	group: SplitListGroup;
	groupIndex: number;
	onChange: (group: SplitListGroup) => void;
	onRemove: () => void;
}) {
	const isEntityBacked = block.dataMode === "entity";
	const displayName = getGroupDisplayName(group, groupIndex);

	function updateDisplayName(nextName: string) {
		if (isEntityBacked || typeof group.label === "string") {
			onChange({
				...group,
				label: nextName,
			});

			return;
		}

		onChange({
			...group,
			name: nextName,
		});
	}

	return (
		<section className="atlas-split-list-group-editor">
			<header className="atlas-split-list-group-editor__header">
				<strong>{displayName || `Sub-list ${groupIndex + 1}`}</strong>

				<Button variant="outlined" type="button" onClick={onRemove}>
					Remove sub-list
				</Button>
			</header>

			<label>
				Sub-list name
				<input
					value={displayName}
					onChange={(event) => updateDisplayName(event.target.value)}
				/>
			</label>

			{isEntityBacked ? (
				<EntityBackedSplitListGroupEditor context={context} group={group} />
			) : (
				<StaticSplitListGroupEditor group={group} onChange={onChange} />
			)}
		</section>
	);
}

function StaticSplitListGroupEditor({
	group,
	onChange,
}: {
	group: SplitListGroup;
	onChange: (group: SplitListGroup) => void;
}) {
	const items = Array.isArray(group.children) ? group.children : [];

	function setItems(nextItems: unknown[]) {
		onChange({
			...group,
			children: nextItems,
		});
	}

	return (
		<div className="atlas-split-list-items-editor">
			{items.map((item, itemIndex) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
					key={`static-split-item-${itemIndex}`}
					className="atlas-split-list-item-editor"
				>
					<textarea
						value={formatItemValue(item)}
						onChange={(event) =>
							setItems(updateArrayItem(items, itemIndex, event.target.value))
						}
					/>

					<Button
						variant="outlined"
						type="button"
						onClick={() => setItems(removeArrayItem(items, itemIndex))}
					>
						Remove item
					</Button>
				</div>
			))}

			<Button
				variant="outlined"
				type="button"
				onClick={() => setItems(insertArrayItem(items, "New item"))}
			>
				Add item
			</Button>
		</div>
	);
}

function EntityBackedSplitListGroupEditor({
	context,
	group,
}: {
	context: AtlasEditorContext;
	group: SplitListGroup;
}) {
	const entityPath = group.entityPath ?? "";

	if (!entityPath) {
		return (
			<p className="atlas-muted">
				This sub-list is not connected to editable data. Remove it and add a new
				sub-list.
			</p>
		);
	}

	const currentValue = getValueAtPath(context.entity, entityPath);
	const items = Array.isArray(currentValue) ? currentValue : [];

	function setItems(nextItems: unknown[]) {
		context.onEntityFieldChange({
			path: entityPath,
			value: nextItems,
		});
	}

	if (!Array.isArray(currentValue)) {
		return (
			<div className="atlas-split-list-warning">
				<p>This sub-list does not currently contain a list.</p>

				<Button variant="outlined" type="button" onClick={() => setItems([])}>
					Create list
				</Button>
			</div>
		);
	}

	return (
		<div className="atlas-split-list-items-editor">
			{items.map((item, itemIndex) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
					key={`entity-split-item-${entityPath}-${itemIndex}`}
					className="atlas-split-list-item-editor"
				>
					<textarea
						value={formatItemValue(item)}
						onChange={(event) =>
							setItems(updateArrayItem(items, itemIndex, event.target.value))
						}
					/>

					<Button
						variant="outlined"
						type="button"
						onClick={() => setItems(removeArrayItem(items, itemIndex))}
					>
						Remove item
					</Button>
				</div>
			))}

			<Button
				variant="outlined"
				type="button"
				onClick={() => setItems(insertArrayItem(items, "New item"))}
			>
				Add item
			</Button>
		</div>
	);
}

function getGroups(block: AtlasBlock): SplitListGroup[] {
	const rawGroups = block.props.groups;

	if (!Array.isArray(rawGroups)) return [];

	const groups: SplitListGroup[] = [];

	for (const group of rawGroups) {
		if (!group || typeof group !== "object") continue;

		const record = group as Record<string, unknown>;
		const nextGroup: SplitListGroup = {};

		if (typeof record.label === "string") {
			nextGroup.label = record.label;
		}

		if (typeof record.name === "string") {
			nextGroup.name = record.name;
		}

		if (typeof record.entityPath === "string") {
			nextGroup.entityPath = record.entityPath;
		}

		if (typeof record.emptyText === "string") {
			nextGroup.emptyText = record.emptyText;
		}

		if (Array.isArray(record.children)) {
			nextGroup.children = record.children;
		}

		groups.push(nextGroup);
	}

	return groups;
}

function getGroupDisplayName(group: SplitListGroup, index: number): string {
	return group.label ?? group.name ?? `List ${index + 1}`;
}

function createEntityPathForNewGroup(
	label: string,
	groups: SplitListGroup[],
): string {
	const basePath = getCommonEntityPathBase(groups);
	const baseSlug = toCamelCase(label) || "newList";
	const existingPaths = new Set(
		groups
			.map((group) => group.entityPath)
			.filter((path): path is string => Boolean(path)),
	);

	let candidate = `${basePath}.${baseSlug}`;
	let suffix = 2;

	while (existingPaths.has(candidate)) {
		candidate = `${basePath}.${baseSlug}${suffix}`;
		suffix += 1;
	}

	return candidate;
}

function getCommonEntityPathBase(groups: SplitListGroup[]): string {
	const firstPath = groups.find((group) => group.entityPath)?.entityPath;

	if (!firstPath) return "customLists";

	const segments = firstPath.split(".").filter(Boolean);

	if (segments.length <= 1) return "customLists";

	return segments.slice(0, -1).join(".");
}

function toCamelCase(value: string): string {
	const words = value
		.trim()
		.replace(/[^a-zA-Z0-9]+/g, " ")
		.split(" ")
		.filter(Boolean);

	if (words.length === 0) return "";

	return words
		.map((word, index) => {
			const lower = word.toLowerCase();

			if (index === 0) return lower;

			return lower.charAt(0).toUpperCase() + lower.slice(1);
		})
		.join("");
}

function formatItemValue(value: unknown): string {
	if (value == null) return "";

	if (
		typeof value === "string" ||
		typeof value === "number" ||
		typeof value === "boolean"
	) {
		return String(value);
	}

	if (typeof value === "object") {
		const record = value as Record<string, unknown>;

		return String(
			record.name ??
				record.Name ??
				record.label ??
				record.title ??
				JSON.stringify(value),
		);
	}

	return String(value);
}
