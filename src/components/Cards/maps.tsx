import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardMedia,
	Typography,
} from "@mui/material";
import { useOutletContext } from "react-router-dom";

import { rgbToRgba } from "../Util";

import "./cards.css";

const MapsCard: React.FC<MapsCardProps> = ({ handleMapSelect, id, info }) => {
	// biome-ignore lint/suspicious/noExplicitAny: Theme data is not typed correctly here yet, will be fixed later
	const theme: any = useOutletContext();

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
				<input type="checkbox" onChange={() => handleMapSelect(id)} />
			</CardMedia>
			<CardContent>
				<Typography gutterBottom variant="h5" component="div">
					{info.name}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Seed: {info.seed}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Map Version: {info.ver}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Width: {info.width} x Height: {info.height}
				</Typography>
			</CardContent>
			<CardActions className="tile-info">
				<Button className="tile-button" color="secondary" variant="contained">
					View
				</Button>
			</CardActions>
		</Card>
	);
};
type MapsCardProps = {
	handleMapSelect: (mapId: string) => void;
	id: string;
	info: {
		name: string;
		seed: string;
		width: number;
		height: number;
		ID: string;
		ver: string;
		// ... other properties ...
	};
	mapId: string;
	settings: {
		mapName: string;
		distanceUnit: string;
		// ... other properties ...
	};
	SVG: string;
	svgMod: string;
};
export default MapsCard;
