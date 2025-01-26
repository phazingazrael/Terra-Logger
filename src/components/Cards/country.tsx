import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	Typography,
} from "@mui/material";
import type { Theme } from "@mui/material";
import PropTypes from "prop-types";
import Ellipsis from "../Util/ellipsis";
import { Link, useOutletContext } from "react-router-dom";

import { LazyLoadedSVG, rgbToRgba } from "../Util";

import "./cards.css";

function CountryCard(props: Readonly<TLCountry>) {
	const country = props;
	const theme: Theme = useOutletContext();

	let themeColor = null;

	if (theme.palette.mode === "dark") {
		themeColor = theme.palette.primary.dark;
	} else if (theme.palette.mode === "light") {
		themeColor = theme.palette.primary.light;
	}

	const ImageAlt = "";
	return (
		<Card>
			<CardMedia
				sx={{
					backgroundColor: theme
						? rgbToRgba(themeColor as string, 0.5 as number)
						: "",
				}}
				title={ImageAlt}
			>
				<LazyLoadedSVG {...(country.coa as TLCoA)} />
			</CardMedia>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{country.name}
				</Typography>
				<Ellipsis>{country.description}</Ellipsis>
			</CardContent>
			<CardActions className="tile-info">
				<div className="tile-category">
					Tags:
					<br />
					{country.tags.map((tag) => (
						<Chip size="small" key={country._id} label={tag.Name} />
					))}
				</div>
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
