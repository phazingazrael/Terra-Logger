// Default Icons

import type { SvgIconComponent } from "@mui/icons-material";
import CrownIcon from "@mui/icons-material/AccountBalance";
import UnitedRepublicIcon from "@mui/icons-material/AccountBalanceWallet";
import FederationIcon from "@mui/icons-material/AccountTree";
import SatrapyIcon from "@mui/icons-material/AdminPanelSettings";
import TetrarchyIcon from "@mui/icons-material/Apps";
// Republic icons
import CityStateIcon from "@mui/icons-material/Architecture";
import ThearchyIcon from "@mui/icons-material/AutoAwesome";
import TradeCompanyIcon from "@mui/icons-material/Business";
import GrandDuchyIcon from "@mui/icons-material/BusinessCenter";
import DuchyIcon from "@mui/icons-material/Castle";
// Theocracy icons
import BishopricIcon from "@mui/icons-material/Church";
import PrincipalityIcon from "@mui/icons-material/Diamond";
import HordeIcon from "@mui/icons-material/DirectionsRun";
import DiocesesIcon from "@mui/icons-material/Domain";
import DivineMonarchyIcon from "@mui/icons-material/EmojiEvents";
import CommunityIcon from "@mui/icons-material/FamilyRestroom";
import UnionSubIcon from "@mui/icons-material/Flag";
import CouncilIcon from "@mui/icons-material/Forum";
import AnarchyIcon from "@mui/icons-material/Gavel";
import DefaultIcon from "@mui/icons-material/Gavel";
import TriumvirateIcon from "@mui/icons-material/Group";
import UlusIcon from "@mui/icons-material/Groups";
import DominionIcon from "@mui/icons-material/Home";
import RepublicSubIcon from "@mui/icons-material/HowToVote";
import ConfederationIcon from "@mui/icons-material/Hub";
// Union icons
import CommonwealthIcon from "@mui/icons-material/Language";
import FreeCityIcon from "@mui/icons-material/LocationCity";
import KingdomIcon from "@mui/icons-material/Loyalty";
import UnitedProvincesIcon from "@mui/icons-material/Map";
import BrotherhoodIcon from "@mui/icons-material/MenuBook";
import OligarchyIcon from "@mui/icons-material/MonetizationOn";
// Monarchy icons
import CaliphateIcon from "@mui/icons-material/Mosque";
import FreeTerritoryIcon from "@mui/icons-material/Nature";
// Anarchy icons
import CommuneIcon from "@mui/icons-material/Park";
import DiarchyIcon from "@mui/icons-material/People";
import KhaganateIcon from "@mui/icons-material/Pets";
import HolyStateIcon from "@mui/icons-material/Place";
import DespotateIcon from "@mui/icons-material/Psychology";
import EmpireIcon from "@mui/icons-material/Public";
import MostSereneRepublicIcon from "@mui/icons-material/Sailing";
import ProtectorateIcon from "@mui/icons-material/Security";
import MarchesIcon from "@mui/icons-material/Shield";
import LeagueIcon from "@mui/icons-material/SportsBaseball";
import ShogunateIcon from "@mui/icons-material/SportsKabaddi";
import TsardomIcon from "@mui/icons-material/Star";
import HeptarchyIcon from "@mui/icons-material/StarBorder";
import TheocracySubIcon from "@mui/icons-material/TempleHindu";
import EmirateIcon from "@mui/icons-material/Terrain";
import SeeIcon from "@mui/icons-material/Visibility";
import { getGovernmentDefinition } from "../NPC/generator/governments/catalog";

export {
	getGovernmentDefinition,
	getGovernmentLeadershipStructure,
} from "../NPC/generator/governments/catalog";

const governmentIconComponents: Readonly<Record<string, SvgIconComponent>> = {
	AccountBalance: CrownIcon,
	AccountBalanceWallet: UnitedRepublicIcon,
	AccountTree: FederationIcon,
	AdminPanelSettings: SatrapyIcon,
	Apps: TetrarchyIcon,
	Architecture: CityStateIcon,
	AutoAwesome: ThearchyIcon,
	Business: TradeCompanyIcon,
	BusinessCenter: GrandDuchyIcon,
	Castle: DuchyIcon,
	Church: BishopricIcon,
	Diamond: PrincipalityIcon,
	DirectionsRun: HordeIcon,
	Domain: DiocesesIcon,
	EmojiEvents: DivineMonarchyIcon,
	FamilyRestroom: CommunityIcon,
	Flag: UnionSubIcon,
	Forum: CouncilIcon,
	Gavel: AnarchyIcon,
	Group: TriumvirateIcon,
	Groups: UlusIcon,
	Home: DominionIcon,
	HowToVote: RepublicSubIcon,
	Hub: ConfederationIcon,
	Language: CommonwealthIcon,
	LocationCity: FreeCityIcon,
	Loyalty: KingdomIcon,
	Map: UnitedProvincesIcon,
	MenuBook: BrotherhoodIcon,
	MonetizationOn: OligarchyIcon,
	Mosque: CaliphateIcon,
	Nature: FreeTerritoryIcon,
	Park: CommuneIcon,
	People: DiarchyIcon,
	Pets: KhaganateIcon,
	Place: HolyStateIcon,
	Psychology: DespotateIcon,
	Public: EmpireIcon,
	Sailing: MostSereneRepublicIcon,
	Security: ProtectorateIcon,
	Shield: MarchesIcon,
	SportsBaseball: LeagueIcon,
	SportsKabaddi: ShogunateIcon,
	Star: TsardomIcon,
	StarBorder: HeptarchyIcon,
	TempleHindu: TheocracySubIcon,
	Terrain: EmirateIcon,
	Visibility: SeeIcon,
};

export function getPoliticalColor(type: string | undefined): string {
	return getGovernmentDefinition(type)?.presentation.color ?? "#9e9e9e";
}

export function getPoliticalIcon(type: string | undefined): SvgIconComponent {
	const iconKey = getGovernmentDefinition(type)?.presentation.iconKey;
	return (iconKey && governmentIconComponents[iconKey]) || DefaultIcon;
}

export function getPoliticalDescriptor(type: string | undefined): string {
	return getGovernmentDefinition(type)?.descriptionHtml ?? "";
}
