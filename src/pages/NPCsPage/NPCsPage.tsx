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
	Slider,
} from "@mui/material";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
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
type NPCNameFilterKey =
	| "race"
	| "gender"
	| "profession"
	| "location"
	| "group"
	| "religion";

type NPCListState = {
	query: string;
	sort: NPCSort;
	race: string;
	gender: string;
	profession: string;
	location: string;
	group: string;
	religion: string;
	ageRange: [number, number];
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
	ageRange: [0, 0],
};

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

function matchesAge(age: unknown, range: [number, number], maximumAge: number) {
	const value = normalizedAge(age);
	if (range[0] === 0 && range[1] === maximumAge) return true;
	if (value === undefined) return false;
	return value >= range[0] && value <= range[1];
}

function displayName(npc: TLNPC) {
	return npc.fullName || npc.name || "Unnamed NPC";
}

type PreparedNPC = {
	npc: TLNPC;
	displayName: string;
	age?: number;
	searchText: string;
	race: string;
	gender: string;
	profession: string;
	location: string;
	groups: Set<string>;
	religions: Set<string>;
};

function prepareNPC(npc: TLNPC): PreparedNPC {
	const name = displayName(npc);
	const groups = new Set((npc.groups ?? []).map((item) => item.name));
	const religions = new Set((npc.religions ?? []).map((item) => item.name));
	const searchText = [
		name,
		npc.name,
		npc.nickName,
		npc.ancestry?.name,
		npc.gender?.name,
		npc.profession?.name,
		npc.currentLocation?.name,
		...(npc.aliases ?? []),
		...groups,
		...religions,
		...(npc.tags ?? []).map((item) => item.Name),
	]
		.filter(Boolean)
		.join("\u0000")
		.toLocaleLowerCase();

	return {
		npc,
		displayName: name,
		age: normalizedAge(npc.age),
		searchText,
		race: npc.ancestry?.name ?? "",
		gender: npc.gender?.name ?? "",
		profession: npc.profession?.name ?? "",
		location: npc.currentLocation?.name ?? "",
		groups,
		religions,
	};
}

const getResultsViewport = () =>
	document.querySelector<HTMLElement>(".Content");

const resetResultsViewport = () => {
	const content = getResultsViewport();
	if (content && content.scrollTop !== 0) content.scrollTo({ top: 0 });
};

