import {
	Button,
	ButtonGroup,
	Container,
	Chip,
	Grid2 as Grid,
} from "@mui/material";
import React, { useEffect, useState, Suspense } from "react";
import { useRecoilState } from "recoil";
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
	const [map] = useRecoilState(mapAtom);
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
	}, [searchQuery, selectedCountry, cities]);

	return (
		<Container>
			<div className="contentSubHead">
				<h3>Cities</h3>
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
							variant="outlined"
							id="filter-all"
							className="filter-all"
							onClick={() => {
								setSearchQuery("");
								setSelectedCountry(null);
							}}
						>
							All
						</Button>
					</div>
					<div>
						{countriesList.map((country) => (
							<Chip
								component="a"
								href="#basic-chip"
								clickable
								key={country._id}
								id={country._id}
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
			</div>
			<div className="contentSubBody">
				<Grid container spacing={2}>
					<Suspense
						fallback={
							<Grid size={12}>
								<BookLoader />
							</Grid>
						}
					>
						{filteredCities.length === 0
							? cities.map((entry) => (
									<Grid size={3} key={entry._id + entry.name} id={entry._id}>
										<LazyCityCard {...entry} />
									</Grid>
								))
							: filteredCities.map((entry) => (
									<Grid size={3} key={entry._id + entry.name} id={entry._id}>
										<LazyCityCard {...entry} />
									</Grid>
								))}
					</Suspense>
				</Grid>
			</div>
		</Container>
	);
}

export default CitiesPage;
