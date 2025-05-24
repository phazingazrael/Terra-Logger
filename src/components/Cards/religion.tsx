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

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PetsIcon from "@mui/icons-material/Pets";
import PublicIcon from "@mui/icons-material/Public";
import GroupsIcon from "@mui/icons-material/Groups";
import ParkIcon from "@mui/icons-material/Park";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import CompareIcon from "@mui/icons-material/Compare";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import NightlightIcon from "@mui/icons-material/Nightlight";
import GroupIcon from "@mui/icons-material/Group";
import WarningIcon from "@mui/icons-material/Warning";

import PropTypes from "prop-types";
import { Link, useOutletContext } from "react-router-dom";

import type { TLReligion } from "../../definitions/TerraLogger";

import "./cards.css";
import type { Context } from "../../definitions/Common";

// Religion forms configuration

// const religionForms = [
// 	"Shamanism",
// 	"Animism",
// 	"Polytheism",
// 	"Ancestor Worship",
// 	"Nature Worship",
// 	"Totemism",
// 	"Monotheism",
// 	"Dualism",
// 	"Pantheism",
// 	"Non-theism",
// 	"Cult",
// 	"Dark Cult",
// 	"Sect",
// 	"Heresy",
// ];

// Map forms to icons and colors
const formIcons = {
	Shamanism: <AutoAwesomeIcon />,
	Animism: <PetsIcon />,
	Polytheism: <PublicIcon />,
	"Ancestor Worship": <GroupsIcon />,
	"Nature Worship": <ParkIcon />,
	Totemism: <AccountTreeIcon />,
	Monotheism: <LooksOneIcon />,
	Dualism: <CompareIcon />,
	Pantheism: <AllInclusiveIcon />,
	"Non-theism": <DoNotDisturbIcon />,
	Cult: <GroupWorkIcon />,
	"Dark Cult": <NightlightIcon />,
	Sect: <GroupIcon />,
	Heresy: <WarningIcon />,
};

const formColors = {
	Shamanism: "#8e24aa",
	Animism: "#43a047",
	Polytheism: "#1e88e5",
	"Ancestor Worship": "#fb8c00",
	"Nature Worship": "#558b2f",
	Totemism: "#6d4c41",
	Monotheism: "#3949ab",
	Dualism: "#7cb342",
	Pantheism: "#00acc1",
	"Non-theism": "#757575",
	Cult: "#d81b60",
	"Dark Cult": "#37474f",
	Sect: "#5d4037",
	Heresy: "#c62828",
};

function ReligionCard(props: Readonly<TLReligion>) {
	const religion = props;

	const { Theme }: Context = useOutletContext();

	// Get color based on religion type
	const getTypeColor = (type: string) => {
		switch (type) {
			case "Folk":
				return "#4caf50";
			case "Organized":
				return "#2196f3";
			case "Heresy":
				return "#f44336";
			default:
				return "#9e9e9e";
		}
	};

	const formColor =
		formColors[religion.form as keyof typeof formColors] || "#9e9e9e";
	const formIcon = formIcons[religion.form as keyof typeof formIcons] || (
		<PublicIcon />
	);

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
					bgcolor: formColor,
					position: "absolute",
					top: -15,
					right: 16,
					boxShadow: 2,
				}}
			>
				{formIcon}
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
								bgcolor: formColor,
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
									{formIcon}
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
					Tags:
					<br />
					{religion.tags.map((tag) => (
						<Chip size="small" key={tag.Name} label={tag.Name} />
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
