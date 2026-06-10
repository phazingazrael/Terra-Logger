import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";

import { useDB } from "../../db/DataContext";

import type { TLReligion } from "../../definitions/TerraLogger";

import "./viewStyles.css";
import { AtlasRenderer } from "../../components/atlas/render/Renderer";
import type { AtlasContent } from "../../definitions/Atlas";

function ReligionView() {
	const religionId = useParams();

	const { useActive } = useDB();
	const religions = useActive<TLReligion>("religions");
	const religion = useMemo(
		() => religions.find((r) => r._id === religionId?._id),
		[religions, religionId?._id],
	);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	return (
		<Container className="ViewPage Religion">
			<div className="contentSubBody">
				<div className="flex-container">
					<div className="wiki">
						<AtlasRenderer
							content={religion?.content as AtlasContent}
							context={{
								sourceType: "religion",
								entity: religion as TLReligion,
								related: {
									religions,
								},
							}}
						/>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default ReligionView;
