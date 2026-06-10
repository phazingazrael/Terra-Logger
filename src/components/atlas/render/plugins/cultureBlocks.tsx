import { useMemo } from "react";
import { Box, Chip, Typography, useTheme } from "@mui/material";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";

import type { TLCulture } from "../../../../definitions/TerraLogger";
import { Link } from "react-router-dom";

export const cultureBlockPlugins: Record<string, AtlasBlockPlugin> = {
	cultureHeader: {
		type: "cultureHeader",
		label: "Culture Header",
		Render: ({ context }) => {
			const theme = useTheme();
			const culture = context.entity as {
				name?: string;
				type?: string;
				code?: string;
				color?: string;
			};
			return (
				<div>
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
			);
		},
	},
	cultureOrigins: {
		type: "cultureOrigins",
		label: "Culture Origins",
		Render: ({ context }) => {
			const culture = context.entity as TLCulture;
			const cultures = context?.related?.cultures as TLCulture[];
			const rawOrigins = culture.origins;
			const rawBase = culture.base;

			const origins = useMemo(() => {
				if (!rawOrigins) return [];
				const O = cultures.filter((c) => rawOrigins?.includes(c.id));
				const Origins = [] as { name: string; _id: string }[];
				for (const o of O) {
					Origins.push({ name: o.name, _id: o._id });
				}
				if (Origins.length === 0) return ["No Cultural Origins Found"];
				return Origins;
			}, [cultures, rawOrigins]);

			const base = useMemo(() => {
				const B = cultures.find((c) => c.id === rawBase);
				if (B === undefined || B === null) return "No Base Culture Found";

				return { name: B.name, _id: B._id };
			}, [cultures, rawBase]);

			return (
				<div>
					<div className="detail-container">
						<Typography component="span" className="detail-label">
							Cultural Origins:
						</Typography>
						<span className="detail-value">
							<ul>
								{origins.map((origin) => {
									if (
										typeof origin === "object" &&
										origin !== null &&
										"name" in origin
									) {
										return (
											<li className={origin._id} key={origin.name}>
												<Link to={`/view_culture/${origin._id}`}>
													{origin.name}
												</Link>
											</li>
										);
									} else {
										return <li key="emptyOrigin">No Cultural Origins Found</li>;
									}
								})}
							</ul>
						</span>
					</div>
					<div className="detail-container">
						<Typography component="span" className="detail-label">
							Base Culture:
						</Typography>
						<span className="detail-value">
							{typeof base === "object" ? (
								<Link to={`/view_culture/${base._id}`}>{base.name}</Link>
							) : (
								String(base)
							)}
						</span>
					</div>
				</div>
			);
		},
	},
};
