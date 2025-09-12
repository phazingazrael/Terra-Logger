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
import PersonIcon from "@mui/icons-material/Person";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GroupsIcon from "@mui/icons-material/Groups";
import PlaceIcon from "@mui/icons-material/Place";

import { useDB } from "../../db/DataContext";

import {
	getFormColor,
	getTypeColor,
} from "../../components/Util/religionUtils";

import type { TLReligion } from "../../definitions/TerraLogger";

import "./viewStyles.css";

function ReligionView() {
	const religionId = useParams();

	const { useActive } = useDB();
	const religions = useActive<TLReligion>("religions");
	const religion = useMemo(
		() => religions.find((r) => r._id === religionId?._id),
		[religions, religionId?._id],
	);
	const totalMembers = useMemo(() => {
		const rural = religion?.members.rural ?? 0;
		const urban = religion?.members.urban ?? 0;
		return rural + urban;
	}, [religion]);
	const ruralPercentage = useMemo(() => {
		if (!religion || totalMembers === 0) return 0;
		return (religion.members.rural / totalMembers) * 100;
	}, [religion, totalMembers]);
	const urbanPercentage = useMemo(() => {
		if (!religion || totalMembers === 0) return 0;
		return (religion.members.urban / totalMembers) * 100;
	}, [religion, totalMembers]);

	const theme = useTheme();

	return (
		<Container className="Religion">
			<div className="contentSubBody">
				<div className="flex-container">
					<div className="wiki">
						<div className="header">
							<div className="info">
								{/* Religion Name */}
								<Typography
									variant="h3"
									component="h1"
									gutterBottom
									sx={{ fontWeight: "bold", textAlign: "center" }}
								>
									{religion?.name}
								</Typography>
								{/* Religion Chips */}
								<Box
									sx={{
										display: "flex",
										justifyContent: "center",
										gap: 1,
										mb: 2,
									}}
								>
									{
										/* Religion Type Chip */
										religion?.type ? (
											<Chip
												label={religion?.type}
												sx={{
													bgcolor: getTypeColor(religion?.type),
													color: "white",
													fontWeight: "bold",
												}}
											/>
										) : null
									}

									{
										/* Religion Form Chip */
										religion?.form ? (
											<Chip
												label={religion?.form}
												sx={{
													bgcolor: getFormColor(religion?.form),
													color: "white",
													fontWeight: "bold",
												}}
											/>
										) : null
									}
									{
										/* Religion Code Chip */
										religion?.code ? (
											<Chip
												sx={{
													bgcolor: getTypeColor(religion?.type),
													color: "white",
													fontWeight: "bold",
												}}
												label={religion?.code}
												variant="outlined"
											/>
										) : null
									}
								</Box>
							</div>
						</div>
						<div className="header">
							<Grid container spacing={3}>
								<Grid>
									<Box sx={{ mb: 2, textAlign: "center" }}>
										<section>
											<PersonIcon
												sx={{
													fontSize: 40,
													color: getFormColor(religion?.form),
													mb: 1,
												}}
											/>
											<Typography variant="h6" gutterBottom>
												Primary Deity
											</Typography>
											<Typography
												variant="h5"
												sx={{
													fontWeight: "bold",
													color: getFormColor(religion?.form),
												}}
											>
												{religion?.deity ?? "None"}
											</Typography>
										</section>
									</Box>
								</Grid>
								<Grid>
									<Box sx={{ mb: 2, textAlign: "center" }}>
										<section>
											<PlaceIcon
												sx={{
													fontSize: 40,
													color: theme.palette.primary.main,
													mb: 1,
												}}
											/>
											<Typography variant="h6" gutterBottom>
												Centered in
											</Typography>
											<Typography
												variant="h5"
												sx={{
													fontWeight: "bold",
													color: theme.palette.primary.main,
												}}
											>
												{religion?.center.name ?? "None"}
											</Typography>
										</section>
									</Box>
								</Grid>
							</Grid>
						</div>

						<main className="content">
							<section className="description">
								<Typography
									variant="h5"
									gutterBottom
									sx={{ fontWeight: "bold", mb: 3 }}
								>
									Membership
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
											<Typography variant="h6">Total Members</Typography>
										</Box>
										<Typography
											variant="h4"
											sx={{
												fontWeight: "bold",
												color: theme.palette.primary.main,
											}}
										>
											{totalMembers.toLocaleString("en-US")}
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
													{religion?.members.rural.toLocaleString("en-US")}
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
													{religion?.members.urban.toLocaleString("en-US")}
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
									{religion?.tags.map((tag) => (
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

export default ReligionView;
