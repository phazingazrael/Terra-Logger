import { useEffect, useMemo, useState } from "react";
import type { AtlasEditorContext } from "../../../../definitions/Atlas";
import type {
	TLCountry,
	TLDiplomacy,
} from "../../../../definitions/TerraLogger";
import { Button } from "@mui/material";

const DIPLOMACY_PATH = "political.diplomacy";

const DEFAULT_DIPLOMACY_STATUSES = [
	"Ally",
	"Friendly",
	"Neutral",
	"Suspicious",
	"Enemy",
] as const;

type CountryOption = {
	id: number;
	name: string;
};

export function DiplomacyBlockEditor({
	context,
}: {
	context: AtlasEditorContext;
}) {
	const diplomacy = getDiplomacyRelations(context.entity);
	const countries = getCountryOptions(context);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [newCountryId, setNewCountryId] = useState("");
	const [newStatus, setNewStatus] = useState("Neutral");

	const visibleRelations = useMemo(
		() =>
			diplomacy
				.map((relation, index) => ({ relation, index }))
				.filter(({ relation }) => isVisibleDiplomacyRelation(relation)),
		[diplomacy],
	);

	const statusOptions = useMemo(
		() => getDiplomacyStatusOptions(diplomacy),
		[diplomacy],
	);

	const activeCountryIds = useMemo(
		() => new Set(visibleRelations.map(({ relation }) => relation.id)),
		[visibleRelations],
	);

	const addableCountries = countries.filter(
		(country) => !activeCountryIds.has(country.id),
	);

	const selectedRelation =
		selectedIndex == null ? null : (diplomacy[selectedIndex] ?? null);

	useEffect(() => {
		if (selectedIndex == null) return;

		const relation = diplomacy[selectedIndex];

		if (!relation || !isVisibleDiplomacyRelation(relation)) {
			setSelectedIndex(null);
		}
	}, [diplomacy, selectedIndex]);

	function setDiplomacy(nextDiplomacy: TLDiplomacy[]) {
		context.onEntityFieldChange({
			path: DIPLOMACY_PATH,
			value: nextDiplomacy,
		});
	}

	function updateRelation(index: number, nextRelation: TLDiplomacy) {
		setDiplomacy(
			diplomacy.map((relation, currentIndex) =>
				currentIndex === index ? nextRelation : relation,
			),
		);
	}

	function deactivateRelation(index: number) {
		updateRelation(index, {
			...diplomacy[index],
			status: "-",
		});

		setSelectedIndex(null);
	}

	function addRelation() {
		const country = countries.find(
			(option) => String(option.id) === newCountryId,
		);

		if (!country) return;

		const existingIndex = diplomacy.findIndex(
			(relation) => relation.id === country.id,
		);

		const nextRelation: TLDiplomacy = {
			id: country.id,
			name: country.name,
			status: newStatus,
		};

		if (existingIndex >= 0) {
			updateRelation(existingIndex, nextRelation);
			setSelectedIndex(existingIndex);
		} else {
			setDiplomacy([...diplomacy, nextRelation]);
			setSelectedIndex(diplomacy.length);
		}

		setNewCountryId("");
		setNewStatus("Neutral");
	}

	return (
		<div className="atlas-diplomacy-editor">
			<header className="atlas-diplomacy-editor__header">
				<div>
					<strong>Diplomacy</strong>
					<span>
						{visibleRelations.length} active relation
						{visibleRelations.length === 1 ? "" : "s"}
					</span>
				</div>
			</header>

			<section className="atlas-diplomacy-add-panel">
				<strong>Add relationship</strong>

				<div className="atlas-diplomacy-add-panel__fields">
					<label>
						Country or realm
						<select
							value={newCountryId}
							onChange={(event) => setNewCountryId(event.target.value)}
						>
							<option value="">Select country...</option>

							{addableCountries.map((country) => (
								<option key={country.id} value={country.id}>
									{country.name}
								</option>
							))}
						</select>
					</label>

					<label>
						Status
						<select
							value={newStatus}
							onChange={(event) => setNewStatus(event.target.value)}
						>
							{statusOptions.map((status) => (
								<option key={status} value={status}>
									{status}
								</option>
							))}
						</select>
					</label>

					<Button
						variant="outlined"
						type="button"
						disabled={!newCountryId}
						onClick={addRelation}
					>
						Add relationship
					</Button>
				</div>
			</section>

			<label className="atlas-diplomacy-relation-select">
				Choose relationship to edit
				<select
					value={selectedIndex == null ? "" : String(selectedIndex)}
					onChange={(event) => {
						const value = event.target.value;
						setSelectedIndex(value ? Number(value) : null);
					}}
				>
					<option value="">Select relationship...</option>

					{visibleRelations.map(({ relation, index }) => (
						<option key={`diplomacy-${relation.id}-${index}`} value={index}>
							{relation.name} — {relation.status}
						</option>
					))}
				</select>
			</label>

			{selectedRelation && selectedIndex != null ? (
				<DiplomacyRelationEditor
					relation={selectedRelation}
					relationIndex={selectedIndex}
					countries={countries}
					activeCountryIds={activeCountryIds}
					statusOptions={statusOptions}
					onChange={(nextRelation) =>
						updateRelation(selectedIndex, nextRelation)
					}
					onDeactivate={() => deactivateRelation(selectedIndex)}
				/>
			) : (
				<div className="atlas-diplomacy-empty-state">
					<p className="atlas-muted">
						Choose a relationship to edit, or add a new relationship.
					</p>
				</div>
			)}
		</div>
	);
}

