import { Stack, Typography } from "@mui/material";
import type { AtlasBlockPlugin } from "../../../../definitions/Atlas";
import { CapitalBadge } from "../../../../styles";
import { SvgImage } from "../../../Util/svgImage";

export const cityBlockPlugins: Record<string, AtlasBlockPlugin> = {
	cityMapLink: {
		type: "cityMapLink",
		label: "City Map Link",
		Render: ({ block, context }) => {
			const city = context.entity as { mapLink?: string };
			if (!city.mapLink) return <p>No map link available.</p>;
			return (
				<div>
					<a
						style={{ alignSelf: "center" }}
						href={city.mapLink}
						target="_blank"
						rel="noreferrer"
					>
						{(block.props.text ?? "View Map") as string}
					</a>
					<object
						data={`${city.mapLink}&preview=1`}
						style={{
							width: "100%",
							minHeight: "9vh",
						}}
					>
						<p>Alternative content description: This is a map of the city.</p>
					</object>
				</div>
			);
		},
	},
	cityHeader: {
		type: "cityHeader",
		label: "City Header",
		Render: ({ context }) => {
			const city = context.entity as {
				name?: string;
				population?: number;
				coaSVG?: string;
				country?: {
					name?: string;
				};
				size?: string;
				capital?: boolean;
			};
			return (
				<div className="header content-grid">
					<div className="image">
						<SvgImage
							className="image"
							svg={city?.coaSVG}
							alt={`${city?.name ?? "City"} coat of arms`}
						/>
					</div>
					<div className="info">
						<Typography color="text.secondary" variant="h1">
							{city?.name}
						</Typography>
						<div className="meta">
							<Stack direction="column" spacing={1} sx={{ width: "100%" }}>
								<Typography color="text.secondary" component="h3">
									Country: {city?.country?.name}
								</Typography>
								<Typography color="text.secondary" component="h3">
									Population: {city?.population}
								</Typography>
								<Typography color="text.secondary" component="h3">
									Size: {city?.size}
								</Typography>
								{city?.capital && (
									<Typography
										color="text.secondary"
										component="h3"
										style={CapitalBadge}
										className="capital-badge"
									>
										🏛️ Capital
									</Typography>
								)}
							</Stack>
						</div>
					</div>
				</div>
			);
		},
	},
};
