import { useEffect, useMemo, useState } from "react";
import type { AtlasEditorContext } from "../../../../definitions/Atlas";
import type { TLMilitary } from "../../../../definitions/TerraLogger";
import { Button } from "@mui/material";

type MilitaryKind = "regiment" | "fleet";

const MILITARY_PATH = "political.military";

export function MilitaryBlockEditor({
	context,
}: {
	context: AtlasEditorContext;
}) {
	const military = getMilitaryUnits(context.entity);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

	const selectedUnit =
		selectedIndex == null ? null : (military[selectedIndex] ?? null);

	const selectedKind = selectedUnit ? getMilitaryKind(selectedUnit) : null;

	const selectedRegimentIndex =
		selectedKind === "regiment" && selectedIndex != null
			? String(selectedIndex)
			: "";

	const selectedFleetIndex =
		selectedKind === "fleet" && selectedIndex != null
			? String(selectedIndex)
			: "";

	const regiments = useMemo(
		() =>
			military
				.map((unit, index) => ({ unit, index }))
				.filter(({ unit }) => getMilitaryKind(unit) === "regiment"),
		[military],
	);

	const fleets = useMemo(
		() =>
			military
				.map((unit, index) => ({ unit, index }))
				.filter(({ unit }) => getMilitaryKind(unit) === "fleet"),
		[military],
	);

	useEffect(() => {
		if (selectedIndex == null) return;

		if (selectedIndex >= military.length) {
			setSelectedIndex(military.length > 0 ? military.length - 1 : null);
		}
	}, [military.length, selectedIndex]);

	function setMilitary(nextMilitary: TLMilitary[]) {
		context.onEntityFieldChange({
			path: MILITARY_PATH,
			value: nextMilitary,
		});
	}

	function updateSelectedUnit(nextUnit: TLMilitary) {
		if (selectedIndex == null) return;

		setMilitary(
			military.map((unit, currentIndex) =>
				currentIndex === selectedIndex ? nextUnit : unit,
			),
		);
	}

	function removeSelectedUnit() {
		if (selectedIndex == null) return;

		setMilitary(military.filter((_, index) => index !== selectedIndex));
		setSelectedIndex(null);
	}

	function addUnit(kind: MilitaryKind) {
		const nextUnit = createMilitaryUnit(kind);
		const nextIndex = military.length;

		setMilitary([...military, nextUnit]);
		setSelectedIndex(nextIndex);
	}

	return (
		<div className="atlas-military-editor atlas-military-editor--focused">
			<header className="atlas-military-focused-header">
				<div>
					<strong>Military</strong>
					<span>
						{regiments.length} regiment{regiments.length === 1 ? "" : "s"} ·{" "}
						{fleets.length} fleet{fleets.length === 1 ? "" : "s"}
					</span>
				</div>

				<div className="atlas-military-focused-header__actions">
					<Button
						variant="outlined"
						type="button"
						onClick={() => addUnit("regiment")}
					>
						Add Regiment
					</Button>

					<Button
						variant="outlined"
						type="button"
						onClick={() => addUnit("fleet")}
					>
						Add Fleet
					</Button>
				</div>
			</header>

			<div className="atlas-military-unit-selects">
				<label className="atlas-military-unit-select">
					Choose regiment to edit
					<select
						value={selectedRegimentIndex}
						onChange={(event) => {
							const value = event.target.value;
							setSelectedIndex(value ? Number(value) : null);
						}}
					>
						<option value="">Select a regiment...</option>

						{regiments.map(({ unit, index }) => (
							<option key={`regiment-${index}`} value={index}>
								{getMilitaryUnitLabel(unit, index)}
							</option>
						))}
					</select>
				</label>

				<label className="atlas-military-unit-select">
					Choose fleet to edit
					<select
						value={selectedFleetIndex}
						onChange={(event) => {
							const value = event.target.value;
							setSelectedIndex(value ? Number(value) : null);
						}}
					>
						<option value="">Select a fleet...</option>

						{fleets.map(({ unit, index }) => (
							<option key={`fleet-${index}`} value={index}>
								{getMilitaryUnitLabel(unit, index)}
							</option>
						))}
					</select>
				</label>
			</div>

			{selectedUnit ? (
				<MilitaryUnitEditor
					unit={selectedUnit}
					onChange={updateSelectedUnit}
					onRemove={removeSelectedUnit}
				/>
			) : (
				<div className="atlas-military-empty-state">
					<p className="atlas-muted">
						Choose a regiment or fleet to edit, or create a new one.
					</p>
				</div>
			)}
		</div>
	);
}

