// Default Icons
import AnarchyIcon from "@mui/icons-material/Gavel";
import CrownIcon from "@mui/icons-material/AccountBalance";
import DefaultIcon from "@mui/icons-material/Gavel";
import RepublicIcon from "@mui/icons-material/AccountBalance";
import TheocracyIcon from "@mui/icons-material/Church";
import UnionIcon from "@mui/icons-material/Handshake";
// Monarchy icons
import CaliphateIcon from "@mui/icons-material/Mosque";
import DespotateIcon from "@mui/icons-material/Psychology";
import DominionIcon from "@mui/icons-material/Home";
import DuchyIcon from "@mui/icons-material/Castle";
import EmirateIcon from "@mui/icons-material/Terrain";
import EmpireIcon from "@mui/icons-material/Public";
import GrandDuchyIcon from "@mui/icons-material/BusinessCenter";
import HordeIcon from "@mui/icons-material/DirectionsRun";
import KhaganateIcon from "@mui/icons-material/Pets";
import KingdomIcon from "@mui/icons-material/Loyalty";
import MarchesIcon from "@mui/icons-material/Shield";
import PrincipalityIcon from "@mui/icons-material/Diamond";
import ProtectorateIcon from "@mui/icons-material/Security";
import SatrapyIcon from "@mui/icons-material/AdminPanelSettings";
import ShogunateIcon from "@mui/icons-material/SportsKabaddi";
import TsardomIcon from "@mui/icons-material/Star";
import UlusIcon from "@mui/icons-material/Groups";
// Republic icons
import CityStateIcon from "@mui/icons-material/Architecture";
import DiarchyIcon from "@mui/icons-material/People";
import FederationIcon from "@mui/icons-material/AccountTree";
import FreeCityIcon from "@mui/icons-material/LocationCity";
import JuntaIcon from "@mui/icons-material/Shield";
import MostSereneRepublicIcon from "@mui/icons-material/Sailing";
import OligarchyIcon from "@mui/icons-material/MonetizationOn";
import RepublicSubIcon from "@mui/icons-material/HowToVote";
import TetrarchyIcon from "@mui/icons-material/Apps";
import TradeCompanyIcon from "@mui/icons-material/Business";
import TriumvirateIcon from "@mui/icons-material/Group";
// Theocracy icons
import BishopricIcon from "@mui/icons-material/Church";
import BrotherhoodIcon from "@mui/icons-material/MenuBook";
import DiocesesIcon from "@mui/icons-material/Domain";
import DivineMonarchyIcon from "@mui/icons-material/EmojiEvents";
import HolyStateIcon from "@mui/icons-material/Place";
import SeeIcon from "@mui/icons-material/Visibility";
import ThearchyIcon from "@mui/icons-material/AutoAwesome";
import TheocracySubIcon from "@mui/icons-material/TempleHindu";
// Union icons
import CommonwealthIcon from "@mui/icons-material/Language";
import UnionSubIcon from "@mui/icons-material/Flag";
import HeptarchyIcon from "@mui/icons-material/StarBorder";
import ConfederationIcon from "@mui/icons-material/Hub";
import LeagueIcon from "@mui/icons-material/SportsBaseball";
import UnitedKingdomIcon from "@mui/icons-material/Language";
import UnitedProvincesIcon from "@mui/icons-material/Map";
import UnitedRepublicIcon from "@mui/icons-material/AccountBalanceWallet";
// Anarchy icons
import CommuneIcon from "@mui/icons-material/Park";
import CommunityIcon from "@mui/icons-material/FamilyRestroom";
import CouncilIcon from "@mui/icons-material/Forum";
import FreeTerritoryIcon from "@mui/icons-material/Nature";

