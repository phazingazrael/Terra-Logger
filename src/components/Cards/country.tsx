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
import { Link, useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";

import { rgbToRgba } from "../Util";
import { getPoliticalColor, getPoliticalIcon } from "../Util/countryUtils";

import type { Context } from "../../definitions/Common";
import type { TLCountry } from "../../definitions/TerraLogger";

import "./cards.css";

function CountryCard(props: Readonly<TLCountry>) {
	const country = props;

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
			{/* Country CoA */}
			<Avatar
				sx={{
					bgcolor: rgbToRgba(country.color, 0.5),
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
					dangerouslySetInnerHTML={{ __html: country.coaSVG }}
				/>
			</Avatar>

			{/* Country Details */}
			<CardContent sx={{ flexGrow: 1, pt: 3 }}>
				{/* Country Name */}
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						mb: 2,
					}}
				>
					<Typography variant="h6" component="h2">
						{country.name}
					</Typography>
				</Box>

				{/* Country Form Chips */}
				<Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
					{country.political &&
					country.political.form !== "" &&
					country.political.form !== undefined ? (
						<Chip
							label={country.political.form}
							size="small"
							sx={{
								bgcolor: getPoliticalColor(country.political.form),
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
										{createElement(getPoliticalIcon(country.political.form))}
									</span>
								</Box>
							}
						/>
					) : null}

					{country.political &&
					country.political.formName !== "" &&
					country.political.formName !== undefined ? (
						<Chip
							label={country.political.formName || "Unknown"}
							size="small"
							sx={{
								bgcolor: getPoliticalColor(country.political.formName),
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
										{createElement(
											getPoliticalIcon(country.political.formName),
										)}
									</span>
								</Box>
							}
						/>
					) : null}
				</Box>

				{/* Country Population */}
				{country.population && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						<strong>Population:</strong> {country.population.total}
					</Typography>
				)}
			</CardContent>

			{/* Country Actions */}
			<CardActions className="tile-info">
				{/* Country Tags */}
				<div className="tile-category">
					{country.tags && country.tags.length > 0 && (
						<>
							Tags:
							<br />
							{country.tags.map((tag) => (
								<Chip
									size="small"
									key={`${tag.Name}-${uuidv7()}`}
									label={tag.Name}
								/>
							))}
						</>
					)}
				</div>

				{/* Country Link */}
				<Link to={`/view_country/${country._id}`}>
					<Button className="tile-button" color="secondary" variant="contained">
						View
					</Button>
				</Link>
			</CardActions>
		</Card>
	);
}

CountryCard.propTypes = {
	country: PropTypes.shape({
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
export default CountryCard;
