import { Container, Grid2 as Grid } from "@mui/material";
import { useEffect } from "react";
import { useDB } from "../../db/DataContext";

import { ReligionCard } from "../../components/Cards";

import type { TLReligion } from "../../definitions/TerraLogger";

function ReligionsPage() {
	const { useActive, activeMapId } = useDB();
	const religions = useActive<TLReligion>("religions");

	// biome-ignore lint/correctness/useExhaustiveDependencies: Map change should scroll to top
	useEffect(() => {
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);

	//TODO(SELF): filter out "dead" religions by default?
	//TODO(SELF): fix white on grey "type Pill"
	return (
		<Container>
			<div className="contentSubBody ReligionsPage">
				<Grid container spacing={2}>
					{religions.map((entry) => (
						<Grid size={3} key={entry._id} id={entry._id}>
							<ReligionCard {...entry} />
						</Grid>
					))}
				</Grid>
			</div>
		</Container>
	);
}

export default ReligionsPage;
