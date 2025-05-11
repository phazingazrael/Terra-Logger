import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { useOutletContext } from "react-router-dom";

import { rgbToRgba } from "../Util";

import "./cards.css";
import type { Context } from "../../definitions/Common";

const MapsCard: React.FC<MapsCardProps> = ({ handleMapSelect, id, info }) => {
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
