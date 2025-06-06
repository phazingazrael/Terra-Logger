import {
	// Feature icons
	Security as CitadelIcon,
	Park as PlazaIcon,
	Anchor as PortIcon,
	Home as ShantyTownIcon,
	TempleHindu as TempleIcon,
	Fence as WallsIcon,
	// Size icons
	Cottage as ThorpIcon,
	House as HamletIcon,
	HomeWork as VillageIcon,
	LocationCity as SmallTownIcon,
	Business as LargeTownIcon,
	AccountBalance as SmallCityIcon,
	Domain as LargeCityIcon,
	CorporateFare as MetropolisIcon,
	LocationCity as LocationCityIcon, // Added import for LocationCity
	Security as SecurityIcon, // Added import for Security
} from "@mui/icons-material";

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
	return (
		settlementIcons[type as keyof typeof settlementIcons] || LocationCityIcon
	);
}

export function getFeatureIcon(feature: string | undefined) {
	return featureIcons[feature as keyof typeof featureIcons] || SecurityIcon;
}

export function getSizeIcon(size: string | undefined) {
	return sizeIcons[size as keyof typeof sizeIcons] || LocationCityIcon;
}
