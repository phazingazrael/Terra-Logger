import { Container, Grid2 as Grid } from "@mui/material";
import { useEffect } from "react";
import { useDB } from "../../db/DataContext";

import { CultureCard } from "../../components/Cards";

import type { TLCulture } from "../../definitions/TerraLogger";

function CulturesPage() {
	const { useActive, activeMapId } = useDB();
	const cultures = useActive<TLCulture>("cultures");

	// biome-ignore lint/correctness/useExhaustiveDependencies: Map change should scroll to top
	useEffect(() => {
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);

	return (
		<Container>
			<div className="contentSubBody CulturesPage">
				<Grid container spacing={2}>
					{cultures.map((entry) => (
						<Grid size={3} key={entry._id} id={entry._id}>
							<CultureCard {...entry} />
						</Grid>
					))}
				</Grid>
			</div>
		</Container>
	);
}

export default CulturesPage;
