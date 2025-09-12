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
import { Link, useOutletContext } from "react-router-dom";

import type { TLCulture } from "../../definitions/TerraLogger";
import type { Context } from "../../definitions/Common";

import "./cards.css";

function CultureCard(props: Readonly<TLCulture>) {
	const culture = props;

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
					bgcolor: culture.color,
					position: "absolute",
					top: -15,
					right: 16,
					boxShadow: 2,
				}}
			>
				{culture.code}
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
						{culture.name}
					</Typography>
				</Box>

				<Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
					{culture.type && culture.type !== "" && culture.type !== undefined ? (
						<Chip
							label={culture.type}
							size="small"
							sx={{
								color: Theme.palette.common.white,
							}}
						/>
					) : null}
				</Box>
			</CardContent>

			<CardActions className="tile-info">
				<Link to={`/view_culture/${culture._id}`}>
					<Button className="tile-button" color="secondary" variant="contained">
						View
					</Button>
				</Link>
			</CardActions>
		</Card>
	);
}

export default CultureCard;
