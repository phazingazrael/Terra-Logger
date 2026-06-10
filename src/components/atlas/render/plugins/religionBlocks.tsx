import { Box, Chip, Grid, Typography, useTheme } from "@mui/material";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { getFormColor, getTypeColor } from "../../../Util/religionUtils";
import PersonIcon from "@mui/icons-material/Person";
import PlaceIcon from "@mui/icons-material/Place";

export const religionBlockPlugins: Record<string, AtlasBlockPlugin> = {
	religionMembership: {
		type: "religionMembership",
		label: "Religion Membership",
		Render: ({ context }) => {
			const religion = context.entity as {
				members?: { urban?: number; rural?: number };
			};
			return (
				<dl className="atlas-details-list">
					<div>
						<dt>Urban</dt>
						<dd>{religion.members?.urban ?? 0}</dd>
					</div>
					<div>
						<dt>Rural</dt>
						<dd>{religion.members?.rural ?? 0}</dd>
					</div>
				</dl>
			);
		},
	},
	religionHeader: {
		type: "religionHeader",
		label: "Religion Header",
		Render: ({ context }) => {
			const theme = useTheme();
			const religion = context.entity as {
				name?: string;
				type?: string;
				form?: string;
				code?: string;
				deity: string;
				center: {
					name?: string;
					_id?: string;
					i?: number;
				};
			};

			return (
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
										key={religion?.type}
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
										key={religion?.form}
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
										key={religion?.code}
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
						<Grid className="meta" container spacing={3}>
							<Grid size={6}>
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
							<Grid size={6}>
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
				</div>
			);
		},
	},
};
