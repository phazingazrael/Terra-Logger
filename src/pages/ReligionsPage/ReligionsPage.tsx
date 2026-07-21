import { Container } from "@mui/material";
import { useEffect, lazy } from "react";
import { useDB } from "../../db/DataContext";

import type { TLReligion } from "../../definitions/TerraLogger";
import { VirtualizedCardGrid } from "../../components/Virtualized";

const ReligionCard = lazy(() => import("../../components/Cards/religion"));

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
				<VirtualizedCardGrid
					items={religions}
					getKey={(entry) => entry._id}
					renderItem={(entry) => (
						<div id={entry._id}>
							<ReligionCard {...entry} />
						</div>
					)}
				/>
			</div>
		</Container>
	);
}

export default ReligionsPage;
