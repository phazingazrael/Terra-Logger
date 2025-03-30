import { Button, Container, Chip, Grid2 as Grid, AppBar } from "@mui/material";
import { useEffect, useState, Suspense, lazy, Profiler } from "react";
import { useRecoilState } from "recoil";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";

import "./citiesPage.css";

import BookLoader from "../../components/Util/bookLoader.tsx";

const LazyCityCard = lazy(() => import("../../components/Cards/city.tsx"));

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
	const { mapId } = map;

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
			const data = (await queryDataFromStore(
				"cities",
				"mapIdIndex",
				mapId,
			)) as TLCity[];
			if (data) {
				const sortedData = [...data].sort((a, b) => (a.name > b.name ? 1 : -1));
				setCities(sortedData);
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
			setSearchQuery("");
			setSelectedCountry(null);
		};

		initializeDatabase();
	}, [mapId]);

	useEffect(() => {
		if (cities.length > 0) {
			const FilteredCities = cities.filter((city) => {
				if (searchQuery !== "") {
					return city.name?.toLowerCase().includes(searchQuery.toLowerCase());
				}
				if (selectedCountry !== null) {
					return city.country._id === selectedCountry;
				}
				if (selectedCountry === null && searchQuery === "") {
					return cities;
				}
			});
			setFilteredCities(FilteredCities);
		}

		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [searchQuery, selectedCountry, cities]);

	function onRenderProfiler(
		id: string,
		phase: string,
		actualDuration: number,
		baseDuration: number,
		startTime: number,
		commitTime: number,
	) {
		if (phase === "idle") {
			console.log("idle", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "mount") {
			console.log("mount", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "update") {
			console.log("update", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "nested-update") {
			console.log("nested-update", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "render") {
			console.log("render", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "commit") {
			console.log("commit", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "layout") {
			console.log("layout", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		} else if (phase === "passive") {
			console.log("passive", id, actualDuration);
			console.log("baseDuration", baseDuration);
			console.log("startTime", startTime);
			console.log("commitTime", commitTime);
		}
	}

	return (
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
						fallback={
							<Grid size={12}>
								<BookLoader />
							</Grid>
						}
					>
						<Profiler id="cities" onRender={onRenderProfiler}>
							{filteredCities.map((city) => (
								<Grid size={3} key={city._id + city.name} id={city._id}>
									<LazyCityCard {...city} />
								</Grid>
							))}
						</Profiler>
					</Suspense>
				</Grid>
			</div>
		</Container>
	);
}

export default CitiesPage;
