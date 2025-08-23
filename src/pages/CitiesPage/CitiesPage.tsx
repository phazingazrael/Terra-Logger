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
import { useEffect, useState, Suspense, useMemo } from "react";
import { useRecoilState } from "recoil";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";
import { getAllTags } from "../../components/Tags/Tags.tsx";

import "./citiesPage.css";

import BookLoader from "../../components/Util/bookLoader.tsx";

import type { TLCity, TLCountry } from "../../definitions/TerraLogger";
import type { Tag } from "../../definitions/Common.ts";

import CityCard from "../../components/Cards/city.tsx";

type countriesList = {
	name: string;
	_id: string;
	nameFull: string;
	color: string;
};

function CitiesPage() {
	// state management section
	const [map] = useRecoilState(mapAtom);
	const [cities, setCities] = useState<TLCity[]>([]);

	// Filtering
	const [filteredCities, setFilteredCities] = useState<TLCity[]>([]);
	const [countriesList, setCountriesList] = useState<countriesList[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

	// Tags, Sizes and Capital Filtering
	const [allTags, setAllTags] = useState<Tag[]>([]);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [allSizes, setAllSizes] = useState<string[]>([]);
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [onlyCapitals, setOnlyCapitals] = useState<boolean>(false);
	const [allGovForms, setAllGovForms] = useState<string[]>([]);
	const [selectedGovForm, setSelectedGovForm] = useState<string>("");

	const { mapId } = map;

	const excludedIds = [
		"0192be16-c07d-74dd-946d-07ba53af9bf0",
		"0192be16-c07d-74f5-99b0-a740feb48fa8",
		"0192be16-c07d-75f5-8a3a-71493c6551c4",
		"0192be16-c07d-744f-8488-5243c3811a7e",
		"0192be16-c07d-75f3-aef5-43d0a0d27233",
		"0192be16-c07d-7a1e-94fc-485f70488182",
		"0192be16-c07d-7e2c-88a4-f1c2fde568bc",
		"0192be16-c07d-7b5e-abf6-d13114d5327b",
		"0192be16-c07d-7739-8b58-d67e3913403a",
	];

	const FullTags = useMemo(() => getAllTags(), []); // array where each item has .Tags: Tag[]
	const CityTags: Tag[] = [];
	const AllTags: Tag[] = [];

	// Build countries, cities
	useEffect(() => {
		const initializeDatabase = async () => {
			try {
				const database = await initDatabase();
				if (database) {
					console.info("Database initialized");
				}
			} catch (error) {
				console.error(error);
			}

			const countries = (await queryDataFromStore(
				"countries",
				"mapIdIndex",
				mapId,
			)) as TLCountry[];
			const sortedCountries = [...countries].sort((a, b) =>
				a.name > b.name ? 1 : -1,
			);
			setCountriesList(sortedCountries);

			const data = (await queryDataFromStore(
				"cities",
				"mapIdIndex",
				mapId,
			)) as TLCity[];

			if (data) {
				const sortedData = [...data].sort((a, b) => (a.name > b.name ? 1 : -1));
				setCities(sortedData);
			}

			setSearchQuery("");
			setSelectedCountry(null);
		};

		initializeDatabase();
	}, [mapId]);

	// Helpers to avoid unnecessary state updates (reference-stable)
	function byIdShallowEqual(a: Tag[], b: Tag[]) {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (a[i]._id !== b[i]._id) return false;
		return true;
	}
	function strArrayEqual(a: string[], b: string[]) {
		if (a === b) return true;
		if (a.length !== b.length) return false;
		for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
		return true;
	}

	// Build CityTags, AllTags, Sizes, then decide which tag set to use
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (cities.length === 0) return;

		// Collect unique CityTags from cities (excluding excludedIds)
		for (const city of cities) {
			for (const tag of city.tags) {
				if (!CityTags.find((t) => t._id === tag._id)) {
					if (!excludedIds.find((id) => id === tag._id)) {
						CityTags.push(tag);
					}
				}
			}
		}

		// Flatten FullTags.*.Tags into AllTags
		for (const group of FullTags) {
			for (const tag of group.Tags) {
				AllTags.push(tag);
			}
		}

		// Collect sizes from cities (as state, so UI updates)
		const nextSizes = Array.from(
			new Set(cities.map((c) => c.size).filter(Boolean)),
		).sort((a, b) => a.localeCompare(b));
		setAllSizes((prev) => (strArrayEqual(prev, nextSizes) ? prev : nextSizes));
		console.log(allSizes);

		// Collect government forms from cities (unique, sorted)
		const nextGovForms = Array.from(
			new Set(cities.map((c) => c.country?.govForm).filter(Boolean)),
		).sort((a, b) => a.localeCompare(b));
		setAllGovForms((prev) =>
			strArrayEqual(prev, nextGovForms) ? prev : nextGovForms,
		);

		// Precedence: if CityTags has items, use CityTags; else use AllTags
		const nextTags = CityTags.length > 0 ? CityTags : AllTags;
		setAllTags((prev) => (byIdShallowEqual(prev, nextTags) ? prev : nextTags));
	}, [cities, FullTags]);

	// Derived filtering
	const derivedFiltered = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();

		return cities.filter((city) => {
			// name query
			if (q && !city.name?.toLowerCase().includes(q)) return false;

			// country
			if (selectedCountry && city.country._id !== selectedCountry) return false;

			// size
			if (selectedSize && city.size !== selectedSize) return false;

			// government form
			if (selectedGovForm && city.country?.govForm !== selectedGovForm)
				return false;

			// capitals only
			if (onlyCapitals && !city.capital) return false;

			// tags (city must have at least one of the selected tags)
			if (selectedTagIds.length) {
				const cityTagIds = city.tags.map((t) => t._id);
				if (!selectedTagIds.some((id) => cityTagIds.includes(id))) return false;
			}

			return true;
		});
	}, [
		cities,
		searchQuery,
		selectedCountry,
		selectedSize,
		selectedTagIds,
		onlyCapitals,
		selectedGovForm,
	]);

	// Keep your state-driven rendering the same
	useEffect(() => {
		setFilteredCities(derivedFiltered);
	}, [derivedFiltered]);

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
								style={{
									backgroundColor: country.color,
									border: "1px solid black",
									margin: "0.25em",
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
							onChange={(e) => {
								const values = e.target.value as string[];
								setSelectedTagIds(values);
							}}
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
								sx={{ "aria-label": "Show only capitals" }}
							/>
						}
						label="Capitals only"
					/>
				</div>
			</AppBar>

			<div className="contentSubBody CitiesPage">
				<Grid container spacing={2}>
					<Suspense fallback={<BookLoader />}>
						{filteredCities.length > 0 ? (
							filteredCities.map((city) => (
								<Grid size={3} key={city._id + city.name} id={city._id}>
									<CityCard {...city} />
								</Grid>
							))
						) : cities.length === 0 ? (
							<BookLoader />
						) : (
							<Grid
								size={12}
								className={cities.length === 0 ? "loading" : "no-results"}
								sx={{ display: "flex", justifyContent: "center", mt: 4 }}
							>
								<Typography variant="h6" color="text.secondary">
									No results found
								</Typography>
							</Grid>
						)}
					</Suspense>
				</Grid>
			</div>
		</Container>
	);
}

export default CitiesPage;
