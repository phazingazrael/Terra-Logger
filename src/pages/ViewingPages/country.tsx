import { useEffect, useState, useMemo } from "react";
import {
	Container,
	Typography,
	LinearProgress,
	Box,
	useTheme,
	Grid2 as Grid,
	Paper,
} from "@mui/material";

import { IconContext } from "react-icons";
import { GiSparkles } from "react-icons/gi";
import { useParams } from "react-router-dom";
import { useDB } from "../../db/DataContext";

import AgricultureIcon from "@mui/icons-material/Agriculture";
import LocationCityIcon from "@mui/icons-material/LocationCity";

import type {
	TLCountry,
	TLDiplomacy,
	TLNote,
} from "../../definitions/TerraLogger";

import DOMPurify from "dompurify";

import "./viewStyles.css";
import { DynamicSparkle, SemiDynamicSparkle } from "../../styles";
import JsonUI from "../../components/jsonui/jsonui";
import countryContent from "../../components/jsonui/countrycontent.json";

const toInt = (s?: string | number) => {
	if (typeof s === "number") return Math.trunc(s);
	if (!s) return 0;
	// remove commas, spaces (incl. NBSP), and any other non-digits
	const cleaned = s.replace(/\s|\u00A0/g, "").replace(/,/g, "");
	const n = Number.parseInt(cleaned, 10);
	return Number.isFinite(n) ? n : 0;
};

