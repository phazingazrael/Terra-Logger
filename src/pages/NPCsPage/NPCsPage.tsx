import {
	Alert,
	AppBar,
	Box,
	Button,
	Chip,
	CircularProgress,
	Container,
	Autocomplete,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NPCCard from "../../components/Cards/npc";
import { VirtualizedCardGrid } from "../../components/Virtualized";
import { GuidedNPCCreationDialog } from "../../components/NPC/creation";
import { listGenderDefinitions } from "../../components/NPC/generator/genders/repository";
import { useDB, useActive } from "../../db/DataContext";
import type { TLNPC } from "../../definitions/TerraLogger";

import "./npcsPage.css";

type ComboboxOption = {
	value: string;
	label: string;
};

const AGE_OPTIONS: readonly ComboboxOption[] = [
	{ value: "all", label: "Any" },
	{ value: "unknown", label: "Unknown" },
	{ value: "0-17", label: "0–17" },
	{ value: "18-29", label: "18–29" },
	{ value: "30-49", label: "30–49" },
	{ value: "50-99", label: "50–99" },
	{ value: "100+", label: "100+" },
];

const ORIGIN_OPTIONS: readonly ComboboxOption[] = [
	{ value: "all", label: "Any" },
	{ value: "generated", label: "Generated" },
	{ value: "manual", label: "Manual" },
];

const SORT_OPTIONS: readonly ComboboxOption[] = [
	{ value: "name-asc", label: "Name A–Z" },
	{ value: "name-desc", label: "Name Z–A" },
	{ value: "age-asc", label: "Age low to high" },
	{ value: "age-desc", label: "Age high to low" },
	{ value: "profession-asc", label: "Profession A–Z" },
	{ value: "race-asc", label: "Race A–Z" },
	{ value: "location-asc", label: "Location A–Z" },
	{ value: "relationships-desc", label: "Most relationships" },
	{ value: "created-desc", label: "Newest created" },
	{ value: "updated-desc", label: "Recently updated" },
];

function toComboboxOptions(values: string[]): ComboboxOption[] {
	return [
		{ value: "all", label: "Any" },
		...values.map((value) => ({ value, label: value })),
	];
}

function FilterCombobox({
	label,
	value,
	options,
	width,
	onChange,
}: {
	label: string;
	value: string;
	options: readonly ComboboxOption[];
	width: number;
	onChange: (value: string) => void;
}) {
	const selected =
		options.find((option) => option.value === value) ?? options[0];

	return (
		<Autocomplete
			autoHighlight
			disableClearable
			handleHomeEndKeys
			openOnFocus
			options={options}
			value={selected}
			getOptionLabel={(option) => option.label}
			isOptionEqualToValue={(option, selectedOption) =>
				option.value === selectedOption.value
			}
			onChange={(_event, option) => onChange(option.value)}
			renderInput={(params) => <TextField {...params} label={label} />}
			size="small"
			sx={{ m: 1, width }}
		/>
	);
}

type NPCSort =
	| "name-asc"
	| "name-desc"
	| "age-asc"
	| "age-desc"
	| "profession-asc"
	| "race-asc"
	| "location-asc"
	| "relationships-desc"
	| "created-desc"
	| "updated-desc";
type NPCOriginFilter = "all" | "manual" | "generated";
type NPCNameFilterKey =
	| "race"
	| "gender"
	| "profession"
	| "location"
	| "group"
	| "religion";
type NPCAgeFilter =
	| "all"
	| "unknown"
	| "0-17"
	| "18-29"
	| "30-49"
	| "50-99"
	| "100+";

type NPCListState = {
	query: string;
	sort: NPCSort;
	race: string;
	gender: string;
	profession: string;
	location: string;
	group: string;
	religion: string;
	age: NPCAgeFilter;
	origin: NPCOriginFilter;
	scrollTop: number;
};

const DEFAULT_STATE: NPCListState = {
	query: "",
	sort: "name-asc",
	race: "all",
	gender: "all",
	profession: "all",
	location: "all",
	group: "all",
	religion: "all",
	age: "all",
	origin: "all",
	scrollTop: 0,
};

const ACTIVE_MAP_STORAGE_KEY = "terra-logger:npc-list:active-map";

function storageKey(mapId: string) {
	return `terra-logger:npc-list:${mapId}`;
}

function readStoredState(mapId: string | null): NPCListState {
	if (!mapId) return DEFAULT_STATE;
	try {
		const parsed = JSON.parse(
			sessionStorage.getItem(storageKey(mapId)) ?? "null",
		) as Partial<NPCListState> | null;
		return parsed ? { ...DEFAULT_STATE, ...parsed } : DEFAULT_STATE;
	} catch {
		return DEFAULT_STATE;
	}
}

function uniqueNames(values: Array<string | undefined>) {
	return [
		...new Set(
			values
				.filter((value): value is string => Boolean(value?.trim()))
				.map((value) => value.trim()),
		),
	].sort((left, right) => left.localeCompare(right));
}

function normalizedAge(age: unknown): number | undefined {
	if (typeof age === "number") {
		return Number.isFinite(age) && age >= 0 ? age : undefined;
	}
	if (typeof age !== "string" || !age.trim()) return undefined;
	const value = Number(age.trim());
	return Number.isFinite(value) && value >= 0 ? value : undefined;
}

function matchesAge(age: unknown, filter: NPCAgeFilter) {
	if (filter === "all") return true;
	const value = normalizedAge(age);
	if (filter === "unknown") return value === undefined;
	if (value === undefined) return false;
	if (filter === "0-17") return value <= 17;
	if (filter === "18-29") return value >= 18 && value <= 29;
	if (filter === "30-49") return value >= 30 && value <= 49;
	if (filter === "50-99") return value >= 50 && value <= 99;
	return value >= 100;
}

function displayName(npc: TLNPC) {
	return npc.fullName || npc.name || "Unnamed NPC";
}

const resetResultsViewport = () => {
	const content = document.getElementById("Content");
	if (content && content.scrollTop !== 0) content.scrollTo({ top: 0 });
 };

function useNPCsPageModel() {
	const navigate = useNavigate();
	const { activeMapId, isActiveLoaded, preload } = useDB();
	const npcs = useActive<TLNPC>("npcs");
	const npcsLoaded = isActiveLoaded("npcs");
	const [catalogLoading, setCatalogLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [listState, setListState] = useState<NPCListState>(() =>
		readStoredState(activeMapId),
	);
	const [genderDescriptions, setGenderDescriptions] = useState<
		Record<string, string>
	>({});
	const [creationOpen, setCreationOpen] = useState(false);
	const restoredScrollMap = useRef<string | null>(null);
	const previousActiveMapId = useRef<string | null>(activeMapId);
	const deferredQuery = useDeferredValue(listState.query.trim().toLowerCase());

	useEffect(() => {
		let cancelled = false;
		const previousMapId = previousActiveMapId.current;
		const storedActiveMapId = sessionStorage.getItem(ACTIVE_MAP_STORAGE_KEY);
		const mapChanged =
			previousMapId !== activeMapId || storedActiveMapId !== activeMapId;
		previousActiveMapId.current = activeMapId;
		if (activeMapId)
			sessionStorage.setItem(ACTIVE_MAP_STORAGE_KEY, activeMapId);
		else sessionStorage.removeItem(ACTIVE_MAP_STORAGE_KEY);

		if (mapChanged) {
			if (previousMapId) sessionStorage.removeItem(storageKey(previousMapId));
			if (activeMapId) sessionStorage.removeItem(storageKey(activeMapId));
			restoredScrollMap.current = null;
			setListState(DEFAULT_STATE);
			requestAnimationFrame(() =>
				document.getElementById("Content")?.scrollTo({ top: 0 }),
			);
		} else {
			setListState(readStoredState(activeMapId));
		}

		setCatalogLoading(true);
		setError(null);

		listGenderDefinitions({ includeDisabled: true })
			.then((genders) => {
				if (cancelled) return;
				setGenderDescriptions(
					Object.fromEntries(
						genders.map((item) => [item.id, item.description]),
					),
				);
			})
			.catch((cause: unknown) => {
				if (!cancelled) {
					setError(
						cause instanceof Error
							? cause.message
							: "NPC data could not be loaded.",
					);
				}
			})
			.finally(() => {
				if (!cancelled) setCatalogLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [activeMapId]);

	useEffect(() => {
		if (!activeMapId) return;
		const content = document.getElementById("Content");
		if (!content) return;
		let frame = 0;
		const persist = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				const stored = readStoredState(activeMapId);
				sessionStorage.setItem(
					storageKey(activeMapId),
					JSON.stringify({ ...stored, scrollTop: content.scrollTop }),
				);
			});
		};
		content.addEventListener("scroll", persist, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			content.removeEventListener("scroll", persist);
		};
	}, [activeMapId]);

	useEffect(() => {
		if (!activeMapId) return;
		sessionStorage.setItem(storageKey(activeMapId), JSON.stringify(listState));
	}, [activeMapId, listState]);

	const updateState = <K extends keyof NPCListState>(
		key: K,
		value: NPCListState[K],
	) => {
		resetResultsViewport();
		setListState((current) => ({
			...current,
			[key]: value,
			scrollTop: 0,
		}));
	};

	const loading = !npcsLoaded || catalogLoading;

	useEffect(() => {
		if (loading || !activeMapId || restoredScrollMap.current === activeMapId)
			return;
		restoredScrollMap.current = activeMapId;
		const top = readStoredState(activeMapId).scrollTop;
		requestAnimationFrame(() =>
			document.getElementById("Content")?.scrollTo({ top }),
		);
	}, [activeMapId, loading]);

	const filterOptions = useMemo(
		() => ({
			races: toComboboxOptions(
				uniqueNames(npcs.map((npc) => npc.ancestry?.name)),
			),
			genders: toComboboxOptions(
				uniqueNames(npcs.map((npc) => npc.gender?.name)),
			),
			professions: toComboboxOptions(
				uniqueNames(npcs.map((npc) => npc.profession?.name)),
			),
			locations: toComboboxOptions(
				uniqueNames(npcs.map((npc) => npc.currentLocation?.name)),
			),
			groups: toComboboxOptions(
				uniqueNames(npcs.flatMap((npc) => npc.groups.map((item) => item.name))),
			),
			religions: toComboboxOptions(
				uniqueNames(
					npcs.flatMap((npc) => npc.religions.map((item) => item.name)),
				),
			),
		}),
		[npcs],
	);

	const visible = useMemo(() => {
		const filtered = npcs.filter((npc) => {
			const searchValues = [
				npc.fullName,
				npc.name,
				npc.nickName,
				npc.ancestry?.name,
				npc.gender?.name,
				npc.profession?.name,
				npc.currentLocation?.name,
				...(npc.aliases ?? []),
				...(npc.groups ?? []).map((item) => item.name),
				...(npc.religions ?? []).map((item) => item.name),
				...(npc.tags ?? []).map((item) => item.Name),
			];
			const matchesSearch =
				!deferredQuery ||
				searchValues
					.filter(Boolean)
					.some((value) => String(value).toLowerCase().includes(deferredQuery));
			const matchesRace =
				listState.race === "all" || npc.ancestry?.name === listState.race;
			const matchesGender =
				listState.gender === "all" || npc.gender?.name === listState.gender;
			const matchesProfession =
				listState.profession === "all" ||
				npc.profession?.name === listState.profession;
			const matchesLocation =
				listState.location === "all" ||
				npc.currentLocation?.name === listState.location;
			const matchesGroup =
				listState.group === "all" ||
				npc.groups.some((item) => item.name === listState.group);
			const matchesReligion =
				listState.religion === "all" ||
				npc.religions.some((item) => item.name === listState.religion);
			const matchesOrigin =
				listState.origin === "all" ||
				(listState.origin === "generated"
					? Boolean(npc.generation)
					: !npc.generation);

			return (
				matchesSearch &&
				matchesRace &&
				matchesGender &&
				matchesProfession &&
				matchesLocation &&
				matchesGroup &&
				matchesReligion &&
				matchesAge(npc.age, listState.age) &&
				matchesOrigin
			);
		});

		return filtered.sort((left, right) => {
			if (listState.sort === "name-desc")
				return displayName(right).localeCompare(displayName(left));
			if (listState.sort === "age-asc")
				return (
					(normalizedAge(left.age) ?? Number.POSITIVE_INFINITY) -
					(normalizedAge(right.age) ?? Number.POSITIVE_INFINITY)
				);
			if (listState.sort === "age-desc")
				return (
					(normalizedAge(right.age) ?? Number.NEGATIVE_INFINITY) -
					(normalizedAge(left.age) ?? Number.NEGATIVE_INFINITY)
				);
			if (listState.sort === "profession-asc")
				return (
					(left.profession?.name ?? "").localeCompare(
						right.profession?.name ?? "",
					) || displayName(left).localeCompare(displayName(right))
				);
			if (listState.sort === "race-asc")
				return (
					(left.ancestry?.name ?? "").localeCompare(
						right.ancestry?.name ?? "",
					) || displayName(left).localeCompare(displayName(right))
				);
			if (listState.sort === "location-asc")
				return (
					(left.currentLocation?.name ?? "").localeCompare(
						right.currentLocation?.name ?? "",
					) || displayName(left).localeCompare(displayName(right))
				);
			if (listState.sort === "relationships-desc")
				return (
					right.relationships.length - left.relationships.length ||
					displayName(left).localeCompare(displayName(right))
				);
			if (listState.sort === "created-desc")
				return String(right.createdAt ?? "").localeCompare(
					String(left.createdAt ?? ""),
				);
			if (listState.sort === "updated-desc")
				return String(right.updatedAt ?? "").localeCompare(
					String(left.updatedAt ?? ""),
				);
			return displayName(left).localeCompare(displayName(right));
		});
	}, [npcs, deferredQuery, listState]);

	const activeFilters = [
		listState.query.trim()
			? { key: "query", label: `Search: ${listState.query.trim()}` }
			: null,
		listState.race !== "all"
			? { key: "race", label: `Race: ${listState.race}` }
			: null,
		listState.gender !== "all"
			? { key: "gender", label: `Gender: ${listState.gender}` }
			: null,
		listState.profession !== "all"
			? { key: "profession", label: `Profession: ${listState.profession}` }
			: null,
		listState.location !== "all"
			? { key: "location", label: `Location: ${listState.location}` }
			: null,
		listState.group !== "all"
			? { key: "group", label: `Group: ${listState.group}` }
			: null,
		listState.religion !== "all"
			? { key: "religion", label: `Religion: ${listState.religion}` }
			: null,
		listState.age !== "all"
			? {
					key: "age",
					label: `Age: ${listState.age === "unknown" ? "Unknown" : listState.age}`,
				}
			: null,
		listState.origin !== "all"
			? {
					key: "origin",
					label: `Origin: ${listState.origin === "generated" ? "Generated" : "Manual"}`,
				}
			: null,
	].filter((item): item is { key: keyof NPCListState; label: string } =>
		Boolean(item),
	);

	const clearFilter = (key: keyof NPCListState) => {
		if (key === "query") updateState("query", "");
		else if (key === "age") updateState("age", "all");
		else if (key === "origin") updateState("origin", "all");
		else updateState(key as NPCNameFilterKey, "all");
	};

	const resetFilters = () => {
		resetResultsViewport();
		setListState(DEFAULT_STATE);
	};

	const resultSetKey = [
		activeMapId ?? "no-map",
		deferredQuery,
		listState.race,
		listState.gender,
		listState.profession,
		listState.location,
		listState.group,
		listState.religion,
		listState.age,
		listState.origin,
		listState.sort,
	].join("|");
	return { navigate, activeMapId, preload, npcs, error, listState, genderDescriptions, creationOpen, setCreationOpen, updateState, loading, filterOptions, visible, activeFilters, clearFilter, resetFilters, resultSetKey };
}

function NPCsPageView(model: ReturnType<typeof useNPCsPageModel>) {
	const { navigate, activeMapId, preload, npcs, error, listState, genderDescriptions, creationOpen, setCreationOpen, updateState, loading, filterOptions, visible, activeFilters, clearFilter, resetFilters, resultSetKey } = model;
	return (
		<Container>
			<AppBar position="sticky" color="default">
				<div className="npc-search-filter-container">
					<div className="npc-search-row">
						<label className="npc-search-field">
							<span>Search NPCs</span>
							<input
								className="npc-search-input"
								placeholder="Search NPCs..."
								type="search"
								value={listState.query}
								onChange={(event) => updateState("query", event.target.value)}
							/>
						</label>
						<div className="npc-search-actions">
							<Button
								variant="contained"
								color="error"
								onClick={resetFilters}
								disabled={
									activeFilters.length === 0 && listState.sort === "name-asc"
								}
							>
								Reset Filters
							</Button>
							<Button
								variant="contained"
								onClick={() => setCreationOpen(true)}
								disabled={!activeMapId}
							>
								New NPC
							</Button>
						</div>
					</div>

					<div className="npc-filter-controls">
						{[
							{
								key: "race" as NPCNameFilterKey,
								label: "Race",
								values: filterOptions.races,
								width: 180,
							},
							{
								key: "gender" as NPCNameFilterKey,
								label: "Gender",
								values: filterOptions.genders,
								width: 180,
							},
							{
								key: "profession" as NPCNameFilterKey,
								label: "Profession",
								values: filterOptions.professions,
								width: 210,
							},
							{
								key: "location" as NPCNameFilterKey,
								label: "Location",
								values: filterOptions.locations,
								width: 220,
							},
							{
								key: "group" as NPCNameFilterKey,
								label: "Group",
								values: filterOptions.groups,
								width: 190,
							},
							{
								key: "religion" as NPCNameFilterKey,
								label: "Religion",
								values: filterOptions.religions,
								width: 190,
							},
						].map((filter) => (
							<FilterCombobox
								key={filter.key}
								label={filter.label}
								value={listState[filter.key]}
								options={filter.values}
								width={filter.width}
								onChange={(value) => updateState(filter.key, value)}
							/>
						))}

						<FilterCombobox
							label="Age"
							value={listState.age}
							options={AGE_OPTIONS}
							width={165}
							onChange={(value) => updateState("age", value as NPCAgeFilter)}
						/>

						<FilterCombobox
							label="Origin"
							value={listState.origin}
							options={ORIGIN_OPTIONS}
							width={170}
							onChange={(value) =>
								updateState("origin", value as NPCOriginFilter)
							}
						/>

						<FilterCombobox
							label="Sort"
							value={listState.sort}
							options={SORT_OPTIONS}
							width={210}
							onChange={(value) => updateState("sort", value as NPCSort)}
						/>
					</div>

					{activeFilters.length > 0 ? (
						<Stack
							className="npc-active-filter-chips"
							direction="row"
							gap={1}
							flexWrap="wrap"
						>
							{activeFilters.map((filter) => (
								<Chip
									key={filter.key}
									label={filter.label}
									size="small"
									onDelete={() => clearFilter(filter.key)}
								/>
							))}
						</Stack>
					) : null}

					{!loading && !error && npcs.length > 0 ? (
						<div className="npc-filter-summary">
							<Typography variant="body2" color="text.secondary">
								Showing {visible.length} of {npcs.length} NPCs
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{activeFilters.length}{" "}
								{activeFilters.length === 1 ? "filter" : "filters"} active
							</Typography>
						</div>
					) : null}
				</div>
			</AppBar>

			<Box className="contentSubBody NPCsPage">
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
						<CircularProgress />
					</Box>
				) : null}
				{error ? <Alert severity="error">{error}</Alert> : null}
				{!loading && !error && npcs.length === 0 ? (
					<Alert severity="info">This map has no saved NPCs.</Alert>
				) : null}
				{!loading && !error && npcs.length > 0 && visible.length === 0 ? (
					<div className="npc-no-results">
						<Typography variant="h6" color="text.secondary">
							No results found
						</Typography>
					</div>
				) : null}
				{!loading && !error && visible.length > 0 ? (
					<VirtualizedCardGrid
						key={resultSetKey}
						items={visible}
						getKey={(npc) => npc._id}
						estimateRowHeight={290}
						renderItem={(npc) => (
							<NPCCard
								npc={npc}
								genderDescription={
									npc.gender ? genderDescriptions[npc.gender.id] : undefined
								}
							/>
						)}
					/>
				) : null}
				{activeMapId ? (
					<GuidedNPCCreationDialog
						open={creationOpen}
						mapId={activeMapId}
						onClose={() => setCreationOpen(false)}
						onSaved={async (npc) => {
							await preload(["npcs"]);
							navigate(`/view_npc/${npc._id}`);
						}}
					/>
				) : null}
			</Box>
		</Container>
	);
}

export default function NPCsPage() {
	const model = useNPCsPageModel();
	return <NPCsPageView {...model} />;
}
