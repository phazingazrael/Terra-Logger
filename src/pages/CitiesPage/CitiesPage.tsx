import {
	AppBar,
	Button,
	Checkbox,
	Chip,
	Container,
	FormControl,
	FormControlLabel,
	Grid2 as Grid,
	InputLabel,
	MenuItem,
	OutlinedInput,
	Select,
	Typography,
} from "@mui/material";
import {
	useEffect,
	useMemo,
	useState,
	Suspense,
	lazy,
	useDeferredValue,
} from "react";
import { useDB } from "../../db/DataContext";
import { getAllTags } from "../../components/Tags/Tags.tsx";

import "./citiesPage.css";

import BookLoader from "../../components/Util/bookLoader.tsx";

import type { TLCity, TLCountry } from "../../definitions/TerraLogger";
import type { Tag } from "../../definitions/Common.ts";

const CityCard = lazy(() => import("../../components/Cards/city.tsx"));

type CountryListItem = {
	name: string;
	_id: string;
	nameFull: string;
	color: string;
};

// O(1) lookups for excluded tag ids
const EXCLUDED_TAG_IDS = new Set<string>([
	"0192be16-c07d-74dd-946d-07ba53af9bf0",
	"0192be16-c07d-74f5-99b0-a740feb48fa8",
	"0192be16-c07d-75f5-8a3a-71493c6551c4",
	"0192be16-c07d-744f-8488-5243c3811a7e",
	"0192be16-c07d-75f3-aef5-43d0a0d27233",
	"0192be16-c07d-7a1e-94fc-485f70488182",
	"0192be16-c07d-7e2c-88a4-f1c2fde568bc",
	"0192be16-c07d-7b5e-abf6-d13114d5327b",
	"0192be16-c07d-7739-8b58-d67e3913403a",
]);

