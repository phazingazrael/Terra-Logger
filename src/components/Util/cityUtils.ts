// Feature icons
import CitadelIcon from "@mui/icons-material/Security";
import PlazaIcon from "@mui/icons-material/Park";
import PortIcon from "@mui/icons-material/Anchor";
import ShantyTownIcon from "@mui/icons-material/Home";
import TempleIcon from "@mui/icons-material/TempleHindu";
import WallsIcon from "@mui/icons-material/Fence";
// Size icons
import HamletIcon from "@mui/icons-material/House";
import LargeCityIcon from "@mui/icons-material/Domain";
import LargeTownIcon from "@mui/icons-material/Business";
import MetropolisIcon from "@mui/icons-material/CorporateFare";
import SmallCityIcon from "@mui/icons-material/AccountBalance";
import SmallTownIcon from "@mui/icons-material/LocationCity";
import ThorpIcon from "@mui/icons-material/Cottage";
import VillageIcon from "@mui/icons-material/HomeWork";

// Feature colors
const featureColors = {
	Citadel: "#8e24aa",
	Plaza: "#43a047",
	Port: "#1e88e5",
	"Shanty Town": "#795548",
	"Shanty Towns": "#795548", // Alternative plural form
	Temple: "#fb8c00",
	Walls: "#607d8b",
};

// Size colors (gradient from small to large)
const sizeColors = {
	Thorp: "#e8f5e8",
	Hamlet: "#c8e6c9",
	Village: "#a5d6a7",
	"Small Town": "#81c784",
	"Large Town": "#66bb6a",
	"Small City": "#4caf50",
	"Large City": "#43a047",
	Metropolis: "#388e3c",
};

// Feature icons mapping
const featureIcons = {
	Citadel: CitadelIcon,
	Plaza: PlazaIcon,
	Port: PortIcon,
	"Shanty Town": ShantyTownIcon,
	"Shanty Towns": ShantyTownIcon, // Alternative plural form
	Temple: TempleIcon,
	Walls: WallsIcon,
};

// Size icons mapping
const sizeIcons = {
	Thorp: ThorpIcon,
	Hamlet: HamletIcon,
	Village: VillageIcon,
	"Small Town": SmallTownIcon,
	"Large Town": LargeTownIcon,
	"Small City": SmallCityIcon,
	"Large City": LargeCityIcon,
	Metropolis: MetropolisIcon,
};

// Combined colors
const settlementColors = {
	...featureColors,
	...sizeColors,
};

// Combined icons
const settlementIcons = {
	...featureIcons,
	...sizeIcons,
};

export function getSettlementColor(type: string | undefined) {
	return settlementColors[type as keyof typeof settlementColors] || "#9e9e9e";
}

export function getSettlementIcon(type: string | undefined) {
	return settlementIcons[type as keyof typeof settlementIcons] || SmallTownIcon;
}

export function getFeatureIcon(feature: string | undefined) {
	return featureIcons[feature as keyof typeof featureIcons] || CitadelIcon;
}

export function getSizeIcon(size: string | undefined) {
	return sizeIcons[size as keyof typeof sizeIcons] || SmallTownIcon;
}
