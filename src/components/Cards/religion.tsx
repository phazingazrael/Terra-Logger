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

import { getFormColor, getFormIcon, getTypeColor } from "../Util/religionUtils";

import type { TLReligion } from "../../definitions/TerraLogger";
import type { Context } from "../../definitions/Common";

import "./cards.css";

function ReligionCard(props: Readonly<TLReligion>) {
	const religion = props;

	const { Theme }: Context = useOutletContext();

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
			<Avatar
				sx={{
					bgcolor: getFormColor(religion.form),
					position: "absolute",
					top: -15,
					right: 16,
					boxShadow: 2,
				}}
			>
				{getFormIcon(religion.form)}
			</Avatar>

			<CardContent sx={{ flexGrow: 1, pt: 3 }}>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "flex-start",
						mb: 2,
					}}
				>
					<Typography variant="h6" component="h2">
						{religion.name}
					</Typography>
					{religion.code &&
					religion.code !== "" &&
					religion.code !== undefined ? (
						<Chip
							label={religion.code}
							size="small"
							sx={{ bgcolor: Theme.palette.grey[200] }}
						/>
					) : null}
				</Box>

				<Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
					{religion.type &&
					religion.type !== "" &&
					religion.type !== undefined ? (
						<Chip
							label={religion.type}
							size="small"
							sx={{
								bgcolor: getTypeColor(religion.type),
								color: Theme.palette.common.white,
							}}
						/>
					) : null}

					{religion.form &&
					religion.form !== "" &&
					religion.form !== undefined ? (
						<Chip
							label={religion.form || "Unknown"}
							size="small"
							sx={{
								bgcolor: getFormColor(religion.form),
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
										{getFormIcon(religion.form)}
									</span>
								</Box>
							}
						/>
					) : null}
				</Box>

				{religion.deity && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						<strong>Deity:</strong> {religion.deity}
					</Typography>
				)}

				{religion.origins && religion.origins.length > 0 && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						<strong>Origins:</strong>{" "}
						{religion.origins.map((origin) => (
							<span key={origin}>{origin} </span>
						))}
					</Typography>
				)}

				{religion.members && (
					<Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
						<strong>Believers:</strong>{" "}
						{(religion.members.rural + religion.members.urban).toLocaleString(
							"en-US",
						)}
					</Typography>
				)}
			</CardContent>

			<CardActions className="tile-info">
				<div className="tile-category">
					{religion.tags && religion.tags.length > 0 && (
						<>
							Tags:
							<br />
							{religion.tags.map((tag) => (
								<Chip
									size="small"
									key={`${tag.Name}-${uuidv7()}`}
									label={tag.Name}
								/>
							))}
						</>
					)}
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