function CitiesPage() {
	const { useActive, activeMapId } = useDB();
	const cities = useActive<TLCity>("cities");
	const countries = useActive<TLCountry>("countries");
	const countriesList = useMemo<CountryListItem[]>(
		() =>
			[...countries]
				.map((c) => ({
					name: c.name,
					_id: c._id,
					nameFull: (c as TLCountry).nameFull ?? c.name,
					color: (c as TLCountry).color ?? "#cccccc",
				}))
				.sort((a, b) => (a.name > b.name ? 1 : -1)),
		[countries],
	);

	// Filtering
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

	// Tags, Sizes and Capital Filtering
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [onlyCapitals, setOnlyCapitals] = useState<boolean>(false);
	const [selectedGovForm, setSelectedGovForm] = useState<string>("");

	// Defer heavy filtering while the user is typing
	const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());

	const FullTags = useMemo(() => getAllTags(), []); // array where each item has .Tags: Tag[]

	// biome-ignore lint/correctness/useExhaustiveDependencies: map changed, needs to be reset
	useEffect(() => {
		setSearchQuery("");
		setSelectedCountry(null);
		setSelectedTagIds([]);
		setSelectedSize("");
		setOnlyCapitals(false);
		setSelectedGovForm("");
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);

	// Derived: sizes, gov forms
	const allSizes = useMemo(() => {
		const s = new Set<string>();
		for (const c of cities) if (c.size) s.add(c.size);
		return Array.from(s).sort((a, b) => a.localeCompare(b));
	}, [cities]);

	const allGovForms = useMemo(() => {
		const s = new Set<string>();
		for (const c of cities) if (c.country?.govForm) s.add(c.country.govForm);
		return Array.from(s).sort((a, b) => a.localeCompare(b));
	}, [cities]);

	// Derived: tags (prefer city tags; fall back to full tag list)
	const cityTags = useMemo(() => {
		const seen = new Set<string>();
		const tags: Tag[] = [];
		for (const city of cities) {
			for (const t of city.tags ?? []) {
				if (!EXCLUDED_TAG_IDS.has(t._id) && !seen.has(t._id)) {
					seen.add(t._id);
					tags.push(t);
				}
			}
		}
		return tags;
	}, [cities]);

	const allTags: Tag[] = useMemo(() => {
		if (cityTags.length > 0) return cityTags;
		// Flatten FullTags.*.Tags
		const out: Tag[] = [];
		const seen = new Set<string>();
		for (const group of FullTags) {
			for (const t of group.Tags) {
				if (!seen.has(t._id)) {
					seen.add(t._id);
					out.push(t);
				}
			}
		}
		return out;
	}, [cityTags, FullTags]);

	// Filtering
	const selectedTagIdSet = useMemo(
		() => new Set(selectedTagIds),
		[selectedTagIds],
	);

	const filteredCities = useMemo(() => {
		if (!cities.length) return [];
		const q = deferredQuery;

		return cities.filter((city) => {
			if (q && !city.name?.toLowerCase().includes(q)) return false;
			if (selectedCountry && city.country?._id !== selectedCountry)
				return false;
			if (selectedSize && city.size !== selectedSize) return false;
			if (selectedGovForm && city.country?.govForm !== selectedGovForm)
				return false;
			if (onlyCapitals && !city.capital) return false;

			if (selectedTagIdSet.size) {
				// city must have at least one selected tag
				let match = false;
				for (const t of city.tags ?? []) {
					if (selectedTagIdSet.has(t._id)) {
						match = true;
						break;
					}
				}
				if (!match) return false;
			}
			return true;
		});
	}, [
		cities,
		deferredQuery,
		selectedCountry,
		selectedSize,
		selectedGovForm,
		onlyCapitals,
		selectedTagIdSet,
	]);

	const resetFilters = () => {
		setSearchQuery("");
		setSelectedCountry(null);
		setSelectedTagIds([]);
		setSelectedSize("");
		setOnlyCapitals(false);
		setSelectedGovForm("");
	};

	return (
		<Container>
			<AppBar position="sticky" color="default">
				<div className="search-filter-container">
					<div>
						<input
							className="search-input"
							placeholder="Search Cities..."
							type="search"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value.toString())}
						/>
						<Button
							variant="contained"
							color="error"
							className="filter-all"
							onClick={resetFilters}
						>
							Reset Filters
						</Button>
					</div>

					{/* Country filter chips */}
					<div className="country-chips">
						{countriesList.map((country) => (
							<Chip
								clickable
								key={country._id}
								id={country._id}
								className={country._id === selectedCountry ? "selected" : ""}
								onClick={() =>
									setSelectedCountry((prev) =>
										prev === country._id ? null : country._id,
									)
								}
								label={country.name}
								sx={{
									bgcolor: country.color,
									border: "1px solid black",
									m: 0.5,
								}}
							/>
						))}
					</div>

					{/* Tags (multi by _id, display Name) */}
					<FormControl sx={{ m: 1, width: 220 }} size="small">
						<InputLabel id="tags-label">Tags</InputLabel>
						<Select
							labelId="tags-label"
							multiple
							value={selectedTagIds}
							onChange={(e) => setSelectedTagIds(e.target.value as string[])}
							input={<OutlinedInput label="Tags" />}
							renderValue={(ids) =>
								ids
									.map((id) => allTags.find((t) => t._id === id)?.Name ?? id)
									.join(", ")
							}
						>
							{allTags.map((tag) => (
								<MenuItem key={tag._id} value={tag._id}>
									{tag.Name}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Size (single) */}
					<FormControl sx={{ m: 1, width: 160 }} size="small">
						<InputLabel id="size-label">Size</InputLabel>
						<Select
							labelId="size-label"
							value={selectedSize}
							onChange={(e) => setSelectedSize(e.target.value)}
							input={<OutlinedInput label="Size" />}
						>
							<MenuItem value="">Any</MenuItem>
							{allSizes.map((s) => (
								<MenuItem key={s} value={s}>
									{s}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Government form (single) */}
					<FormControl sx={{ m: 1, width: 220 }} size="small">
						<InputLabel id="govform-label">Government Type</InputLabel>
						<Select
							labelId="govform-label"
							value={selectedGovForm}
							onChange={(e) => setSelectedGovForm(e.target.value)}
							input={<OutlinedInput label="Government Type" />}
						>
							<MenuItem value="">Any</MenuItem>
							{allGovForms.map((g) => (
								<MenuItem key={g} value={g}>
									{g}
								</MenuItem>
							))}
						</Select>
					</FormControl>

					{/* Capitals only */}
					<FormControlLabel
						sx={{ m: 1 }}
						control={
							<Checkbox
								checked={onlyCapitals}
								onChange={(e) => setOnlyCapitals(e.target.checked)}
								sx={{ ariaLabel: "Show only capitals" }}
							/>
						}
						label="Capitals only"
					/>
				</div>
			</AppBar>
			<div className="contentSubBody CitiesPage">
				{/* Loading state while IndexedDB query resolves */}
				{!cities.length ? (
					<BookLoader />
				) : filteredCities.length === 0 ? (
					<div
						className="no-results"
						style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
					>
						<Typography variant="h6" color="text.secondary">
							No results found
						</Typography>
					</div>
				) : (
					<Grid container spacing={2}>
						<Suspense fallback={<BookLoader />}>
							{filteredCities.map((city) => (
								<Grid size={3} key={city._id + city.name} id={city._id}>
									<CityCard {...city} />
								</Grid>
							))}
						</Suspense>
					</Grid>
				)}
			</div>
		</Container>
	);
}

export default CitiesPage;