function MilitaryUnitEditor({
	unit,
	onChange,
	onRemove,
}: {
	unit: TLMilitary;
	onChange: (unit: TLMilitary) => void;
	onRemove: () => void;
}) {
	const kind = getMilitaryKind(unit);

	function patchUnit(patch: Partial<TLMilitary>) {
		onChange({
			...unit,
			...patch,
			n: kind === "regiment" ? 0 : 1,
			u: {
				infantry: unit.u?.infantry ?? 0,
				cavalry: unit.u?.cavalry ?? 0,
				archers: unit.u?.archers ?? 0,
				artillery: unit.u?.artillery ?? 0,
				...(patch.u ?? {}),
			},
		});
	}

	function patchComposition(field: keyof TLMilitary["u"], value: string) {
		patchUnit({
			u: {
				infantry: unit.u?.infantry ?? 0,
				cavalry: unit.u?.cavalry ?? 0,
				archers: unit.u?.archers ?? 0,
				artillery: unit.u?.artillery ?? 0,
				[field]: toNumber(value),
			},
		});
	}

	function changeKind(nextKind: MilitaryKind) {
		patchUnit({
			n: nextKind === "regiment" ? 0 : 1,
			name:
				unit.name?.trim() ||
				(nextKind === "regiment" ? "New Regiment" : "New Fleet"),
			icon: unit.icon || (nextKind === "regiment" ? "⚔️" : "⛵"),
		});
	}

	return (
		<article className="atlas-military-focused-unit-editor">
			<header className="atlas-military-focused-unit-editor__header">
				<div>
					<strong>{unit.name || "Unnamed unit"}</strong>
					<span>{kind === "regiment" ? "Regiment" : "Fleet"}</span>
				</div>

				<Button variant="outlined" type="button" onClick={onRemove}>
					Remove Unit
				</Button>
			</header>

			<div className="atlas-military-fields atlas-military-fields--primary">
				<label>
					Name
					<input
						value={unit.name ?? ""}
						onChange={(event) => patchUnit({ name: event.target.value })}
					/>
				</label>

				<label>
					Unit type
					<select
						value={kind}
						onChange={(event) => changeKind(event.target.value as MilitaryKind)}
					>
						<option value="regiment">Regiment</option>
						<option value="fleet">Fleet</option>
					</select>
				</label>

				<label>
					Icon
					<input
						value={unit.icon ?? ""}
						onChange={(event) => patchUnit({ icon: event.target.value })}
					/>
				</label>

				<label>
					Strength
					<input
						type="number"
						value={unit.a ?? 0}
						onChange={(event) => patchUnit({ a: toNumber(event.target.value) })}
					/>
				</label>
			</div>

			{kind === "regiment" ? (
				<section className="atlas-military-composition">
					<strong>Regiment Composition</strong>

					<div className="atlas-military-fields atlas-military-fields--composition">
						<label>
							Infantry
							<input
								type="number"
								value={unit.u?.infantry ?? 0}
								onChange={(event) =>
									patchComposition("infantry", event.target.value)
								}
							/>
						</label>

						<label>
							Cavalry
							<input
								type="number"
								value={unit.u?.cavalry ?? 0}
								onChange={(event) =>
									patchComposition("cavalry", event.target.value)
								}
							/>
						</label>

						<label>
							Archers
							<input
								type="number"
								value={unit.u?.archers ?? 0}
								onChange={(event) =>
									patchComposition("archers", event.target.value)
								}
							/>
						</label>

						<label>
							Artillery
							<input
								type="number"
								value={unit.u?.artillery ?? 0}
								onChange={(event) =>
									patchComposition("artillery", event.target.value)
								}
							/>
						</label>
					</div>
				</section>
			) : (
				<section className="atlas-military-composition">
					<p className="atlas-muted">
						Fleets use overall strength and map position data.
					</p>
				</section>
			)}

			<details className="atlas-military-advanced">
				<summary>Advanced map data</summary>

				<div className="atlas-military-fields atlas-military-fields--advanced">
					<label>
						Cell
						<input
							type="number"
							value={unit.cell ?? 0}
							onChange={(event) =>
								patchUnit({ cell: toNumber(event.target.value) })
							}
						/>
					</label>

					<label>
						X
						<input
							type="number"
							value={unit.x ?? 0}
							onChange={(event) =>
								patchUnit({ x: toNumber(event.target.value) })
							}
						/>
					</label>

					<label>
						Y
						<input
							type="number"
							value={unit.y ?? 0}
							onChange={(event) =>
								patchUnit({ y: toNumber(event.target.value) })
							}
						/>
					</label>

					<label>
						Base X
						<input
							type="number"
							value={unit.bx ?? 0}
							onChange={(event) =>
								patchUnit({ bx: toNumber(event.target.value) })
							}
						/>
					</label>

					<label>
						Base Y
						<input
							type="number"
							value={unit.by ?? 0}
							onChange={(event) =>
								patchUnit({ by: toNumber(event.target.value) })
							}
						/>
					</label>

					<label>
						State
						<input
							type="number"
							value={unit.state ?? 0}
							onChange={(event) =>
								patchUnit({ state: toNumber(event.target.value) })
							}
						/>
					</label>
				</div>
			</details>
		</article>
	);
}

