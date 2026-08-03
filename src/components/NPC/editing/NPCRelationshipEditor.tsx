import {
	Autocomplete,
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	Stack,
	TextField,
	Typography,
	createFilterOptions,
} from "@mui/material";
import { useMemo, useState } from "react";
import type {
	NPCEntityType,
	NPCRelationship,
	TLNPC,
} from "../../../definitions/TerraLogger";
import {
	getNPCRelationshipLabel,
	listNPCRelationshipDefinitions,
} from "../relationships/registry";

type Option = { id: string; name: string };
type EntityTypeOption = { id: NPCEntityType; label: string };
type RelationshipDefinitionOption = { id: string; label: string };

export type NPCRelationshipOptions = Record<NPCEntityType, Option[]>;

type RelationshipDraft = {
	type: NPCEntityType;
	relatedId: string;
	relationshipType: string;
	roleTitle: string;
	primary: boolean;
};

const EMPTY_DRAFT: RelationshipDraft = {
	type: "npc",
	relatedId: "",
	relationshipType: "",
	roleTitle: "",
	primary: false,
};

const ENTITY_TYPE_OPTIONS: EntityTypeOption[] = [
	{ id: "country", label: "Country" },
	{ id: "city", label: "City" },
	{ id: "culture", label: "Culture" },
	{ id: "religion", label: "Religion" },
	{ id: "npc", label: "NPC" },
];

const filterEntityOptions = createFilterOptions<Option>({
	stringify: (option) => `${option.name} ${option.id}`,
	limit: 100,
});

const filterRelationshipOptions =
	createFilterOptions<RelationshipDefinitionOption>({
		stringify: (option) => `${option.label} ${option.id}`,
		limit: 100,
	});

