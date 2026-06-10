/* eslint-disable jsx-a11y/label-has-associated-control */
import { Container } from "@mui/material";
import { IconContext } from "react-icons";
import { useDB } from "../../db/DataContext";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

import { AtlasRenderer } from "../../components/atlas/render/Renderer";

import type { TLCity, TLNote } from "../../definitions/TerraLogger";

import "./viewStyles.css";
import { isAtlasContent } from "../../components/atlas";

function CityView() {
	const cityId = useParams();
	const { useActive } = useDB();
	const cities = useActive<TLCity>("cities");
	const notes = useActive<TLNote>("notes");

	const city = useMemo(
		() => cities.find((c) => c._id === cityId?._id),
		[cities, cityId?._id],
	);

	const IconStyles = useMemo(() => ({}), []);

	useEffect(() => {
		const el = document.querySelector(".Content");
		if (el) el.scrollTo({ top: 0, behavior: "auto" });
	}, []);

	return (
		<Container className="ViewPage City" color="text.secondary">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="wiki">
							<main className="content">
								{isAtlasContent(city?.content) ? (
									<AtlasRenderer
										content={city?.content}
										context={{
											sourceType: "city",
											entity: city,
											related: { notes: notes },
										}}
									/>
								) : (
									<p>Loading page content</p>
								)}
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CityView;
