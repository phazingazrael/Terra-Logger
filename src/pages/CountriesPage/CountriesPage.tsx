import { Container, Grid2 as Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";

import { CountryCard } from "../../components/Cards";

function CountriesPage() {
	const [map] = useAtom(mapAtom);
	const [countries, setCountries] = useState<TLCountry[]>([]);
	const { mapId } = map;

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
		};

		initializeDatabase();
	}, []);

	useEffect(() => {
		const loadCountries = async () => {
			const data = await queryDataFromStore("countries", "mapIdIndex", mapId);
			if (data) {
				console.log(data);
				setCountries(data);
			}
		};

		loadCountries();
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [mapId]);
	return (
		<Container>
			<div className="contentSubHead">
				<h3>Countries</h3>
			</div>
			<div className="contentSubBody">
				<Grid container spacing={2}>
					{countries.map((entry) => (
						<Grid size={3} key={entry._id} id={entry._id}>
							<CountryCard {...entry} />
						</Grid>
					))}
				</Grid>
			</div>
		</Container>
	);
}

export default CountriesPage;