// Combined colors object
const politicalColors = {
	Monarchy: "#8e24aa",
	Republic: "#1e88e5",
	Theocracy: "#fb8c00",
	Union: "#43a047",
	Anarchy: "#f44336",
	Duchy: "#9c27b0",
	"Grand Duchy": "#ab47bc",
	Principality: "#ba68c8",
	Kingdom: "#ce93d8",
	Empire: "#e1bee7",
	Marches: "#8e24aa",
	Dominion: "#7b1fa2",
	Protectorate: "#6a1b9a",
	Khaganate: "#4a148c",
	Tsardom: "#9c27b0",
	Shogunate: "#8e24aa",
	Caliphate: "#7b1fa2",
	Emirate: "#6a1b9a",
	Despotate: "#4a148c",
	Ulus: "#9c27b0",
	Horde: "#8e24aa",
	Satrapy: "#7b1fa2",
	Federation: "#1e88e5",
	"Trade Company": "#2196f3",
	"Most Serene Republic": "#42a5f5",
	Oligarchy: "#64b5f6",
	Tetrarchy: "#90caf9",
	Triumvirate: "#bbdefb",
	Diarchy: "#1565c0",
	Junta: "#0d47a1",
	"Free City": "#1976d2",
	"City-state": "#1e88e5",
	Brotherhood: "#fb8c00",
	Thearchy: "#ff9800",
	See: "#ffa726",
	"Holy State": "#ffb74d",
	"Divine Monarchy": "#ffcc02",
	Diocese: "#ffd54f",
	Bishopric: "#ef6c00",
	League: "#43a047",
	Confederation: "#4caf50",
	"United Kingdom": "#66bb6a",
	"United Republic": "#81c784",
	"United Provinces": "#a5d6a7",
	Commonwealth: "#c8e6c9",
	Heptarchy: "#2e7d32",
	"Free Territory": "#d32f2f",
	Council: "#f44336",
	Commune: "#f57c00",
	Community: "#ff5722",
};

// Category icons
const categoryIcons = {
	Monarchy: CrownIcon,
	Republic: RepublicIcon,
	Theocracy: TheocracyIcon,
	Union: UnionIcon,
	Anarchy: AnarchyIcon,
};

// Sub-category icons
const politicalIcons = {
	// Monarchy
	Duchy: DuchyIcon,
	"Grand Duchy": GrandDuchyIcon,
	Principality: PrincipalityIcon,
	Kingdom: KingdomIcon,
	Empire: EmpireIcon,
	Marches: MarchesIcon,
	Dominion: DominionIcon,
	Protectorate: ProtectorateIcon,
	Khaganate: KhaganateIcon,
	Tsardom: TsardomIcon,
	Shogunate: ShogunateIcon,
	Caliphate: CaliphateIcon,
	Emirate: EmirateIcon,
	Despotate: DespotateIcon,
	Ulus: UlusIcon,
	Horde: HordeIcon,
	Satrapy: SatrapyIcon,

	// Republic
	Republic: RepublicSubIcon,
	Federation: FederationIcon,
	"Trade Company": TradeCompanyIcon,
	"Most Serene Republic": MostSereneRepublicIcon,
	Oligarchy: OligarchyIcon,
	Tetrarchy: TetrarchyIcon,
	Triumvirate: TriumvirateIcon,
	Diarchy: DiarchyIcon,
	Junta: JuntaIcon,
	"Free City": FreeCityIcon,
	"City-state": CityStateIcon,

	// Theocracy
	Theocracy: TheocracySubIcon,
	Brotherhood: BrotherhoodIcon,
	Thearchy: ThearchyIcon,
	See: SeeIcon,
	"Holy State": HolyStateIcon,
	"Divine Monarchy": DivineMonarchyIcon,
	Diocese: DiocesesIcon,
	Bishopric: BishopricIcon,

	// Union
	Union: UnionSubIcon,
	League: LeagueIcon,
	Confederation: ConfederationIcon,
	"United Kingdom": UnitedKingdomIcon,
	"United Republic": UnitedRepublicIcon,
	"United Provinces": UnitedProvincesIcon,
	Commonwealth: CommonwealthIcon,
	Heptarchy: HeptarchyIcon,

	// Anarchy
	"Free Territory": FreeTerritoryIcon,
	Council: CouncilIcon,
	Commune: CommuneIcon,
	Community: CommunityIcon,
};

export function getPoliticalColor(type: string | undefined) {
	return politicalColors[type as keyof typeof politicalColors] || "#9e9e9e";
}

export function getPoliticalIcon(type: string | undefined) {
	return (
		politicalIcons[type as keyof typeof politicalIcons] ||
		categoryIcons[type as keyof typeof categoryIcons] ||
		DefaultIcon
	);
}
