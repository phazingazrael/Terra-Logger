import { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
	Container,
	Typography,
	Box,
	Grid2 as Grid,
	Chip,
	Card,
	useTheme,
	LinearProgress,
} from "@mui/material";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GroupsIcon from "@mui/icons-material/Groups";

import { useDB } from "../../db/DataContext";

import type { TLCulture } from "../../definitions/TerraLogger";

import "./viewStyles.css";

function CultureView() {
	const cultureId = useParams();

	const { useActive } = useDB();
	const cultures = useActive<TLCulture>("cultures");
	const culture = useMemo(
		() => cultures.find((c) => c._id === cultureId?._id),
		[cultures, cultureId?._id],
	);
	console.log(culture);
	const totalPopulation = useMemo(() => {
		const urbNum = Number.parseInt(
			culture?.urbanPop?.replace(/,/g, "") ?? "0",
			10,
		);
		const ruralNum = Number.parseInt(
			culture?.ruralPop?.replace(/,/g, "") ?? "0",
			10,
		);
		return ruralNum + urbNum;
	}, [culture]);
	const ruralPercentage = useMemo(() => {
		if (!totalPopulation) return 0;
		const rural = Number.parseInt(
			culture?.ruralPop?.replace(/,/g, "") ?? "0",
			10,
		);
		return (rural / totalPopulation) * 100;
	}, [culture, totalPopulation]);
	const urbanPercentage = useMemo(() => {
		if (!totalPopulation) return 0;
		const urban = Number.parseInt(
			culture?.urbanPop?.replace(/,/g, "") ?? "0",
			10,
		);
		return (urban / totalPopulation) * 100;
	}, [culture, totalPopulation]);

	const theme = useTheme();

	return (
		<Container className="ViewPage Culture">
			<div className="contentSubBody">
				<div className="flex-container">
					<div className="wiki">
						<div className="header">
							<div className="info">
								{/* Culture Name */}
								<Typography
									variant="h3"
									component="h1"
									gutterBottom
									sx={{ fontWeight: "bold", textAlign: "center" }}
								>
									{culture?.name}
								</Typography>
								{/* Culture Chips */}
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										gap: 1,
										mb: 2,
									}}
								>
									{
										/* Culture Type Chip */
										culture?.type ? (
											<Chip
												sx={{
													color: theme.palette.text.primary,
													backgroundColor: culture.color,
													fontWeight: "bold",
												}}
												label={`Type: ${culture?.type}`}
											/>
										) : null
									}
									{
										/* Culture Code Chip */
										culture?.code ? (
											<Chip
												sx={{
													color: theme.palette.text.primary,
													backgroundColor: culture.color,
													fontWeight: "bold",
												}}
												label={`Code: ${culture?.code}`}
											/>
										) : null
									}
								</Box>
							</div>
						</div>

						<main className="content">
							<section className="description">
								<Typography
									variant="h5"
									gutterBottom
									sx={{ fontWeight: "bold", mb: 3 }}
								>
									Population
								</Typography>

								<Box sx={{ mb: 3 }}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											mb: 1,
										}}
									>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<GroupsIcon
												sx={{ mr: 1, color: theme.palette.text.secondary }}
											/>
											<Typography variant="h6">Total Population</Typography>
										</Box>
										<Typography
											variant="h4"
											sx={{
												fontWeight: "bold",
												color: theme.palette.primary.main,
											}}
										>
											{totalPopulation.toLocaleString("en-US")}
										</Typography>
									</Box>
								</Box>

								<Grid container spacing={3}>
									<Grid size={{ xs: 12, sm: 6 }}>
										<Box sx={{ mb: 2 }}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													mb: 1,
												}}
											>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<AgricultureIcon sx={{ mr: 1, color: "#4caf50" }} />
													<Typography variant="subtitle1">Rural</Typography>
												</Box>
												<Typography variant="h6" sx={{ fontWeight: "bold" }}>
													{culture?.ruralPop}
												</Typography>
											</Box>
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
												{ruralPercentage !== 0 ? ruralPercentage.toFixed(1) : 0}
												% of total
											</Typography>
										</Box>
									</Grid>
									<Grid size={{ xs: 12, sm: 6 }}>
										<Box sx={{ mb: 2 }}>
											<Box
												sx={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													mb: 1,
												}}
											>
												<Box sx={{ display: "flex", alignItems: "center" }}>
													<LocationCityIcon sx={{ mr: 1, color: "#2196f3" }} />
													<Typography variant="subtitle1">Urban</Typography>
												</Box>
												<Typography variant="h6" sx={{ fontWeight: "bold" }}>
													{culture?.urbanPop}
												</Typography>
											</Box>
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
									</Grid>
								</Grid>
							</section>

							<section className="tags">
								<Typography
									variant="h5"
									gutterBottom
									sx={{ fontWeight: "bold", mb: 3 }}
								>
									Tags
								</Typography>
								<Grid container spacing={2}>
									{culture?.tags.map((tag) => (
										<Grid size={{ xs: 12 }} key={tag._id}>
											<Card
												sx={{
													p: 2,
													transition:
														"transform 0.2s ease, box-shadow 0.2s ease",
													"&:hover": {
														transform: "translateY(-2px)",
														boxShadow: 4,
													},
												}}
											>
												<Box
													sx={{
														display: "flex",
														alignItems: "center",
														mb: 1,
													}}
												>
													<Chip
														label={tag.Name}
														size="small"
														sx={{
															bgcolor: theme.palette.primary.main,
															color: "white",
															mr: 1,
															fontWeight: "bold",
														}}
													/>
													<Typography variant="caption" color="text.secondary">
														{tag.Type.replace(/([A-Z])/g, " $1").trim()}
													</Typography>
												</Box>
												<Typography variant="body1">
													{tag.Description}
												</Typography>
											</Card>
										</Grid>
									))}
								</Grid>
							</section>
						</main>
					</div>
				</div>
			</div>
		</Container>
	);
}

export default CultureView;