export function NPCRelationshipEditor({
	npc,
	options,
	onSave,
}: {
	npc: TLNPC;
	options: NPCRelationshipOptions;
	onSave: (relationships: NPCRelationship[]) => Promise<void> | void;
}) {
	const [draft, setDraft] = useState<RelationshipDraft>(EMPTY_DRAFT);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const relationships = npc.relationships ?? [];
	const availableByType = useMemo<NPCRelationshipOptions>(
		() => ({
			country: options.country ?? [],
			city: options.city ?? [],
			culture: options.culture ?? [],
			religion: options.religion ?? [],
			npc: (options.npc ?? []).filter((item) => item.id !== npc._id),
		}),
		[npc._id, options],
	);
	const available = availableByType[draft.type];
	const relationshipDefinitions = useMemo<RelationshipDefinitionOption[]>(
		() =>
			listNPCRelationshipDefinitions(draft.type).map((definition) => ({
				id: definition.id,
				label: definition.label,
			})),
		[draft.type],
	);
	const entityNames = useMemo(
		() =>
			new Map(
				Object.values(availableByType)
					.flat()
					.map((item) => [item.id, item.name]),
			),
		[availableByType],
	);

	const selectedEntityType =
		ENTITY_TYPE_OPTIONS.find((item) => item.id === draft.type) ?? null;
	const selectedRelatedEntity =
		available.find((item) => item.id === draft.relatedId) ?? null;
	const selectedRelationship =
		relationshipDefinitions.find(
			(item) => item.id === draft.relationshipType,
		) ?? null;

	const resetDraft = () => {
		setDraft(EMPTY_DRAFT);
		setEditingId(null);
	};

	const beginEdit = (relationship: NPCRelationship) => {
		setEditingId(relationship.id);
		setDraft({
			type: relationship.relatedEntityType,
			relatedId: relationship.relatedEntityId,
			relationshipType: relationship.relationshipType,
			roleTitle: relationship.roleTitle ?? "",
			primary: Boolean(relationship.primary),
		});
	};

	const saveDraft = async () => {
		if (!draft.relatedId || !draft.relationshipType) return;
		if (draft.type === "npc" && draft.relatedId === npc._id) return;

		const duplicate = relationships.some(
			(item) =>
				item.id !== editingId &&
				item.relatedEntityType === draft.type &&
				item.relatedEntityId === draft.relatedId &&
				item.relationshipType === draft.relationshipType,
		);
		if (duplicate) return;

		const now = new Date().toISOString();
		const nextRelationship: NPCRelationship = editingId
			? {
					...(relationships.find(
						(item) => item.id === editingId,
					) as NPCRelationship),
					relatedEntityType: draft.type,
					relatedEntityId: draft.relatedId,
					relationshipType: draft.relationshipType,
					roleTitle: draft.roleTitle.trim() || undefined,
					primary: draft.primary,
					updatedAt: now,
				}
			: {
					id: crypto.randomUUID(),
					relatedEntityType: draft.type,
					relatedEntityId: draft.relatedId,
					relationshipType: draft.relationshipType,
					roleTitle: draft.roleTitle.trim() || undefined,
					primary: draft.primary,
					source: "manual",
					createdAt: now,
					updatedAt: now,
				};

		const next = editingId
			? relationships.map((item) =>
					item.id === editingId ? nextRelationship : item,
				)
			: [...relationships, nextRelationship];

		setSaving(true);
		try {
			await onSave(next);
			resetDraft();
		} finally {
			setSaving(false);
		}
	};

	const remove = async (relationshipId: string) => {
		setSaving(true);
		try {
			await onSave(relationships.filter((item) => item.id !== relationshipId));
			if (editingId === relationshipId) resetDraft();
		} finally {
			setSaving(false);
		}
	};

	return (
		<Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}>
			<Typography variant="body2" color="text.secondary">
				Relationship types use controlled labels. NPC-to-NPC relationships
				automatically create or update the correct inverse relationship when the
				NPC is saved.
			</Typography>

			<Stack spacing={2} sx={{ mt: 2 }}>
				<Typography variant="subtitle2">
					{editingId ? "Edit relationship" : "Add relationship"}
				</Typography>

				<Autocomplete<EntityTypeOption, false, true, false>
					disableClearable
					options={ENTITY_TYPE_OPTIONS}
					value={selectedEntityType ?? ENTITY_TYPE_OPTIONS[4]}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					getOptionLabel={(option) => option.label}
					onChange={(_event, option) => {
						setDraft((current) => ({
							...current,
							type: option.id,
							relatedId: "",
							relationshipType: "",
						}));
					}}
					renderInput={(params) => (
						<TextField {...params} label="Entity type" />
					)}
				/>

				<Autocomplete<Option, false, false, false>
					options={available}
					value={selectedRelatedEntity}
					filterOptions={filterEntityOptions}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					getOptionLabel={(option) => option.name}
					onChange={(_event, option) =>
						setDraft((current) => ({ ...current, relatedId: option?.id ?? "" }))
					}
					noOptionsText="No matching entities"
					renderInput={(params) => (
						<TextField
							{...params}
							label="Related entity"
							placeholder="Search entities…"
						/>
					)}
				/>

				<Autocomplete<RelationshipDefinitionOption, false, false, false>
					options={relationshipDefinitions}
					value={selectedRelationship}
					filterOptions={filterRelationshipOptions}
					isOptionEqualToValue={(option, value) => option.id === value.id}
					getOptionLabel={(option) => option.label}
					onChange={(_event, option) =>
						setDraft((current) => ({
							...current,
							relationshipType: option?.id ?? "",
						}))
					}
					noOptionsText="No matching relationship types"
					renderInput={(params) => (
						<TextField
							{...params}
							label="Relationship"
							placeholder="Search relationship types…"
						/>
					)}
				/>

				<TextField
					label="Role or title"
					value={draft.roleTitle}
					onChange={(event) =>
						setDraft((current) => ({
							...current,
							roleTitle: event.target.value,
						}))
					}
					placeholder="Optional specific title"
				/>

				<FormControlLabel
					control={
						<Checkbox
							checked={draft.primary}
							onChange={(event) =>
								setDraft((current) => ({
									...current,
									primary: event.target.checked,
								}))
							}
						/>
					}
					label="Primary relationship"
				/>

				<Stack direction="row" spacing={1}>
					<Button
						variant="contained"
						disabled={saving || !draft.relatedId || !draft.relationshipType}
						onClick={() => void saveDraft()}
					>
						{editingId ? "Update Relationship" : "Add Relationship"}
					</Button>
					{editingId && (
						<Button disabled={saving} onClick={resetDraft}>
							Cancel
						</Button>
					)}
				</Stack>

				{relationships.map((relationship) => (
					<Stack
						key={relationship.id}
						direction={{ xs: "column", sm: "row" }}
						spacing={1}
						alignItems={{ xs: "stretch", sm: "center" }}
					>
						<Typography sx={{ flex: 1 }}>
							<strong>
								{getNPCRelationshipLabel(relationship.relationshipType)}
							</strong>{" "}
							—{" "}
							{entityNames.get(relationship.relatedEntityId) ??
								relationship.relatedEntityId}
							{relationship.roleTitle ? ` (${relationship.roleTitle})` : ""}
							{relationship.primary ? " · Primary" : ""}
						</Typography>
						<Button disabled={saving} onClick={() => beginEdit(relationship)}>
							Edit
						</Button>
						<Button
							color="error"
							disabled={saving}
							onClick={() => void remove(relationship.id)}
						>
							Remove
						</Button>
					</Stack>
				))}
			</Stack>
		</Box>
	);
}
