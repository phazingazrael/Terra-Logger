import {
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Typography,
} from "@mui/material";

import PropTypes from "prop-types";
import Ellipsis from "../Util/ellipsis";
import { Link } from "react-router-dom";

import type { TLReligion } from "../../definitions/TerraLogger";

import "./cards.css";

function ReligionCard(props: Readonly<TLReligion>) {
	const religion = props;

	return (
		<Card>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{religion.name}
				</Typography>
				<Ellipsis>{religion.description}</Ellipsis>
				<Typography variant="body2">
					Believers:{" "}
					{Math.round(
						religion.members.rural + religion.members.urban,
					).toLocaleString("en-US")}
				</Typography>
			</CardContent>
			<CardActions className="tile-info">
				<div className="tile-category">
					Tags:
					<br />
					{religion.tags.map((tag) => (
						<Chip size="small" key={religion._id} label={tag.Name} />
					))}
				</div>
				<Link to={`/view_religion/${religion._id}`}>
					<Button className="tile-button" color="secondary" variant="contained">
						View
					</Button>
				</Link>
			</CardActions>
		</Card>
	);
}

ReligionCard.propTypes = {
	religion: PropTypes.shape({
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
export default ReligionCard;
