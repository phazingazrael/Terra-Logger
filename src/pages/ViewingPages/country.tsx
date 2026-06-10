import { useEffect, useMemo } from "react";
import { Container } from "@mui/material";

import { IconContext } from "react-icons";
import { useParams } from "react-router-dom";
import { useDB } from "../../db/DataContext";

import type { TLCountry, TLDiplomacy } from "../../definitions/TerraLogger";

import "./viewStyles.css";

import { AtlasRenderer } from "../../components/atlas/render/Renderer";
import type { AtlasContent } from "../../definitions/Atlas";

function CountryView() {
	const countryId = useParams();
	const { useActive } = useDB();
	const countries = useActive("countries");
  const notes = useActive("notes");
	const country = useMemo(
		() => countries.find((c) => c._id === countryId?._id),
		[countries, countryId?._id],
	);

	// Group diplomatic relations by status
	const diplomacyGroups: Record<string, TLDiplomacy[]> = {};

	for (const relation of country?.political.diplomacy ?? []) {
		if (relation.status !== "-" && relation.status !== "x") {
			if (!diplomacyGroups[relation.status]) {
				diplomacyGroups[relation.status] = [];
			}
			diplomacyGroups[relation.status].push(relation);
		}
	}

	const IconStyles = useMemo(() => ({}), []);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	return (
		<Container className="ViewPage Country">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="wiki">
							<main className="content">
								<AtlasRenderer
									content={country?.content as AtlasContent}
									context={{
										sourceType: "country",
										entity: country as TLCountry,
										related: {
											countries,
											notes,
										},
									}}
								/>
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CountryView;