function getMilitaryUnits(entity: unknown): TLMilitary[] {
	if (!entity || typeof entity !== "object") return [];

	const country = entity as {
		political?: {
			military?: unknown;
		};
	};

	if (!Array.isArray(country.political?.military)) return [];

	return country.political.military
		.map(normalizeMilitaryUnit)
		.filter((unit): unit is TLMilitary => Boolean(unit));
}

function normalizeMilitaryUnit(value: unknown): TLMilitary | null {
	if (!value || typeof value !== "object") return null;

	const record = value as Partial<TLMilitary>;

	return {
		_id:
			typeof record._id === "string" && record._id
				? record._id
				: createLocalMilitaryId(),
		id: toNumber(record.id),
		a: toNumber(record.a),
		cell: toNumber(record.cell),
		x: toNumber(record.x),
		y: toNumber(record.y),
		bx: toNumber(record.bx),
		by: toNumber(record.by),
		u: {
			cavalry: toNumber(record.u?.cavalry),
			archers: toNumber(record.u?.archers),
			infantry: toNumber(record.u?.infantry),
			artillery: toNumber(record.u?.artillery),
		},
		n: record.n === 1 ? 1 : 0,
		name: typeof record.name === "string" ? record.name : "",
		state: toNumber(record.state),
		icon: typeof record.icon === "string" ? record.icon : "",
	};
}

function createMilitaryUnit(kind: MilitaryKind): TLMilitary {
	return {
		_id: createLocalMilitaryId(),
		id: Date.now(),
		a: 0,
		cell: 0,
		x: 0,
		y: 0,
		bx: 0,
		by: 0,
		u: {
			cavalry: 0,
			archers: 0,
			infantry: 0,
			artillery: 0,
		},
		n: kind === "regiment" ? 0 : 1,
		name: kind === "regiment" ? "New Regiment" : "New Fleet",
		state: 0,
		icon: kind === "regiment" ? "⚔️" : "⛵",
	};
}

function getMilitaryKind(unit: TLMilitary): MilitaryKind {
	return unit.n === 1 ? "fleet" : "regiment";
}

function getMilitaryUnitLabel(unit: TLMilitary, index: number): string {
	const kind = getMilitaryKind(unit);
	const fallback = kind === "regiment" ? "Unnamed Regiment" : "Unnamed Fleet";

	return (
		`${unit.name?.trim() || fallback} ${unit.a ? `(${unit.a})` : ""}`.trim() ||
		`Unit ${index + 1}`
	);
}

function createLocalMilitaryId(): string {
	return `military_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toNumber(value: unknown): number {
	if (typeof value === "number" && Number.isFinite(value)) return value;

	if (typeof value === "string") {
		const parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : 0;
	}

	return 0;
}
