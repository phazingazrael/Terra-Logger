import {
	Gavel as DefaultIcon,
	AccountBalance as CrownIcon,
	AccountBalance as RepublicIcon,
	Church as TheocracyIcon,
	Handshake as UnionIcon,
	Gavel as AnarchyIcon,
	// Monarchy icons
	Castle as DuchyIcon,
	BusinessCenter as GrandDuchyIcon,
	Diamond as PrincipalityIcon,
	Loyalty as KingdomIcon,
	Public as EmpireIcon,
	Shield as MarchesIcon,
	Home as DominionIcon,
	Security as ProtectorateIcon,
	Pets as KhaganateIcon,
	Star as TsardomIcon,
	SportsKabaddi as ShogunateIcon,
	Mosque as CaliphateIcon,
	Terrain as EmirateIcon,
	Psychology as DespotateIcon,
	Groups as UlusIcon,
	DirectionsRun as HordeIcon,
	AdminPanelSettings as SatrapyIcon,
	// Republic icons
	HowToVote as RepublicSubIcon,
	AccountTree as FederationIcon,
	Business as TradeCompanyIcon,
	Sailing as MostSereneRepublicIcon,
	MonetizationOn as OligarchyIcon,
	Apps as TetrarchyIcon,
	Group as TriumvirateIcon,
	People as DiarchyIcon,
	Shield as JuntaIcon,
	LocationCity as FreeCityIcon,
	Architecture as CityStateIcon,
	// Theocracy icons
	TempleHindu as TheocracySubIcon,
	MenuBook as BrotherhoodIcon,
	AutoAwesome as ThearchyIcon,
	Visibility as SeeIcon,
	Place as HolyStateIcon,
	EmojiEvents as DivineMonarchyIcon,
	Domain as DiocesesIcon,
	Church as BishopricIcon,
	// Union icons
	Flag as UnionSubIcon,
	SportsBaseball as LeagueIcon,
	Hub as ConfederationIcon,
	Language as UnitedKingdomIcon,
	AccountBalanceWallet as UnitedRepublicIcon,
	Map as UnitedProvincesIcon,
	Language as CommonwealthIcon,
	StarBorder as HeptarchyIcon,
	// Anarchy icons
	Nature as FreeTerritoryIcon,
	Forum as CouncilIcon,
	Park as CommuneIcon,
	FamilyRestroom as CommunityIcon,
} from "@mui/icons-material";

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