function DiplomacyRelationEditor({
	relation,
	countries,
	activeCountryIds,
	statusOptions,
	onChange,
	onDeactivate,
}: {
	relation: TLDiplomacy;
	relationIndex: number;
	countries: CountryOption[];
	activeCountryIds: Set<number>;
	statusOptions: string[];
	onChange: (relation: TLDiplomacy) => void;
	onDeactivate: () => void;
}) {
	const selectableCountries = countries.filter(
		(country) =>
			country.id === relation.id || !activeCountryIds.has(country.id),
	);

	function patchRelation(patch: Partial<TLDiplomacy>) {
		onChange({
			...relation,
			...patch,
		});
	}

	function changeCountry(countryId: string) {
		const country = countries.find((option) => String(option.id) === countryId);

		if (!country) return;

		patchRelation({
			id: country.id,
			name: country.name,
		});
	}

	return (
		<article className="atlas-diplomacy-relation-editor">
			<header className="atlas-diplomacy-relation-editor__header">
				<div>
					<strong>{relation.name || "Unnamed relationship"}</strong>
					<span>{relation.status}</span>
				</div>

				<Button variant="outlined" type="button" onClick={onDeactivate}>
					Remove relationship
				</Button>
			</header>

			<div className="atlas-diplomacy-relation-editor__fields">
				<label>
					Country or realm
					<select
						value={String(relation.id)}
						onChange={(event) => changeCountry(event.target.value)}
					>
						{selectableCountries.map((country) => (
							<option key={country.id} value={country.id}>
								{country.name}
							</option>
						))}
					</select>
				</label>

				<label>
					Display name
					<input
						value={relation.name ?? ""}
						onChange={(event) => patchRelation({ name: event.target.value })}
					/>
				</label>

				<label>
					Status
					<select
						value={relation.status}
						onChange={(event) =>
							patchRelation({
								status: event.target.value,
							})
						}
					>
						{statusOptions.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</label>
			</div>
		</article>
	);
}

function getDiplomacyRelations(entity: unknown): TLDiplomacy[] {
	if (!entity || typeof entity !== "object") return [];

	const country = entity as {
		political?: {
			diplomacy?: unknown;
		};
	};

	if (!Array.isArray(country.political?.diplomacy)) return [];

	return country.political.diplomacy
		.map(normalizeDiplomacyRelation)
		.filter((relation): relation is TLDiplomacy => Boolean(relation));
}

function normalizeDiplomacyRelation(value: unknown): TLDiplomacy | null {
	if (!value || typeof value !== "object") return null;

	const record = value as Partial<TLDiplomacy>;

	return {
		id: toNumber(record.id),
		name: typeof record.name === "string" ? record.name : "",
		status: typeof record.status === "string" ? record.status : "-",
	};
}

function isVisibleDiplomacyRelation(relation: TLDiplomacy): boolean {
	if (!relation.name?.trim()) return false;

	return !isIgnoredDiplomacyStatus(relation.status);
}

function isIgnoredDiplomacyStatus(status: string): boolean {
	return status === "-" || status.toLowerCase() === "x";
}

function getDiplomacyStatusOptions(diplomacy: TLDiplomacy[]): string[] {
	const statuses = new Set<string>();

	for (const status of DEFAULT_DIPLOMACY_STATUSES) {
		statuses.add(status);
	}

	for (const relation of diplomacy) {
		if (!relation.status) continue;
		if (isIgnoredDiplomacyStatus(relation.status)) continue;

		statuses.add(relation.status);
	}

	return Array.from(statuses).sort((a, b) => a.localeCompare(b));
}

function getCountryOptions(context: AtlasEditorContext): CountryOption[] {
	const currentCountry = context.entity as Partial<TLCountry>;
	const currentCountryId = toNumber(currentCountry.id);

	return (context.related?.countries ?? [])
		.map(normalizeCountryOption)
		.filter((country): country is CountryOption => Boolean(country))
		.filter((country) => country.id !== currentCountryId)
		.sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeCountryOption(value: unknown): CountryOption | null {
	if (!value || typeof value !== "object") return null;

	const record = value as Record<string, unknown>;
	const id = toNumber(record.id);
	const name = String(
		record.nameFull ?? record.fullName ?? record.name ?? "",
	).trim();

	if (!Number.isFinite(id)) return null;
	if (!name) return null;

	return {
		id,
		name,
	};
}

function toNumber(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;

	if (typeof value === "string") {
		const parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}
