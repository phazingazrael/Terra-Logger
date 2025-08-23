import {
	AppBar,
	Button,
	Checkbox,
	Chip,
	Container,
	FormControl,
	Grid2 as Grid,
	InputLabel,
	ListItemText,
	MenuItem,
	OutlinedInput,
	Select,
} from "@mui/material";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useRecoilState } from "recoil";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";
import { getAllTags } from "../../components/Tags/Tags.tsx";

import "./citiesPage.css";

import BookLoader from "../../components/Util/bookLoader.tsx";

import type { TLCity, TLCountry } from "../../definitions/TerraLogger";
import type { Tag } from "../../definitions/Common.ts";

const LazyCityCard = React.lazy(
	() => import("../../components/Cards/city.tsx"),
);

type countriesList = {
	name: string;
	_id: string;
	nameFull: string;
	color: string;
};

function CitiesPage() {
	const [map] = useRecoilState(mapAtom);
	const [cities, setCities] = useState<TLCity[]>([]);
	const [filteredCities, setFilteredCities] = useState<TLCity[]>([]);
	const [countriesList, setCountriesList] = useState<countriesList[]>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
	const [allTags, setAllTags] = useState<Tag[]>([]);
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [, setSelectedSize] = useState<string | null>(null);
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

	const FullTags = getAllTags();
	const CityTags: Tag[] = [];
	const AllTags: Tag[] = [];
	const allSizes: string[] = [];

	const FilteredCities = useMemo(() => {
		return cities.filter((city) => {
			if (searchQuery !== "") {
				return city.name?.toLowerCase().includes(searchQuery);
			}
			if (selectedCountry !== null) {
				return city.country._id === selectedCountry;
			}
			if (selectedTags.length > 0) {
				for (const tag of selectedTags) {
					if (city.tags.find((t) => t._id === tag._id)) {
						return true;
					}
				}
			}
			if (selectedCountry === null && searchQuery === "") {
				return cities;
			}
			return cities;
		});
	}, [cities, searchQuery, selectedCountry, selectedTags]);

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

	useEffect(() => {
		if (cities.length > 0) {
			for (const city of cities) {
				for (const tag of city.tags) {
					if (!CityTags.find((t) => t._id === tag._id)) {
						if (!excludedIds.find((id) => id === tag._id)) {
							CityTags.push(tag);
						}
					}
				}
			}

			for (const Tags of FullTags) {
				for (const Tag of Tags.Tags) {
					AllTags.push(Tag);
				}
			}

			for (const city of cities) {
				if (!allSizes.find((s) => s === city.size)) {
					allSizes.push(city.size);
				}
			}

			if (CityTags.length > 0) {
				setAllTags(CityTags);
			} else if (AllTags.length > 0 && CityTags.length === 0) {
				setAllTags(AllTags);
			}

			// const FilteredCities = cities.filter((city) => {
			// 	if (searchQuery !== "") {
			// 		return city.name?.toLowerCase().includes(searchQuery.toLowerCase());
			// 	}
			// 	if (selectedCountry !== null) {
			// 		return city.country._id === selectedCountry;
			// 	}
			// 	if (selectedTags.length > 0) {
			// 		for (const tag of selectedTags) {
			// 			if (city.tags.find((t) => t._id === tag._id)) {
			// 				return true;
			// 			}
			// 		}
			// 	}
			// 	if (selectedCountry === null && searchQuery === "") {
			// 		return cities;
			// 	}
			// 	return cities;
			// });
			setFilteredCities(FilteredCities);
		}

		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [cities, FullTags, FilteredCities]);

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
							onClick={() => {
								setSearchQuery("");
								setSelectedCountry(null);
								setSelectedTags([]);
								setSelectedSize("");
							}}
						>
							Reset Filters
						</Button>
					</div>
					<div>
						{countriesList.map((country) => (
							<Chip
								clickable
								key={country._id}
								id={country._id}
								className={country._id === selectedCountry ? "selected" : ""}
								onClick={() => setSelectedCountry(country._id)}
								label={country.name}
								style={{
									backgroundColor: country.color,
									border: "1px solid black",
									margin: "0.25em",
								}}
							/>
						))}
					</div>
					{/* Tag filter */}
					<FormControl sx={{ m: 1, width: 200 }}>
						<InputLabel className="tags-label">Tags</InputLabel>
						<Select
							labelId="tags-label"
							multiple
							value={selectedTags.map((tag) => `${tag.Name}`)}
							onChange={(event) => {
								console.log("event start");
								const values = event.target.value;
								if (Array.isArray(values)) {
									console.log(values);
									const SelectedTags = values
										.map((value) => {
											const tag = AllTags.find((tag) => tag.Name === value);
											return tag;
										})
										.filter((t) => t !== undefined);

									setSelectedTags((prevSelectedTags) =>
										SelectedTags.reduce(
											(acc, tag) =>
												acc.some((t) => t._id === tag?._id)
													? acc.filter((t) => t._id !== tag?._id)
													: acc.concat([tag]),
											prevSelectedTags,
										),
									);
									console.log(SelectedTags);
									console.log("event end");
								}
							}}
							input={<OutlinedInput label="Tags" />}
							renderValue={(selected) => selected.join(", ")}
						>
							{allTags.map((tag) => (
								<MenuItem key={tag._id} value={tag.Name}>
									<Checkbox
										checked={selectedTags.some((t) => t.Name === tag.Name)}
									/>
									<ListItemText primary={tag.Name} />
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</div>
			</AppBar>

			<div className="contentSubBody CitiesPage">
				<Grid container spacing={2}>
					<Suspense fallback={<BookLoader />}>
						{filteredCities.length > 0 ? (
							filteredCities.map((city) => (
								<Grid size={3} key={city._id + city.name} id={city._id}>
									<LazyCityCard {...city} />
								</Grid>
							))
						) : (
							<BookLoader />
						)}
					</Suspense>
				</Grid>
			</div>
		</Container>
	);
}

export default CitiesPage;
