import { Container } from "@mui/material";
import { useEffect, lazy } from "react";
import { useActive, useDB } from "../../db/DataContext";

import type { TLCulture } from "../../definitions/TerraLogger";
import { VirtualizedCardGrid } from "../../components/Virtualized";

const CultureCard = lazy(() => import("../../components/Cards/culture"));

function CulturesPage() {
	const { activeMapId } = useDB();
	const cultures = useActive<TLCulture>("cultures");

	// biome-ignore lint/correctness/useExhaustiveDependencies: Map change should scroll to top
	useEffect(() => {
		document.getElementById("Content")?.scrollTo({ top: 0 });
	}, [activeMapId]);

	return (
		<Container>
			<div className="contentSubBody CulturesPage">
				<VirtualizedCardGrid
					rowGap={24}
					items={cultures}
					getKey={(entry) => entry._id}
					renderItem={(entry) => (
						<div id={entry._id}>
							<CultureCard {...entry} />
						</div>
					)}
				/>
			</div>
		</Container>
	);
}

export default CulturesPage;
