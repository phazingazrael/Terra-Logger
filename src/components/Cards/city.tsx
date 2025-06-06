import { createElement } from "react";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Typography,
	Avatar,
	Box,
} from "@mui/material";
import { v7 as uuidv7 } from "uuid";
import PropTypes from "prop-types";
import { Link, useOutletContext } from "react-router-dom";

import StarOutlineIcon from "@mui/icons-material/StarOutline";

import type { Context } from "../../definitions/Common";
import type { TLCity } from "../../definitions/TerraLogger";

import "./cards.css";
import {
	getFeatureIcon,
	getSettlementColor,
	getSizeIcon,
} from "../Util/cityUtils";
import { getPoliticalColor } from "../Util/countryUtils";

function CityCard(props: Readonly<TLCity>) {
	const city = props;
	const { Theme }: Context = useOutletContext();

	const ImageAlt = "";
	return (
		<Card
			sx={{
				height: "100%",
				display: "flex",
				flexDirection: "column",
				transition: "transform 0.2s ease, box-shadow 0.2s ease",
				"&:hover": {
					transform: "translateY(-4px)",
					boxShadow: 6,
				},
				position: "relative",
				overflow: "visible",
			}}
		>
			{/* City CoA */}
			<Avatar
				sx={{
					bgcolor: getPoliticalColor(city.country.govForm),
					position: "absolute",
					top: -10,
					right: 16,
					boxShadow: 2,
					width: 75,
					height: 75,
				}}
				variant="rounded"
				title={ImageAlt}
			>
				<div
					className="svg-container CoA"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is safe, Generated locally from data
					dangerouslySetInnerHTML={{ __html: city.coaSVG }}
				/>
			</Avatar>

			{/* City Details */}
			<CardContent sx={{ flexGrow: 1, pt: 3 }}>
				{/* City Name */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						mb: 2,
					}}
				>
					<Typography variant="h6" component="h2">
						{city.name}
					</Typography>
				</Box>

				{/* City Detail Chips */}
				<Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
					{city.capital && city.capital !== undefined ? (
						<Chip
							label={`Capital City of ${city.country.name}`}
							size="small"
							sx={{
								backgroundColor: "goldenrod",
								color: Theme.palette.common.white,
							}}
							icon={
								<Box
									sx={{
										color: Theme.palette.common.white,
										display: "flex",
										alignItems: "center",
									}}
								>
									<span
										style={{ color: Theme.palette.common.white, marginTop: 7 }}
									>
										<StarOutlineIcon />
									</span>
								</Box>
							}
						/>
					) : null}
					{city.size &&
					city.size !== undefined &&
					city.size !== "Unknown" &&
					city.size !== "" ? (
						<Chip
							label={city.size || "Unknown"}
							size="small"
							sx={{
								backgroundColor: getSettlementColor(city.size),
								color: Theme.palette.common.white,
							}}
							icon={
								<Box
									sx={{
										color: Theme.palette.common.white,
										display: "flex",
										alignItems: "center",
									}}
								>
									<span
										style={{
											color: Theme.palette.common.white,
											marginTop: 7,
										}}
									>
										{createElement(getSizeIcon(city.size))}
									</span>
								</Box>
							}
						/>
					) : null}

					{city.features && city.features.length > 0
						? city.features.map((feature) => (
								<Chip
									key={`${feature}-${uuidv7()}`}
									label={feature || "Unknown"}
									size="small"
									sx={{
										backgroundColor: getSettlementColor(feature),
										color: Theme.palette.common.white,
									}}
									icon={
										<Box
											sx={{
												color: Theme.palette.common.white,
												display: "flex",
												alignItems: "center",
											}}
										>
											<span
												style={{
													color: Theme.palette.common.white,
													marginTop: 7,
												}}
											>
												{createElement(getFeatureIcon(feature))}
											</span>
										</Box>
									}
								/>
							))
						: null}
				</Box>

				{/* City Population */}
				{city.population && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						<strong>Population:</strong> {city.population}
					</Typography>
				)}
			</CardContent>

			<CardActions className="tile-info">
				<div className="tile-category">
					Tags:
					<br />
					{city.tags.map((tag) => (
						<Chip size="small" key={`tag-${tag._id}`} label={tag.Name} />
					))}
				</div>
				<Link to={`/view_city/${city._id}`} key={`city-${city._id}`}>
					<Button className="tile-button" color="secondary" variant="contained">
						View
					</Button>
				</Link>
			</CardActions>
		</Card>
	);
}

CityCard.propTypes = {
	city: PropTypes.shape({
		_id: PropTypes.string,
		name: PropTypes.string,
		coa: PropTypes.object,
		description: PropTypes.string,
		tags: PropTypes.array,
	}),
	theme: PropTypes.shape({
		palette: PropTypes.shape({
			mode: PropTypes.string,
			primary: PropTypes.shape({
				dark: PropTypes.string,
				light: PropTypes.string,
			}),
			text: PropTypes.shape({
				primary: PropTypes.string,
			}),
		}),
	}),
};
export default CityCard;
