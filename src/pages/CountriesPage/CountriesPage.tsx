import { Container, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import mapAtom from "../../atoms/map";
import { initDatabase } from "../../db/database";
import { queryDataFromStore } from "../../db/interactions";

import { CountryCard } from "../../components/Cards";

function CountriesPage() {
	const [map] = useRecoilState(mapAtom);
	const [countries, setCountries] = useState<TLCountry[]>([]);
	const { mapId } = map;
	//console.log(map);
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
	}, []);
	return (
		<Container>
			<div className="contentSubHead">
				<h3>Countries</h3>
			</div>
			<div className="contentSubBody">
				<Grid container spacing={2}>
					{countries.map((entry) => (
						<Grid item xs={3} key={entry._id} id={entry._id}>
							<CountryCard {...entry} />
						</Grid>
					))}
				</Grid>
			</div>
		</Container>
	);
}

export default CountriesPage;
