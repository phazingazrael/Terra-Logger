import { Container, Grid } from "@mui/material";
import { useEffect, lazy } from "react";
import { useDB } from "../../db/DataContext";

import type { TLCulture } from "../../definitions/TerraLogger";

const CultureCard = lazy(() => import("../../components/Cards/culture"));

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
