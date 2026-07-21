import { Container } from "@mui/material";
import { lazy, useEffect, useMemo } from "react";
import { useDB } from "../../db/DataContext";

import type { TLCountry } from "../../definitions/TerraLogger";
import { VirtualizedCardGrid } from "../../components/Virtualized";

const CountryCard = lazy(() => import("../../components/Cards/country"));

function CountriesPage() {
	const { useActive, activeMapId } = useDB();
	const countries = useActive<TLCountry>("countries");
	const sortedCountries = useMemo(
		() => [...countries].sort((a, b) => (a.name > b.name ? 1 : -1)),
		[countries],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: should scroll to top of page when map changes
	useEffect(() => {
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);
	return (
		<Container>
			<div className="contentSubBody CountriesPage">
				<VirtualizedCardGrid
					items={sortedCountries}
					getKey={(country) => country._id}
					renderItem={(country) => (
						<div id={country._id}>
							<CountryCard {...country} />
						</div>
					)}
				/>
			</div>
		</Container>
	);
}

export default CountriesPage;
