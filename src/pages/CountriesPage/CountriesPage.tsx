import { Container, Grid2 as Grid } from "@mui/material";
import { useEffect, useMemo } from "react";
import { useDB } from "../../db/DataContext";

import { CountryCard } from "../../components/Cards";

import type { TLCountry } from "../../definitions/TerraLogger";

function CountriesPage() {
	const { useActive, activeMapId } = useDB();
	const countries = useActive<TLCountry>("countries");
	const sortedCountries = useMemo(
		() => [...countries].sort((a, b) => (a.name > b.name ? 1 : -1)),
		[countries],
	);
	console.log(countries);
	console.log(activeMapId);

	// biome-ignore lint/correctness/useExhaustiveDependencies: should scroll to top of page when map changes
	useEffect(() => {
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);
	return (
		<Container>
			<div className="contentSubBody CountriesPage">
				<Grid container spacing={2}>
					{sortedCountries.map((entry) => (
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
