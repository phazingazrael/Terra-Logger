import { Button, ButtonGroup, Container, Grid } from "@mui/material";
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
};

function CitiesPage() {
	const [map] = useRecoilState(mapAtom);
	const [cities, setCities] = useState<TLCity[]>([]);
	const [countriesList, setCountriesList] = useState<countriesList[]>([]);
	const { mapId } = map;

	const LazyCityCard = React.lazy(() => import("../../components/cards/city"));

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
			let countries = await getFullStore("countries");
			let sortedCountries = [...countries].sort((a, b) =>
				a.name > b.name ? 1 : -1,
			);
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
	}, []);

	return (
		<Container>
			<div className="contentSubHead">
				<h3>Cities</h3>
				<div id="search-filter-container" className="search-filter-container">
					<input
						id="search-input"
						className="search-input"
						placeholder="Search Cities..."
						type="search"
					/>
					<Button variant="outlined" id="filter-all" className="filter-all">
						All
					</Button>
					<ButtonGroup className="filter-group country-filter">
						{countriesList.map((country) => (
							<Button key={country._id} id={country._id}>
								{country.name}
							</Button>
						))}
					</ButtonGroup>
				</div>
			</div>
			<div className="contentSubBody">
				<Grid container spacing={2}>
					<Suspense
						fallback={
							<Grid item xs={12}>
								<BookLoader />
							</Grid>
						}
					>
						{cities.map((entry) => (
							<Grid item xs={3} key={entry._id} id={entry._id}>
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
