import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Container } from "@mui/material";

import { useDB } from "../../db/DataContext";

import type { TLCulture } from "../../definitions/TerraLogger";

import "./viewStyles.css";
import { type AtlasContent, AtlasRenderer } from "../../components/atlas";

function CultureView() {
	const cultureId = useParams();

	const { useActive } = useDB();
	const cultures = useActive("cultures");
	const culture = useMemo(
		() => cultures.find((c) => c._id === cultureId?._id),
		[cultures, cultureId?._id],
	);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	return (
		<Container className="ViewPage Culture">
			<div className="contentSubBody">
				<div className="flex-container">
					<div className="wiki">
						<AtlasRenderer
							content={culture?.content as AtlasContent}
							context={{
								sourceType: "culture",
								entity: culture as TLCulture,
								related: {
									cultures,
								},
							}}
						/>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default CultureView;