function CountryView() {
	const countryId = useParams();
	const { useActive } = useDB();
	const countries = useActive<TLCountry>("countries");
	const notes = useActive<TLNote>("notes");
	const country = useMemo(
		() => countries.find((c) => c._id === countryId?._id),
		[countries, countryId?._id],
	);

	const [ruralPercentage, setRuralPercentage] = useState(0);
	const [urbanPercentage, setUrbanPercentage] = useState(0);

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

	useEffect(() => {
		if (country) {
			const ruralPopulation = toInt(country.population.rural);
			const urbanPopulation = toInt(country.population.urban);

			const TotalPopulation = toInt(country.population.total);

			setRuralPercentage(
				TotalPopulation === 0 ? 0 : (ruralPopulation / TotalPopulation) * 100,
			);
			setUrbanPercentage(
				TotalPopulation === 0 ? 0 : (urbanPopulation / TotalPopulation) * 100,
			);
		}
	}, [country]);

	const theme = useTheme();

	const IconStyles = useMemo(() => ({}), []);

	const Description =
		country?.description && country?.description.length > 0
			? country?.description
			: notes?.some(
						(note) =>
							note.name === country?.name || note.name === country?.nameFull,
					) && notes.some((note) => note.type === "country")
				? DOMPurify.sanitize(
						notes?.find(
							(note) =>
								note.name === country?.name || note.name === country?.nameFull,
						)?.legend as string,
					)
				: `${country?.name} is a country.`;

	return (
		<Container className="ViewPage">
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
									// biome-ignore lint/security/noDangerouslySetInnerHtml: domPurify in effect.
									dangerouslySetInnerHTML={{
										__html: country?.coaSVG ?? "",
									}}
								/>
								<div className="info">
									<Typography variant="h1">{country?.name}</Typography>
									<Grid container className="meta">
										<Grid size={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
											<Typography color="text.secondary" component="h3">
												{country?.nameFull}{" "}
												<GiSparkles style={DynamicSparkle} />
											</Typography>
											<Typography color="text.secondary" component="h3">
												Type: {country?.type}{" "}
												<GiSparkles style={DynamicSparkle} />
											</Typography>
										</Grid>
										<Grid size={{ xs: 8, sm: 8, md: 8, lg: 8, xl: 8 }}>
											<Grid container className="popGrid">
												<Grid size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
													<Paper color="text.secondary" className="section">
														<Box>
															<Box
																sx={{
																	display: "flex",
																	justifyContent: "space-between",
																	alignItems: "center",
																	mb: 1,
																}}
															>
																<Box
																	sx={{ display: "flex", alignItems: "center" }}
																>
																	<Typography
																		color="text.secondary"
																		variant="subtitle1"
																	>
																		Population:{" "}
																		<GiSparkles style={DynamicSparkle} />
																	</Typography>
																</Box>
																<Typography
																	variant="h6"
																	color="text.secondary"
																	sx={{ fontWeight: "bold" }}
																>
																	{country?.population.total}
																</Typography>
															</Box>
														</Box>
													</Paper>
													<Grid container spacing={4} sx={{ mt: 2 }}>
														<Grid size={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
															<Paper color="text.secondary" className="section">
																<Box>
																	<Box
																		sx={{
																			display: "flex",
																			justifyContent: "space-between",
																			alignItems: "center",
																			mb: 1,
																		}}
																	>
																		<Box
																			sx={{
																				display: "flex",
																				alignItems: "center",
																			}}
																		>
																			<AgricultureIcon
																				sx={{ mr: 1, color: "#4caf50" }}
																			/>
																			<Typography
																				color="text.secondary"
																				variant="subtitle1"
																			>
																				Rural Population:{" "}
																				<GiSparkles style={DynamicSparkle} />
																			</Typography>
																		</Box>
																	</Box>

																	<Typography
																		variant="h6"
																		color="text.secondary"
																		sx={{ fontWeight: "bold" }}
																	>
																		{country?.population.rural}
																	</Typography>

																	<LinearProgress
																		variant="determinate"
																		value={ruralPercentage}
																		sx={{
																			height: 8,
																			borderRadius: 4,
																			bgcolor: theme.palette.grey[200],
																			"& .MuiLinearProgress-bar": {
																				bgcolor: "#4caf50",
																				borderRadius: 4,
																			},
																		}}
																	/>
																	<Typography
																		variant="body2"
																		color="text.secondary"
																		sx={{ mt: 0.5 }}
																	>
																		{ruralPercentage !== 0
																			? ruralPercentage.toFixed(1)
																			: 0}
																		% of total
																	</Typography>
																</Box>
															</Paper>
														</Grid>
														<Grid size={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
															<Paper color="text.secondary" className="section">
																<Box>
																	<Box
																		sx={{
																			display: "flex",
																			justifyContent: "space-between",
																			alignItems: "center",
																			mb: 1,
																		}}
																	>
																		<Box
																			sx={{
																				display: "flex",
																				alignItems: "center",
																			}}
																		>
																			<LocationCityIcon
																				sx={{ mr: 1, color: "#2196f3" }}
																			/>
																			<Typography
																				variant="subtitle1"
																				color="text.secondary"
																				style={{ width: "100%" }}
																			>
																				Urban Population:{" "}
																				<GiSparkles style={DynamicSparkle} />
																			</Typography>
																		</Box>
																	</Box>
																	<Typography
																		variant="h6"
																		color="text.secondary"
																		sx={{ fontWeight: "bold" }}
																	>
																		{country?.population.urban}
																	</Typography>
																	<LinearProgress
																		variant="determinate"
																		value={urbanPercentage || 0}
																		sx={{
																			height: 8,
																			borderRadius: 4,
																			bgcolor: theme.palette.grey[200],
																			"& .MuiLinearProgress-bar": {
																				bgcolor: "#2196f3",
																				borderRadius: 4,
																			},
																		}}
																	/>
																	<Typography
																		variant="body2"
																		color="text.secondary"
																		sx={{ mt: 0.5 }}
																	>
																		{urbanPercentage.toFixed(1)}% of total
																	</Typography>
																</Box>
															</Paper>
														</Grid>
													</Grid>
												</Grid>
											</Grid>
										</Grid>
									</Grid>
								</div>
							</div>

							<main className="content">
								<Paper color="text.secondary" className="section description">
									<Typography color="text.secondary" component="h2">
										Description
									</Typography>
									<Typography
										color="text.secondary"
										component="div"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: domPurify running on Description
										dangerouslySetInnerHTML={{ __html: Description }}
									/>
								</Paper>

								<JsonUI type={countryContent.type} props={countryContent.props}>
									{countryContent.children}
								</JsonUI>
							</main>
						</div>
					</div>
				</div>
			</IconContext.Provider>
		</Container>
	);
}

export default CountryView;
