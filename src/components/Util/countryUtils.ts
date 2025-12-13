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

// Political Descriptors
const politicalDescriptors = {
  Monarchy: "<p>Led by a hereditary sovereign (Monarch—King/Queen, Emperor/Empress, Prince/Princess, etc.), where authority flows through bloodlines, noble houses, and court tradition.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Royal Chancellor</strong> — law &amp; statecraft</li>\n  <li><strong>Lord/Lady Steward</strong> — lands &amp; logistics</li>\n  <li><strong>Master of Coin / Treasurer</strong> — revenue &amp; budgets</li>\n  <li><strong>Marshal / Master-at-Arms</strong> — military command</li>\n  <li><strong>Spymaster</strong> — internal/external intelligence</li>\n  <li><strong>Court Wizard</strong> or <strong>High Priest/Priestess</strong> — arcane/divine legitimacy</li>\n</ul>",
  Republic: "<p>Led by a <strong>President</strong>, where authority is derived from civic mandate, codified law, and representative institutions (structures vary by charter).</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Senators</strong> — legislation</li>\n  <li><strong>Chief Justice</strong> — constitutional review</li>\n  <li><strong>Public Defender</strong> — civil protections</li>\n  <li><strong>Mayors</strong> — local administration</li>\n  <li><strong>Diplomats</strong> — treaties and foreign relations</li>\n</ul>",
  Theocracy: "<p>Led by a <strong>High Priest or High Priestess</strong>, where authority is derived from sacred mandate, temple law, and doctrinal unity.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Council of Elders</strong> — interpretation and governance</li>\n  <li><strong>Temple Guardians</strong> — security and enforcement</li>\n  <li><strong>Divine Healers</strong> — public welfare and miracles</li>\n  <li><strong>Missionaries</strong> — expansion and conversion</li>\n  <li><strong>Religious Scholars</strong> — doctrine, records, and education</li>\n</ul>",
  Union: "<p>Led by a <strong>Union President</strong>, where authority is coordinated through shared charters, joint institutions, and collective security agreements.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Assembly Delegates</strong> — representation and voting blocs</li>\n  <li><strong>Unity Ambassadors</strong> — inter-member diplomacy</li>\n  <li><strong>Border Wardens</strong> — perimeter security</li>\n  <li><strong>Union Treasurers</strong> — budgets and shared funds</li>\n  <li><strong>Community Organizers</strong> — public programs and cohesion</li>\n</ul>",
  Anarchy: "<p>Lacking a centralized state or formal ruler, communities govern through voluntary association, consensus councils, customary rules, and mutual aid networks.</p>\n<p><strong>Guiding roles:</strong></p>\n<ul>\n  <li><strong>Facilitators</strong> — meeting leadership and consensus process</li>\n  <li><strong>Mediators</strong> — dispute resolution</li>\n  <li><strong>Quartermasters / Resource Stewards</strong> — supplies and distribution</li>\n  <li><strong>Work Coordinators</strong> — projects and labor</li>\n  <li><strong>Self-Defense Coordinators</strong> — community safety</li>\n  <li><strong>Envoys / Liaisons</strong> — external agreements and diplomacy</li>\n</ul>",
  Duchy: "<p>Led by a <strong>Duke or Duchess</strong>, where authority is exercised through ducal law, land grants, and sworn vassals.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Royal Steward</strong> — estates &amp; logistics</li>\n  <li><strong>Master-at-Arms</strong> — military readiness</li>\n  <li><strong>Knight-Captain</strong> — household guard &amp; chivalric orders</li>\n  <li><strong>Court Wizard</strong> — arcane counsel</li>\n  <li><strong>Royal Huntsman</strong> — patrols, game rights, and wilderness management</li>\n</ul>",
  "Grand Duchy": "<p>Led by a <strong>Grand Duke or Grand Duchess</strong>, where authority spans multiple provinces and relies on layered bureaucracy and regional oversight.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>High Steward</strong> — provincial administration</li>\n  <li><strong>Master-at-Arms / High Marshal</strong> — standing forces</li>\n  <li><strong>Court Wizard</strong> — strategic arcana</li>\n  <li><strong>Chief Justiciar</strong> — law &amp; appeals</li>\n  <li><strong>Master of Coin / Treasurer</strong> — taxation, trade, and state projects</li>\n</ul>",
  Principality: "<p>Led by a <strong>Prince or Princess</strong>, where authority is maintained through dynastic legitimacy, court diplomacy, and carefully managed succession.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Chancellor</strong> — governance &amp; treaties</li>\n  <li><strong>Spymaster</strong> — intelligence &amp; counterplots</li>\n  <li><strong>High Priest/Priestess</strong> — religious legitimacy</li>\n  <li><strong>Royal Architect</strong> — fortifications &amp; civic works</li>\n  <li><strong>Master Merchant</strong> — trade, tariffs, and guild relations</li>\n</ul>",
  Kingdom: "<p>Led by a <strong>King or Queen</strong>, where authority is enforced through royal law, noble compacts, and nationwide institutions.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Lord/Lady Chamberlain</strong> — court operations</li>\n  <li><strong>Royal Admiral</strong> — navy &amp; maritime power</li>\n  <li><strong>Royal Sage</strong> — scholarship &amp; statecraft</li>\n  <li><strong>Royal Historian</strong> — records, precedent, and propaganda</li>\n  <li><strong>Royal Executioner</strong> — punishment, deterrence, and &quot;the crown&#39;s final word&quot;</li>\n</ul>",
  Empire: "<p>Led by an <strong>Emperor or Empress</strong>, where authority is projected across diverse realms through governors, tribute systems, and imperial decree.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Imperial Chancellor</strong> — civil governance</li>\n  <li><strong>Imperial Grand Vizier</strong> — policy coordination &amp; court management</li>\n  <li><strong>Imperial Warlord</strong> — campaign strategy</li>\n  <li><strong>Imperial Spymaster</strong> — internal security &amp; foreign intelligence</li>\n  <li><strong>Imperial High Priest/Priestess</strong> — spiritual mandate and unity</li>\n</ul>",
  Marches: "<p>Led by a <strong>Marquis or Marchioness</strong>, where authority is shaped by frontier law, rapid mobilization, and constant border pressure.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Border Wardens</strong> — patrols &amp; fortifications</li>\n  <li><strong>Military Commanders</strong> — garrisons &amp; levies</li>\n  <li><strong>Intelligence Officers</strong> — raids, scouts, and rival-watch</li>\n  <li><strong>Infrastructure Overseers</strong> — roads, watchtowers, and supply lines</li>\n</ul>",
  Dominion: "<p>Led by a <strong>Lord or Lady</strong>, where authority rests on charters, oaths of fealty, and tightly managed estates.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Stewards</strong> — holdings &amp; logistics</li>\n  <li><strong>Justiciars</strong> — courts &amp; enforcement</li>\n  <li><strong>Chamberlains</strong> — household administration &amp; protocol</li>\n  <li><strong>Master Builders</strong> — public works, fortifications, and expansion</li>\n</ul>",
  Protectorate: "<p>Led by a <strong>Protector</strong>, where authority is justified as &quot;stability in transition&quot; and often reinforced through oversight mandates or military backing.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Governors</strong> — regional administration</li>\n  <li><strong>Diplomats</strong> — treaties &amp; external relations</li>\n  <li><strong>Spies</strong> — counterinsurgency &amp; intelligence</li>\n  <li><strong>Cultural Liaisons</strong> — local legitimacy, customs, and public morale</li>\n</ul>",
  Khaganate: "<p>Led by a <strong>Khagan or Khagana</strong>, where authority is maintained through clan allegiance, prestige, and control of steppe routes and tribute.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Khanates</strong> — sub-rulers of major tribes</li>\n  <li><strong>Tarkhans</strong> — noble war-leaders and administrators</li>\n  <li><strong>Shamans</strong> — spiritual authority &amp; omens</li>\n  <li><strong>Horse Lords</strong> — logistics, remounts, and rapid-warfare doctrine</li>\n</ul>",
  Tsardom: "<p>Led by a <strong>Tsar or Tsaritsa</strong>, where authority flows from divine-right tradition, imperial court hierarchy, and centralized decree.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Boyars</strong> — high nobles &amp; provincial power</li>\n  <li><strong>Princes</strong> — dynastic governors</li>\n  <li><strong>Archbishops</strong> — religious legitimacy</li>\n  <li><strong>Grand Dukes</strong> — regional command and administration</li>\n</ul>",
  Shogunate: "<p>Led by a <strong>Shogun</strong>, where authority is enforced through military law, sworn fealty, and a disciplined warrior class overshadowing civilian rule.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Daimyos</strong> — regional lords &amp; levies</li>\n  <li><strong>Samurai Captains</strong> — elite forces and code enforcement</li>\n  <li><strong>Ninja</strong> — espionage, sabotage, and covert policing</li>\n  <li><strong>Zen Masters</strong> — counsel, legitimacy, and courtly restraint</li>\n</ul>",
  Caliphate: "<p>Led by a <strong>Caliph</strong>, where authority is grounded in religious mandate, legal scholarship, and stewardship of the faithful.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Viziers</strong> — state administration</li>\n  <li><strong>Imams</strong> — religious leadership</li>\n  <li><strong>Qadis</strong> — judges and religious law</li>\n  <li><strong>Grand Mufti</strong> — highest legal opinions and doctrine</li>\n</ul>",
  Emirate: "<p>Led by an <strong>Emir or Emira</strong>, where authority is exercised through noble patronage, tribal alliances, and command of key cities or oases.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Sheikhs</strong> — tribal leadership &amp; mediation</li>\n  <li><strong>Sultans</strong> — powerful sub-rulers or senior nobles (where applicable)</li>\n  <li><strong>Mullahs</strong> — religious guidance</li>\n  <li><strong>Grand Viziers</strong> — chief ministers and state management</li>\n</ul>",
  Despotate: "<p>Led by a <strong>Despot</strong>, where authority is concentrated in a single ruler&#39;s will, secured by loyal offices and tightly controlled succession.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Regents</strong> — continuity of rule</li>\n  <li><strong>Viceroys</strong> — provincial control</li>\n  <li><strong>Ministers</strong> — finance, law, and public order</li>\n  <li><strong>Court Astrologers</strong> — omens, propaganda, and &quot;fated&quot; legitimacy</li>\n</ul>",
  Ulus: "<p>Led by a <strong>Khan or Khatun</strong>, where authority is maintained through clan councils, pasture rights, and negotiated loyalty among nomadic lineages.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Tribal Chiefs</strong> — local governance</li>\n  <li><strong>Clan Elders</strong> — custom and arbitration</li>\n  <li><strong>Shamans</strong> — spiritual counsel</li>\n  <li><strong>Senior Khans</strong> — military and regional command</li>\n</ul>",
  Horde: "<p>Led by a <strong>Khan or Khagan</strong>, where authority is built on conquest prestige, warband loyalty, and control of plunder and tribute.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Warlords</strong> — campaign leadership</li>\n  <li><strong>Chieftains</strong> — clan command</li>\n  <li><strong>Shaman-Kings</strong> — spiritual authority tied to rule</li>\n  <li><strong>Veteran Khans</strong> — regional oversight and succession power-brokering</li>\n</ul>",
  Satrapy: "<p>Led by a <strong>Satrap</strong>, where authority is delegated by an overlord and maintained through taxation, records, and provincial bureaucracy.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Administrators</strong> — civil management</li>\n  <li><strong>Tax Collectors</strong> — revenue &amp; tribute</li>\n  <li><strong>Scribes</strong> — archives, law, and census</li>\n  <li><strong>Royal Envoys</strong> — oversight, audits, and imperial communication</li>\n</ul>",
  Federation: "<p>Led by a <strong>Federation Chancellor</strong>, where authority is shared between member states under a central charter and negotiated powers.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Councilors</strong> — member representation</li>\n  <li><strong>Federal Marshal</strong> — interstate enforcement</li>\n  <li><strong>Trade Envoy</strong> — commerce and customs</li>\n  <li><strong>Federation Auditor</strong> — budgets and compliance</li>\n  <li><strong>Environmental Commissioner</strong> — resource and land stewardship</li>\n</ul>",
  "Trade Company": "<p>Led by a <strong>Chairman or Chairwoman</strong>, where authority is exercised through corporate charter, shareholder power, and control of routes and monopolies.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Chief Financial Officer</strong> — capital and ledgers</li>\n  <li><strong>Trade Representative</strong> — contracts and concessions</li>\n  <li><strong>Logistics Coordinator</strong> — shipping and supply chains</li>\n  <li><strong>Market Analyst</strong> — pricing and intelligence</li>\n  <li><strong>Security Chief</strong> — guards, privateers, and asset protection</li>\n</ul>",
  "Most Serene Republic": "<p>Led by a <strong>Doge</strong>, where authority is upheld by elite councils, mercantile tradition, and carefully balanced civic ritual.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Patricians</strong> — noble council governance</li>\n  <li><strong>Naval Admiral</strong> — fleet and sea-lanes</li>\n  <li><strong>Civic Architect</strong> — public works and prestige projects</li>\n  <li><strong>Trade Consul</strong> — treaties and tariffs</li>\n  <li><strong>Artisan Guildmaster</strong> — guild coordination and labor influence</li>\n</ul>",
  Oligarchy: "<p>Led by <strong>Oligarchs</strong>, where authority is concentrated among a small ruling class that controls wealth, land, or institutions.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Councilors</strong> — policy and voting blocs</li>\n  <li><strong>Chief Strategist</strong> — long-term planning</li>\n  <li><strong>Economic Adviser</strong> — markets and extraction</li>\n  <li><strong>Security Director</strong> — enforcement and suppression</li>\n  <li><strong>Legal Counsel</strong> — lawcraft and legitimizing rule</li>\n</ul>",
  Tetrarchy: "<p>Led by <strong>four Tetrarchs</strong>, where authority is divided into quadrants with unified doctrine but regional autonomy.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Quadrant Governors</strong> — local administration</li>\n  <li><strong>Military Tribunes</strong> — regional forces</li>\n  <li><strong>Civic Planners</strong> — infrastructure and zoning</li>\n  <li><strong>Cultural Curators</strong> — unity through tradition</li>\n  <li><strong>Foreign Envoys</strong> — external diplomacy and coordination</li>\n</ul>",
  Triumvirate: "<p>Led by <strong>three Triumvirs</strong>, where authority is shared through negotiated portfolios and mutual veto to prevent single-rule dominance.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Joint Magistrates</strong> — courts and civil order</li>\n  <li><strong>Public Works Overseers</strong> — roads, ports, and utilities</li>\n  <li><strong>Trade Liaisons</strong> — commerce and guild relations</li>\n  <li><strong>Cultural Ambassadors</strong> — public morale and identity</li>\n  <li><strong>Emergency Councilors</strong> — crisis response and continuity</li>\n</ul>",
  Diarchy: "<p>Led by <strong>Co-Kings or Co-Queens</strong>, where authority is split by region, function, or lineage and stabilized through ritualized balance.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Royal Consorts</strong> — dynastic alliances</li>\n  <li><strong>Court Astrologers</strong> — omens and propaganda</li>\n  <li><strong>Guardian of the Realm</strong> — security and succession protection</li>\n  <li><strong>Chief Heralds</strong> — law proclamations and ceremony</li>\n  <li><strong>Masters of Revels</strong> — public festivals and legitimacy theater</li>\n</ul>",
  Junta: "<p>Led by a <strong>Junta Leader</strong>, where authority is imposed through military command structure, emergency decree, and strict internal security.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Field Marshal</strong> — armed forces coordination</li>\n  <li><strong>Propaganda Minister</strong> — public messaging</li>\n  <li><strong>Secret Police Chief</strong> — surveillance and suppression</li>\n  <li><strong>Economic Czar</strong> — production and requisition</li>\n  <li><strong>Labor Overseer</strong> — workforce control and conscription</li>\n</ul>",
  "Free City": "<p>Led by a <strong>Burgomaster or Mayor</strong>, where authority is rooted in city charters, merchant rights, and civic autonomy.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Aldermen</strong> — district representation</li>\n  <li><strong>Councilors</strong> — legislation and budgets</li>\n  <li><strong>Merchants</strong> — trade influence and tariffs</li>\n  <li><strong>Guildmasters</strong> — craft regulation and labor stability</li>\n</ul>",
  "City-state": "<p>Led by a <strong>Consul or Archon</strong>, where authority is concentrated within a single metropolis and its surrounding territory through civic law and citizen obligation.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Senators</strong> — policy and law</li>\n  <li><strong>Orators</strong> — public persuasion and diplomacy</li>\n  <li><strong>Tribunes</strong> — popular representation and civil defense</li>\n  <li><strong>Strategoi</strong> — military planning and crisis command</li>\n</ul>",
  Brotherhood: "<p>Led by a <strong>Brother or Sister</strong>, where authority is maintained through vows, communal discipline, and monastic hierarchy.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Abbot/Abbess</strong> — internal order</li>\n  <li><strong>Inquisitors</strong> — heresy and enforcement</li>\n  <li><strong>Scribes</strong> — records and correspondence</li>\n  <li><strong>Chaplains</strong> — pastoral care</li>\n  <li><strong>Cantors</strong> — ritual, music, and morale</li>\n</ul>",
  Thearchy: "<p>Led by a <strong>Divine Sovereign</strong>, where authority is presented as direct rule by—or on behalf of—celestial power, with governance structured around revelation and sacred hierarchy.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Oracle</strong> — prophecy and guidance</li>\n  <li><strong>Celestial Council</strong> — doctrinal governance</li>\n  <li><strong>Guardian Paladin</strong> — holy military and protection</li>\n  <li><strong>Divine Artisans</strong> — miracle-works and sacred construction</li>\n  <li><strong>Spiritual Guides</strong> — pastoral care and moral instruction</li>\n</ul>",
  See: "<p>Led by a <strong>High Bishop or High Priestess</strong>, where authority flows through an organized clerical bureaucracy centered on a holy seat and canon law.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Council of Cardinals</strong> — high governance</li>\n  <li><strong>Exorcists</strong> — spiritual threats and corruption</li>\n  <li><strong>Sanctuary Keepers</strong> — holy sites and reliquaries</li>\n  <li><strong>Divine Advocates</strong> — legal counsel under canon</li>\n  <li><strong>Pilgrim Guides</strong> — pilgrimage routes, hospitality, and devotion</li>\n</ul>",
  "Holy State": "<p>Led by a <strong>Pontiff</strong>, where authority is exercised through sacred sovereignty, temple courts, and crusading mandate.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Holy Council</strong> — policy and doctrine</li>\n  <li><strong>Crusaders</strong> — holy military orders</li>\n  <li><strong>Divine Emissaries</strong> — diplomacy and conversion</li>\n  <li><strong>Miracle Workers</strong> — healing and public signs</li>\n  <li><strong>Monastic Scholars</strong> — education, archives, and law</li>\n</ul>",
  "Divine Monarchy": "<p>Led by a <strong>Divine Sovereign</strong>, where authority blends hereditary rule with sanctified legitimacy and ritual obligation.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Prophets</strong> — revelation and warning</li>\n  <li><strong>Oracles</strong> — omens and interpretation</li>\n  <li><strong>Saints</strong> — living exemplars and political anchors</li>\n  <li><strong>Divine Emissaries</strong> — sacred diplomacy and enforcement</li>\n</ul>",
  Diocese: "<p>Led by a <strong>Bishop or Bishopess</strong>, where authority is regional and administrative, enforcing doctrine through parish structures and ecclesiastical courts.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Deans</strong> — district oversight</li>\n  <li><strong>Canons</strong> — cathedral governance</li>\n  <li><strong>Presbyters</strong> — senior clergy and adjudication</li>\n  <li><strong>Exorcists</strong> — spiritual defense and corruption response</li>\n</ul>",
  Bishopric: "<p>Led by a <strong>Bishop</strong>, where authority is centered on a fortified seat and enforced through clerical discipline and local canon law.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Archdeacons</strong> — administration and inspections</li>\n  <li><strong>Vicars</strong> — parish leadership and outreach</li>\n  <li><strong>Chaplains</strong> — pastoral care and rites</li>\n  <li><strong>Confessors</strong> — counsel, penance, and moral adjudication</li>\n</ul>",
  League: "<p>Led by a <strong>League Commissioner</strong>, where authority is maintained through compacts, standardized rules, and mutual obligations among members.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>League Councilors</strong> — member representation</li>\n  <li><strong>Trade Commissioners</strong> — commerce and tariffs</li>\n  <li><strong>Environmental Stewards</strong> — resource standards</li>\n  <li><strong>Educational Coordinators</strong> — shared institutions</li>\n  <li><strong>Athletic Directors</strong> — competition and civic ritual</li>\n</ul>",
  Confederation: "<p>Led by a <strong>Confederation Chancellor</strong>, where authority remains largely with constituent regions and the center governs by consent and negotiated powers.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Confederation Ambassadors</strong> — inter-regional diplomacy</li>\n  <li><strong>Regional Governors</strong> — local enforcement</li>\n  <li><strong>Infrastructure Planners</strong> — shared roads and utilities</li>\n  <li><strong>Equality Advocates</strong> — rights frameworks and mediation</li>\n  <li><strong>Health Coordinators</strong> — welfare and crisis response</li>\n</ul>",
  "United Kingdom": "<p>Led by a <strong>Prime Minister</strong>, where authority operates through parliamentary mandate alongside a ceremonial crown and enduring institutions.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Parliamentarians</strong> — legislation and oversight</li>\n  <li><strong>Royal Advisers</strong> — protocol and continuity</li>\n  <li><strong>Foreign Secretary</strong> — external affairs</li>\n  <li><strong>Home Secretary</strong> — internal security</li>\n  <li><strong>Royal Judges</strong> — high courts and precedent</li>\n</ul>",
  "United Republic": "<p>Led by a <strong>President</strong>, where authority is unified under a single constitution while preserving regional representation and shared civic identity.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Congressional Delegates</strong> — legislation and regional voice</li>\n  <li><strong>Union Advocates</strong> — integration and civil rights</li>\n  <li><strong>Public Health Commissioners</strong> — welfare and crisis response</li>\n  <li><strong>Environmental Regulators</strong> — land and resource standards</li>\n  <li><strong>Educational Directors</strong> — national institutions and curricula</li>\n</ul>",
  "United Provinces": "<p>Led by a <strong>Governor-General</strong>, where authority is coordinated across semi-autonomous provinces through compacts, shared courts, and standardized administration.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Provincial Councilors</strong> — regional governance</li>\n  <li><strong>Regional Planners</strong> — infrastructure and development</li>\n  <li><strong>Cultural Liaisons</strong> — customs and cohesion</li>\n  <li><strong>Trade Inspectors</strong> — tariffs and compliance</li>\n  <li><strong>Health Coordinators</strong> — shared services and emergency response</li>\n</ul>",
  Commonwealth: "<p>Led by a <strong>Commonwealth President</strong>, where authority is maintained through mutual-aid charters, shared institutions, and cooperative sovereignty among members.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Commonwealth Assembly Members</strong> — representation and budgets</li>\n  <li><strong>Infrastructure Coordinators</strong> — roads, utilities, and rebuilding</li>\n  <li><strong>Cultural Ambassadors</strong> — unity and diplomacy</li>\n  <li><strong>Trade Envoys</strong> — commerce and standards</li>\n  <li><strong>Environmental Stewards</strong> — resource management</li>\n  <li><strong>Humanitarian Aid Directors</strong> — relief and social stability</li>\n</ul>",
  Heptarchy: "<p>Led by <strong>Heptarchs</strong>, where authority is divided among seven rulers who govern by rotating chair, negotiated portfolios, or regional mandate.</p>\n<p><strong>Advisors:</strong></p>\n<ul>\n  <li><strong>Regional Councilors</strong> — local administration</li>\n  <li><strong>Unity Advocates</strong> — conflict mediation and cohesion</li>\n  <li><strong>Master Artisans</strong> — industry and production</li>\n  <li><strong>Cultural Custodians</strong> — tradition and legitimacy</li>\n  <li><strong>Trade Negotiators</strong> — commerce and treaties</li>\n</ul>",
  "Free Territory": "<p>Led by local <strong>Community Leaders</strong>, where authority is informal and consent-based, relying on mutual-aid pacts and shared norms rather than codified state law.</p>\n<p><strong>Guiding roles:</strong></p>\n<ul>\n  <li><strong>Grassroots Organizers</strong> — mobilization and decision-making</li>\n  <li><strong>Mediators</strong> — conflict resolution</li>\n  <li><strong>Environmental Activists</strong> — land stewardship</li>\n  <li><strong>Self-Defense Coordinators</strong> — community safety</li>\n  <li><strong>Outreach Workers</strong> — alliances, trade, and newcomer integration</li>\n</ul>",
  Council: "<p>Led by <strong>Council Elders</strong>, where authority is exercised through open assemblies, rotating committees, and collectively enforced customs.</p>\n<p><strong>Guiding roles:</strong></p>\n<ul>\n  <li><strong>Neighborhood Watch Captains</strong> — safety and patrols</li>\n  <li><strong>Community Gardeners</strong> — food systems and resilience</li>\n  <li><strong>Artisan Craftsmen/Craftswomen</strong> — production and repair</li>\n  <li><strong>Social Workers</strong> — care networks and crisis support</li>\n  <li><strong>Youth Mentors</strong> — education and continuity</li>\n</ul>",
  Commune: "<p>Led by <strong>Commune Coordinators</strong>, where authority is distributed through shared ownership, cooperative labor, and consensus governance.</p>\n<p><strong>Guiding roles:</strong></p>\n<ul>\n  <li><strong>Commons Stewards</strong> — resources and property use</li>\n  <li><strong>Community Healers</strong> — health and wellbeing</li>\n  <li><strong>Sustainable Living Advocates</strong> — self-sufficiency and infrastructure</li>\n  <li><strong>Community Educators</strong> — skills and knowledge transfer</li>\n  <li><strong>Volunteer Coordinators</strong> — work rosters and mutual aid</li>\n</ul>",
  Community: "<p>Led by <strong>Community Elders</strong>, where authority rests on tradition, reputation, and collective agreement, often reinforced through kinship ties and local custom.</p>\n<p><strong>Guiding roles:</strong></p>\n<ul>\n  <li><strong>Local Historians</strong> — records and identity</li>\n  <li><strong>Neighborhood Organizers</strong> — projects and assemblies</li>\n  <li><strong>Artisan Craftsmen/Craftswomen</strong> — tools, trade, and maintenance</li>\n  <li><strong>Community Gardeners</strong> — food security</li>\n  <li><strong>Cultural Liaisons</strong> — ritual, diplomacy, and social cohesion</li>\n</ul>",
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

export function getPoliticalDescriptor(type: string | undefined) {
  return politicalDescriptors[type as keyof typeof politicalDescriptors] || "";
}
