import {
	AutoAwesome as AutoAwesomeIcon,
	Pets as PetsIcon,
	Public as PublicIcon,
	Groups as GroupsIcon,
	Park as ParkIcon,
	AccountTree as AccountTreeIcon,
	LooksOne as LooksOneIcon,
	Compare as CompareIcon,
	AllInclusive as AllInclusiveIcon,
	DoNotDisturb as DoNotDisturbIcon,
	GroupWork as GroupWorkIcon,
	Nightlight as NightlightIcon,
	Group as GroupIcon,
	Warning as WarningIcon,
} from "@mui/icons-material";

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

export function getFormColor(form: string | undefined) {
	return formColors[form as keyof typeof formColors] || "#9e9e9e";
}

export const getTypeColor = (type: string | undefined) => {
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

export function getFormIcon(form: string) {
	return formIcons[form as keyof typeof formIcons] || <PublicIcon />;
}
