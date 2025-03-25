import { Button, Container, Chip, Grid2 as Grid, AppBar } from "@mui/material";
import React, { useEffect, useState, Suspense, Profiler } from "react";
import { useAtom } from "jotai";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { getFullStore, queryDataFromStore } from "../../db/interactions";

import "./citiesPage.css";

import BookLoader from "../../components/Util/bookLoader.tsx";

type countriesList = {
	name: string;
	_id: string;
	nameFull: string;
	color: string;
};

function CitiesPage() {
	const [map] = useAtom(mapAtom);
	const [cities, setCities] = useState<TLCity[]>([]);
	const [filteredCities, setFilteredCities] = useState<TLCity[]>([]);
	const [countriesList, setCountriesList] = useState<countriesList[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
	const { mapId } = map;

	const LazyCityCard = React.lazy(
		() => import("../../components/Cards/city.tsx"),
	);

	useEffect(() => {
		const initializeDatabase = async () => {
			try {
				const database = await initDatabase();
				if (database) {
					console.log("Database initialized");
				}
			} catch (error) {
				console.error(error);
			}
			const countries = await getFullStore("countries");
			const sortedCountries = [...countries].sort((a, b) =>
				a.name > b.name ? 1 : -1,
			);
			console.log(sortedCountries);
			setCountriesList(sortedCountries);
			setSearchQuery("");
			setSelectedCountry(null);
		};

		initializeDatabase();
	}, []);

	useEffect(() => {
		const loadCities = async () => {
			const data = await queryDataFromStore("cities", "mapIdIndex", mapId);
			if (data) {
				console.log(data);
				const sortedData = [...data].sort((a, b) => (a.name > b.name ? 1 : -1));
				setCities(sortedData);
			}
		};

		loadCities();
	}, [mapId]);

	// eslint-disable react-hooks/exhaustive-deps
	// biome-ignore lint/correctness/useExhaustiveDependencies: cities should not be changing
	useEffect(() => {
		const FilteredCities = cities.filter((city) => {
			if (searchQuery) {
				return city.name?.toLowerCase().includes(searchQuery.toLowerCase());
			}
			if (selectedCountry) {
				return city.country._id === selectedCountry;
			}
			return true;
		});
		setFilteredCities(FilteredCities);
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [searchQuery, selectedCountry]);

	function onRender(
		id: string,
		phase: string,
		actualDuration: number,
		baseDuration: number,
		startTime: number,
		commitTime: number,
	) {
		console.log({
			id,
			phase,
			actualDuration: actualDuration / 1000,
			baseDuration,
			startTime,
			commitTime,
		});
	}

	return (
		<Profiler id="CitiesPage" onRender={onRender}>
			<Container>
				<AppBar position="sticky" color="default">
					<div id="search-filter-container" className="search-filter-container">
						<div>
							<input
								id="search-input"
								className="search-input"
								placeholder="Search Cities..."
								type="search"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value.toString())}
							/>
							<Button
								variant="contained"
								color="error"
								id="filter-all"
								className="filter-all"
								onClick={() => {
									setSearchQuery("");
									setSelectedCountry(null);
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
					</div>
				</AppBar>

				<div className="contentSubBody citiesList">
					<Grid container spacing={2}>
						<Suspense
							key={filteredCities.length}
							fallback={
								<Grid size={12}>
									<BookLoader />
								</Grid>
							}
						>
							{filteredCities.length === 0
								? cities.map((city) => (
										<Grid size={3} key={city._id + city.name} id={city._id}>
											<LazyCityCard {...city} />
										</Grid>
									))
								: filteredCities.map((city) => (
										<Grid size={3} key={city._id + city.name} id={city._id}>
											<LazyCityCard {...city} />
										</Grid>
									))}
						</Suspense>
					</Grid>
				</div>
			</Container>
		</Profiler>
	);
}

export default CitiesPage;