function useNPCsPageModel() {
	const navigate = useNavigate();
	const { activeMapId, isActiveLoaded, preload } = useDB();
	const npcs = useActive<TLNPC>("npcs");
	const npcsLoaded = isActiveLoaded("npcs");
	const [catalogLoading, setCatalogLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [listState, setListState] = useState<NPCListState>(() => ({
		...DEFAULT_STATE,
	}));
	const [genderDescriptions, setGenderDescriptions] = useState<
		Record<string, string>
	>({});
	const [creationOpen, setCreationOpen] = useState(false);
	const filterCriteria = useMemo(
		() => ({
			query: listState.query.trim().toLocaleLowerCase(),
			race: listState.race,
			gender: listState.gender,
			profession: listState.profession,
			location: listState.location,
			group: listState.group,
			religion: listState.religion,
			ageRange: listState.ageRange,
			sort: listState.sort,
		}),
		[
			listState.query,
			listState.race,
			listState.gender,
			listState.profession,
			listState.location,
			listState.group,
			listState.religion,
			listState.ageRange,
			listState.sort,
		],
	);
	const deferredCriteria = useDeferredValue(filterCriteria);

	useEffect(() => {
		let cancelled = false;

		setListState({ ...DEFAULT_STATE });
		requestAnimationFrame(() => {
			getResultsViewport()?.scrollTo({ top: 0 });
		});

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
		return () => {
			resetResultsViewport();
		};
	}, []);

	const updateState = useCallback(<K extends keyof NPCListState>(
		key: K,
		value: NPCListState[K],
	) => {
		resetResultsViewport();
		setListState((current) => ({
			...current,
			[key]: value,
		}));
	}, []);

	const loading = !npcsLoaded || catalogLoading;
	const preparedNPCs = useMemo(() => npcs.map(prepareNPC), [npcs]);
	const maximumAge = useMemo(
		() => Math.max(0, ...preparedNPCs.map((item) => item.age ?? 0)),
		[preparedNPCs],
	);

	useEffect(() => {
		setListState((current) => {
			const [minimum, maximum] = current.ageRange;
			if (maximum === 0 || maximum > maximumAge) {
				return { ...current, ageRange: [Math.min(minimum, maximumAge), maximumAge] };
			}
			return current;
		});
	}, [maximumAge]);


	const filterOptions = useMemo(
		() => ({
			races: toComboboxOptions(uniqueNames(preparedNPCs.map((item) => item.race))),
			genders: toComboboxOptions(uniqueNames(preparedNPCs.map((item) => item.gender))),
			professions: toComboboxOptions(uniqueNames(preparedNPCs.map((item) => item.profession))),
			locations: toComboboxOptions(uniqueNames(preparedNPCs.map((item) => item.location))),
			groups: toComboboxOptions(uniqueNames(preparedNPCs.flatMap((item) => [...item.groups]))),
			religions: toComboboxOptions(uniqueNames(preparedNPCs.flatMap((item) => [...item.religions]))),
		}),
		[preparedNPCs],
	);

	const visible = useMemo(() => {
		const filtered = preparedNPCs.filter((item) => {
			if (deferredCriteria.query && !item.searchText.includes(deferredCriteria.query)) return false;
			if (deferredCriteria.race !== "all" && item.race !== deferredCriteria.race) return false;
			if (deferredCriteria.gender !== "all" && item.gender !== deferredCriteria.gender) return false;
			if (deferredCriteria.profession !== "all" && item.profession !== deferredCriteria.profession) return false;
			if (deferredCriteria.location !== "all" && item.location !== deferredCriteria.location) return false;
			if (deferredCriteria.group !== "all" && !item.groups.has(deferredCriteria.group)) return false;
			if (deferredCriteria.religion !== "all" && !item.religions.has(deferredCriteria.religion)) return false;
			if (!matchesAge(item.age, deferredCriteria.ageRange, maximumAge)) return false;
			return true;
		});

		filtered.sort((left, right) => {
			if (deferredCriteria.sort === "name-desc") return right.displayName.localeCompare(left.displayName);
			if (deferredCriteria.sort === "age-asc") return (left.age ?? Number.POSITIVE_INFINITY) - (right.age ?? Number.POSITIVE_INFINITY);
			if (deferredCriteria.sort === "age-desc") return (right.age ?? Number.NEGATIVE_INFINITY) - (left.age ?? Number.NEGATIVE_INFINITY);
			if (deferredCriteria.sort === "profession-asc") return left.profession.localeCompare(right.profession) || left.displayName.localeCompare(right.displayName);
			if (deferredCriteria.sort === "race-asc") return left.race.localeCompare(right.race) || left.displayName.localeCompare(right.displayName);
			if (deferredCriteria.sort === "location-asc") return left.location.localeCompare(right.location) || left.displayName.localeCompare(right.displayName);
			if (deferredCriteria.sort === "relationships-desc") return right.npc.relationships.length - left.npc.relationships.length || left.displayName.localeCompare(right.displayName);
			if (deferredCriteria.sort === "created-desc") return String(right.npc.createdAt ?? "").localeCompare(String(left.npc.createdAt ?? ""));
			if (deferredCriteria.sort === "updated-desc") return String(right.npc.updatedAt ?? "").localeCompare(String(left.npc.updatedAt ?? ""));
			return left.displayName.localeCompare(right.displayName);
		});

		return filtered.map((item) => item.npc);
	}, [preparedNPCs, deferredCriteria, maximumAge]);

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
		listState.ageRange[0] !== 0 || listState.ageRange[1] !== maximumAge
			? { key: "ageRange", label: `Age: ${listState.ageRange[0]}–${listState.ageRange[1]}` }
			: null,
	].filter((item): item is { key: keyof NPCListState; label: string } =>
		Boolean(item),
	);

	const clearFilter = (key: keyof NPCListState) => {
		if (key === "query") updateState("query", "");
		else if (key === "ageRange") updateState("ageRange", [0, maximumAge]);
		else updateState(key as NPCNameFilterKey, "all");
	};

	const resetFilters = () => {
		resetResultsViewport();
		setListState({ ...DEFAULT_STATE, ageRange: [0, maximumAge] });
	};

	return { navigate, activeMapId, preload, npcs, error, listState, genderDescriptions, creationOpen, setCreationOpen, updateState, loading, filterOptions, visible, activeFilters, clearFilter, resetFilters, maximumAge };
}

function NPCsPageView(model: ReturnType<typeof useNPCsPageModel>) {
	const { navigate, activeMapId, preload, npcs, error, listState, genderDescriptions, creationOpen, setCreationOpen, updateState, loading, filterOptions, visible, activeFilters, clearFilter, resetFilters, maximumAge } = model;
	const [ageDraft, setAgeDraft] = useState<[number, number]>(listState.ageRange);
	useEffect(() => setAgeDraft(listState.ageRange), [listState.ageRange]);
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

						<Box sx={{ m: 1, width: 220, px: 1 }}>
							<Typography variant="caption" color="text.secondary">
								Age: {ageDraft[0]}–{ageDraft[1]}
							</Typography>
							<Slider
								value={ageDraft}
								min={0}
								max={maximumAge}
								disableSwap
								valueLabelDisplay="auto"
								onChange={(_event, value) => setAgeDraft(value as [number, number])}
								onChangeCommitted={(_event, value) => updateState("ageRange", value as [number, number])}
								disabled={maximumAge === 0}
							/>
						</Box>


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
						items={visible}
						getKey={(npc) => npc._id}
						estimateRowHeight={360}
						overscan={1}
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
