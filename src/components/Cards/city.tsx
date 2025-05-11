import type { Theme } from "@mui/material";
import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Chip,
	Typography,
} from "@mui/material";
import PropTypes from "prop-types";
import Ellipsis from "../Util/ellipsis";
import { Link, useOutletContext } from "react-router-dom";

import { rgbToRgba } from "../Util";

import type { Context } from "../../definitions/Common";

import "./cards.css";

function CityCard(props: Readonly<TLCity>) {
	const city = props;
	const { Theme }: Context = useOutletContext();

	let themeColor = null;

	if (Theme.palette.mode === "dark") {
		themeColor = Theme.palette.primary.dark;
	} else if (Theme.palette.mode === "light") {
		themeColor = Theme.palette.primary.light;
	}

	const ImageAlt = "";
	return (
		<Card>
			<CardMedia
				sx={{
					backgroundColor: Theme
						? rgbToRgba(themeColor as string, 0.5 as number)
						: "",
				}}
				title={ImageAlt}
			>
				<div
					className="svg-container CoA"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: SVG is safe, Generated locally from data
					dangerouslySetInnerHTML={{ __html: city.coaSVG }}
				/>
			</CardMedia>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{city.name}
				</Typography>
				{city.description !== "" && <Ellipsis>{city.description}</Ellipsis>}
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
