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

// Map forms to icons and colors
const formIcons = {
	Shamanism: AutoAwesomeIcon,
	Animism: PetsIcon,
	Polytheism: PublicIcon,
	"Ancestor Worship": GroupsIcon,
	"Nature Worship": ParkIcon,
	Totemism: AccountTreeIcon,
	Monotheism: LooksOneIcon,
	Dualism: CompareIcon,
	Pantheism: AllInclusiveIcon,
	"Non-theism": DoNotDisturbIcon,
	Cult: GroupWorkIcon,
	"Dark Cult": NightlightIcon,
	Sect: GroupIcon,
	Heresy: WarningIcon,
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

export function getFormIcon(form: string) {
	return formIcons[form as keyof typeof formIcons] || PublicIcon;
}
