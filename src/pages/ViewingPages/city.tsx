/* eslint-disable jsx-a11y/label-has-associated-control */
import DOMPurify from "dompurify";
import { Container, Paper, Typography } from "@mui/material";
import { IconContext } from "react-icons";
import { useDB } from "../../db/DataContext";
import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { GiSparkles } from "react-icons/gi";

import cityContent from "../../components/jsonui/citycontent.json";
import JsonUI from "../../components/jsonui/jsonui";

import type { TLCity, TLNote } from "../../definitions/TerraLogger";

import "./viewStyles.css";
import {
	CapitalBadge,
	DynamicSparkle,
	DynamicSparkleSmall,
	SemiDynamicSparkle,
} from "../../styles";

function CityView() {
	const cityId = useParams();
	const { useActive } = useDB();
	const cities = useActive<TLCity>("cities");
	const notes = useActive<TLNote>("notes");
	const city = useMemo(
		() => cities.find((c) => c._id === cityId?._id),
		[cities, cityId?._id],
	);

	const Description =
		city?.description && city?.description.length > 0
			? city?.description
			: notes?.some((note) => note.name === city?.name) &&
					notes.some((note) => note.type === "city")
				? DOMPurify.sanitize(
						notes?.find((note) => note.name === city?.name)?.legend as string,
					)
				: `${city?.name} is a city.`;

	const IconStyles = useMemo(() => ({}), []);
	return (
		<Container className="ViewPage" color="text.secondary">
			<IconContext.Provider value={IconStyles}>
				<div className="contentSubBody">
					<div className="flex-container">
						<div className="wiki">
							<div className="legend">
								<details>
									<summary>Info</summary>
									<p>
										<GiSparkles style={DynamicSparkle} /> = Dynamically Loaded
										Information from Azgaar's Fantasy Map Generator
									</p>
									<p>
										<GiSparkles style={SemiDynamicSparkle} /> = Semi Dynamic
										data, Searches for a note with the same name and uses it's
										data.
									</p>
								</details>
							</div>
							<div className="header">
								<div
									className="image"
									// biome-ignore lint/security/noDangerouslySetInnerHtml: domPUrify in effect
									dangerouslySetInnerHTML={{
										__html: city?.coaSVG ?? "",
									}}
								/>
								<div className="info">
									<Typography color="text.secondary" variant="h1">
										{city?.name}
										<GiSparkles style={DynamicSparkle} />
									</Typography>
									<div className="meta">
										<div>
											<Typography color="text.secondary" component="h3">
												Country: {city?.country.name}
												<GiSparkles style={DynamicSparkle} />
											</Typography>
											<Typography color="text.secondary" component="h3">
												Population: {city?.population}
												<GiSparkles style={DynamicSparkle} />
											</Typography>
											<Typography color="text.secondary" component="h3">
												Size: {city?.size}
												<GiSparkles style={DynamicSparkle} />
											</Typography>
											{city?.capital && (
												<Typography
													color="text.secondary"
													component="h3"
													style={CapitalBadge}
													className="capital-badge"
												>
													🏛️ Capital <GiSparkles style={DynamicSparkleSmall} />
												</Typography>
											)}
										</div>
									</div>
								</div>
							</div>

							<main className="content">
								<Paper className="section description">
									<Typography color="text.secondary" component="h2">
										Description
										<GiSparkles style={SemiDynamicSparkle} />
									</Typography>
									<Typography
										color="text.secondary"
										component="div"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: domPurify running on Description
										dangerouslySetInnerHTML={{ __html: Description }}
									/>
								</Paper>

								<JsonUI type={cityContent.type} props={cityContent.props}>
									{cityContent.children}
								</JsonUI>
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CityView;
