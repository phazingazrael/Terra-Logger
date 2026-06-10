import {
	Box,
	Grid,
	LinearProgress,
	Paper,
	Popover,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	useTheme,
} from "@mui/material";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import type {
	TLCountry,
	TLDiplomacy,
	TLMilitary,
} from "../../../../definitions/TerraLogger";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { SvgImage } from "../../../Util/svgImage";
import { getPoliticalDescriptor } from "../../../Util/countryUtils";

const toInt = (s?: string | number) => {
	if (typeof s === "number") return Math.trunc(s);
	if (!s) return 0;
	// remove commas, spaces (incl. NBSP), and any other non-digits
	const cleaned = s.replace(/\s|\u00A0/g, "").replace(/,/g, "");
	const n = Number.parseInt(cleaned, 10);
	return Number.isFinite(n) ? n : 0;
};

export const countryBlockPlugins: Record<string, AtlasBlockPlugin> = {
	countryMilitary: {
		type: "countryMilitary",
		label: "Country Military",
		Render: ({ context }) => {
			const country = context.entity as {
				political?: { military?: unknown[] };
			};
			const ID = context.entity._id;
			const [activeTab, setActiveTab] = useState<string>("regiments");

			const military = Array.isArray(country.political?.military)
				? country.political.military
				: [];

			const regiments =
				(country.political as { military?: TLMilitary[] })?.military?.filter(
					(unit) => unit.n === 0,
				) ?? [];

			const fleets =
				(country.political as { military?: TLMilitary[] })?.military?.filter(
					(unit) => unit.n === 1,
				) ?? [];

			if (military.length === 0) return <p>No military data listed.</p>;
			return (
				<div>
					<div key={`military-${ID}`}>
						<div className="tabs">
							<button
								key={`military-regiments-btn-${ID}`}
								type="button"
								className={activeTab === "regiments" ? "active" : ""}
								onClick={() => setActiveTab("regiments")}
							>
								Regiments ({regiments?.length})
							</button>
							<button
								key={`military-fleets-btn-${ID}`}
								type="button"
								className={activeTab === "fleets" ? "active" : ""}
								onClick={() => setActiveTab("fleets")}
							>
								Fleets ({fleets?.length})
							</button>
						</div>

						<div key={`military-content-${ID}`} className="military-content">
							{activeTab === "regiments" && (
								<div
									key={`military-regiments-${ID}`}
									className="military-units"
								>
									<TableContainer>
										<Table className="military-table">
											<TableHead>
												<TableRow>
													<TableCell>Name</TableCell>
													<TableCell>Strength</TableCell>
													<TableCell>Composition</TableCell>
												</TableRow>
											</TableHead>
											<TableBody>
												{regiments?.slice(0, 10).map((regiment) => (
													<TableRow key={regiment._id}>
														<TableCell>
															<span className="unit-icon">{regiment.icon}</span>
															{regiment.name}
														</TableCell>
														<TableCell>{regiment.a}</TableCell>
														<TableCell>
															{!!regiment.u.cavalry && (
																<span className="unit-comp">
																	🐴 {regiment.u.cavalry}
																</span>
															)}
															{!!regiment.u.infantry && (
																<span className="unit-comp">
																	👣 {regiment.u.infantry}
																</span>
															)}
															{!!regiment.u.archers && (
																<span className="unit-comp">
																	🏹 {regiment.u.archers}
																</span>
															)}
															{!!regiment.u.artillery && (
																<span className="unit-comp">
																	💣 {regiment.u.artillery}
																</span>
															)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
									{regiments && regiments.length > 10 && (
										<p className="more-units">
											+ {regiments.length - 10} more regiments
										</p>
									)}
								</div>
							)}

							{activeTab === "fleets" && (
								<div key={`military-fleets-${ID}`} className="military-units">
									<Table className="military-table">
										<TableHead>
											<TableRow>
												<TableCell>Name</TableCell>
												<TableCell>Strength</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{fleets?.slice(0, 10).map((fleet) => (
												<TableRow key={fleet._id}>
													<TableCell>
														<span className="unit-icon">{fleet.icon}</span>
														{fleet.name}
													</TableCell>
													<TableCell>{fleet.a}</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									{fleets && fleets.length > 10 && (
										<p className="more-units">
											+ {fleets.length - 10} more fleets
										</p>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			);
		},
	},
	countryDiplomacy: {
		type: "countryDiplomacy",
		label: "Country Diplomacy",
		Render: ({ context }) => {
			const country = context.entity as TLCountry;

			const countries = context?.related?.countries;

			const diplomacy = country.political?.diplomacy ?? [];
			if (diplomacy.length === 0) return <p>No diplomacy data listed.</p>;

			const diplomacyGroups: Record<string, TLDiplomacy[]> = {};

			for (const relation of country?.political.diplomacy ?? []) {
				if (relation.status !== "-" && relation.status !== "x") {
					if (!diplomacyGroups[relation.status]) {
						diplomacyGroups[relation.status] = [];
					}
					diplomacyGroups[relation.status].push(relation);
				}
			}

			const visibleDiplomacyGroups = Object.entries(diplomacyGroups).filter(
				([, relations]) =>
					relations.some(
						(relation) =>
							relation.name !== "" &&
							relation.name !== null &&
							relation.name !== undefined,
					),
			);

			return visibleDiplomacyGroups.length > 0 ? (
				<div className="diplomacy-relations">
					{visibleDiplomacyGroups.map(([status, relations]) => {
						const visibleRelations = relations.filter(
							(relation) =>
								relation.name !== "" &&
								relation.name !== null &&
								relation.name !== undefined,
						);

						return (
							<div key={status} className="diplomacy-group">
								<Typography
									component="span"
									className="detail-label"
									style={{ fontWeight: "bold", width: "100%" }}
								>
									{status}
								</Typography>

								<ul className="relation-list" style={{ marginTop: "unset" }}>
									{visibleRelations.map((relation) => (
										<li key={relation.id}>
											<Typography
												component="span"
												color="black"
												className="detail-value"
											>
												<Link
													to={`/view_country/${
														countries?.find((c) => c.id === relation.id)?._id
													}`}
												>
													{relation.name}
												</Link>
											</Typography>
										</li>
									))}
								</ul>
							</div>
						);
					})}
				</div>
			) : (
				<p>No diplomatic relations listed</p>
			);
		},
	},
	countryHeader: {
		type: "countryHeader",
		label: "Country Header",
		Render: ({ context }) => {
			const country = context.entity as TLCountry;
			const theme = useTheme();

			const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

			const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
				setAnchorEl(event.currentTarget);
			};

			const handlePopoverClose = () => {
				setAnchorEl(null);
			};

			const open = Boolean(anchorEl);

			const [ruralPercentage, setRuralPercentage] = useState(0);
			const [urbanPercentage, setUrbanPercentage] = useState(0);

			useEffect(() => {
				if (country) {
					const ruralPopulation = toInt(country.population.rural);
					const urbanPopulation = toInt(country.population.urban);

					const TotalPopulation = toInt(country.population.total);

					setRuralPercentage(
						TotalPopulation === 0
							? 0
							: (ruralPopulation / TotalPopulation) * 100,
					);
					setUrbanPercentage(
						TotalPopulation === 0
							? 0
							: (urbanPopulation / TotalPopulation) * 100,
					);
				}
			}, [country]);

			return (
				<div className="header">
					<div className="image">
						<SvgImage
							className="image"
							svg={country?.coaSVG}
							alt={`${country?.name ?? "Country"} coat of arms`}
						/>
					</div>
					<div className="info">
						<Typography variant="h1">{country?.name}</Typography>
						<Grid container className="meta">
							<Grid size={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}>
								<Typography color="text.secondary" component="h3">
									{country?.nameFull}
								</Typography>
								<Typography color="text.secondary" component="h3">
									Type: {country?.type}
								</Typography>
								<Typography
									aria-owns={open ? "GovPopover" : undefined}
									aria-haspopup="true"
									onMouseEnter={handlePopoverOpen}
									onMouseLeave={handlePopoverClose}
									color="text.secondary"
									component="h3"
								>
									{country?.political.form}
									{" - "}
									{country?.political.formName}{" "}
								</Typography>
								<Popover
									id="GovPopover"
									sx={{ pointerEvents: "none" }}
									open={open}
									anchorEl={anchorEl}
									anchorOrigin={{
										vertical: "bottom",
										horizontal: "left",
									}}
									onClose={handlePopoverClose}
									disableRestoreFocus
								>
									<div
										className="GovPop"
										// biome-ignore lint/security/noDangerouslySetInnerHtml: domPurify in effect.
										dangerouslySetInnerHTML={{
											__html:
												getPoliticalDescriptor(country?.political.formName) ??
												"",
										}}
									/>
								</Popover>
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
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<Typography
															color="text.secondary"
															variant="subtitle1"
														>
															Population:
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
															{!Number.isNaN(ruralPercentage) &&
															ruralPercentage !== 0
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
			);
		},
	},
};
