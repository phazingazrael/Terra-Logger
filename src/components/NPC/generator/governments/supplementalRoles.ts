import type {
	GovernmentRoleClassification,
	GovernmentRoleCount,
} from "../../types";

export type SupplementalGovernmentRole = {
	title: string;
	description: string;
	classification: GovernmentRoleClassification;
	primary?: boolean;
	count?: GovernmentRoleCount;
};

const leader = (
	title: string,
	description: string,
	count: GovernmentRoleCount = { mode: "fixed", value: 1 },
): SupplementalGovernmentRole => ({
	title,
	description,
	classification: "leader",
	primary: true,
	count,
});

const advisor = (
	title: string,
	description: string,
): SupplementalGovernmentRole => ({
	title,
	description,
	classification: "advisor",
});

export const supplementalGovernmentRoles: Readonly<
	Record<string, readonly SupplementalGovernmentRole[]>
> = {
	Monarchy: [
		leader(
			"Monarch",
			"Hereditary sovereign whose authority flows through bloodlines, noble houses, and court tradition.",
		),
		advisor("Royal Chancellor", "Advises on law and statecraft."),
		advisor("Lord/Lady Steward", "Oversees lands and logistics."),
		advisor("Master of Coin/Treasurer", "Oversees revenue and budgets."),
		advisor("Marshal/Master-at-Arms", "Commands military affairs."),
		advisor("Spymaster", "Directs internal and external intelligence."),
		advisor(
			"Court Wizard/High Priest/Priestess",
			"Provides arcane or divine counsel and legitimacy.",
		),
	],
	Marches: [
		leader(
			"Marquis/Marchioness",
			"Frontier ruler whose authority is shaped by rapid mobilization and constant border pressure.",
		),
		advisor("Border Warden", "Oversees patrols and fortifications."),
		advisor("Military Commander", "Commands garrisons and levies."),
		advisor("Intelligence Officer", "Coordinates scouts and rival-watch."),
		advisor(
			"Infrastructure Overseer",
			"Oversees roads, watchtowers, and supply lines.",
		),
	],
	Dominion: [
		leader(
			"Lord/Lady",
			"Chartered ruler whose authority rests on oaths of fealty and tightly managed estates.",
		),
		advisor("Steward", "Manages holdings and logistics."),
		advisor("Justiciar", "Oversees courts and enforcement."),
		advisor("Chamberlain", "Manages household administration and protocol."),
		advisor(
			"Master Builder",
			"Oversees public works, fortifications, and expansion.",
		),
	],
	Protectorate: [
		leader(
			"Protector",
			"Transitional ruler whose authority is reinforced through an oversight mandate or military backing.",
		),
		advisor("Governor", "Oversees regional administration."),
		advisor("Diplomat", "Handles treaties and external relations."),
		advisor("Spy", "Handles counterinsurgency and intelligence."),
		advisor(
			"Cultural Liaison",
			"Supports local legitimacy, customs, and public morale.",
		),
	],
	Khaganate: [
		leader(
			"Khagan/Khagana",
			"Supreme steppe ruler sustained by clan allegiance, prestige, routes, and tribute.",
		),
		advisor("Khan", "Serves as a sub-ruler of a major tribe."),
		advisor("Tarkhan", "Serves as a noble war-leader and administrator."),
		advisor("Shaman", "Provides spiritual authority and interprets omens."),
		advisor(
			"Horse Lord",
			"Oversees logistics, remounts, and rapid-warfare doctrine.",
		),
	],
	Tsardom: [
		leader(
			"Tsar/Tsaritsa",
			"Divine-right sovereign supported by imperial court hierarchy and centralized decree.",
		),
		advisor("Boyar", "Represents high nobles and provincial power."),
		advisor("Prince", "Serves as a dynastic governor."),
		advisor("Archbishop", "Provides religious legitimacy."),
		advisor("Grand Duke", "Provides regional command and administration."),
	],
	Shogunate: [
		leader(
			"Shogun",
			"Military ruler whose authority is enforced through martial law, fealty, and a disciplined warrior class.",
		),
		advisor("Daimyo", "Serves as a regional lord and commands levies."),
		advisor("Samurai Captain", "Commands elite forces and enforces the code."),
		advisor("Ninja", "Conducts espionage, sabotage, and covert policing."),
		advisor("Zen Master", "Provides counsel, legitimacy, and restraint."),
	],
	Caliphate: [
		leader(
			"Caliph",
			"Religious sovereign whose authority rests on sacred mandate, legal scholarship, and stewardship.",
		),
		advisor("Vizier", "Oversees state administration."),
		advisor("Imam", "Provides religious leadership."),
		advisor("Qadi", "Judges matters of civil and religious law."),
		advisor("Grand Mufti", "Provides the highest legal opinions and doctrine."),
	],
	Emirate: [
		leader(
			"Emir/Emira",
			"Noble ruler supported by patronage, tribal alliances, and command of key settlements.",
		),
		advisor("Sheikh", "Provides tribal leadership and mediation."),
		advisor("Sultan", "Serves as a powerful sub-ruler or senior noble."),
		advisor("Mullah", "Provides religious guidance."),
		advisor("Grand Vizier", "Serves as chief minister and state manager."),
	],
	Despotate: [
		leader(
			"Despot",
			"Singular ruler whose will is secured by loyal offices and tightly controlled succession.",
		),
		advisor("Regent", "Maintains continuity of rule."),
		advisor("Viceroy", "Maintains provincial control."),
		advisor("Minister", "Oversees finance, law, or public order."),
		advisor(
			"Court Astrologer",
			"Interprets omens and reinforces the ruler's legitimacy.",
		),
	],
	Ulus: [
		leader(
			"Khan/Khatun",
			"Nomadic ruler supported by clan councils, pasture rights, and negotiated loyalty.",
		),
		advisor("Tribal Chief", "Provides local governance."),
		advisor("Clan Elder", "Interprets custom and arbitrates disputes."),
		advisor("Shaman", "Provides spiritual counsel."),
		advisor("Senior Khan", "Provides military and regional command."),
	],
	Horde: [
		leader(
			"Khan/Khagan",
			"Conquest ruler supported by warband loyalty and control of plunder and tribute.",
		),
		advisor("Warlord", "Leads military campaigns."),
		advisor("Chieftain", "Commands a clan."),
		advisor("Shaman-King", "Combines spiritual authority with rule."),
		advisor(
			"Veteran Khan",
			"Provides regional oversight and brokers succession.",
		),
	],
	Satrapy: [
		leader(
			"Satrap",
			"Provincial ruler delegated by an overlord and supported by taxation and bureaucracy.",
		),
		advisor("Administrator", "Oversees civil management."),
		advisor("Tax Collector", "Collects revenue and tribute."),
		advisor("Scribe", "Maintains archives, law, and census records."),
		advisor(
			"Royal Envoy",
			"Conducts oversight, audits, and imperial communication.",
		),
	],
	"Free City": [
		leader(
			"Burgomaster/Mayor",
			"Civic ruler whose authority rests on city charters, merchant rights, and autonomy.",
		),
		advisor("Alderman", "Represents a city district."),
		advisor("Councilor", "Oversees legislation and budgets."),
		advisor("Merchant", "Advises on trade and tariffs."),
		advisor("Guildmaster", "Represents crafts and labor stability."),
	],
	"City-state": [
		leader(
			"Consul/Archon",
			"Metropolitan ruler supported by civic law and citizen obligation.",
		),
		advisor("Senator", "Advises on policy and law."),
		advisor("Orator", "Handles public persuasion and diplomacy."),
		advisor("Tribune", "Represents citizens and civil defense."),
		advisor("Strategos", "Directs military planning and crisis command."),
	],
	"Divine Monarchy": [
		leader(
			"Divine Sovereign",
			"Hereditary ruler whose authority is reinforced by sanctified legitimacy and ritual obligation.",
		),
		advisor("Prophet", "Provides revelation and warning."),
		advisor("Oracle", "Interprets omens."),
		advisor("Saint", "Serves as a living exemplar and political anchor."),
		advisor("Divine Emissary", "Handles sacred diplomacy and enforcement."),
	],
	Diocese: [
		leader(
			"Bishop/Bishopess",
			"Regional clerical ruler who administers doctrine through parishes and ecclesiastical courts.",
		),
		advisor("Dean", "Oversees a district."),
		advisor("Canon", "Participates in cathedral governance."),
		advisor("Presbyter", "Serves as senior clergy and adjudicator."),
		advisor("Exorcist", "Responds to spiritual threats and corruption."),
	],
	Bishopric: [
		leader(
			"Bishop",
			"Clerical ruler whose authority is centered on a fortified seat and local canon law.",
		),
		advisor("Archdeacon", "Oversees administration and inspections."),
		advisor("Vicar", "Provides parish leadership and outreach."),
		advisor("Chaplain", "Provides pastoral care and rites."),
		advisor("Confessor", "Provides counsel, penance, and moral adjudication."),
	],
	Heptarchy: [
		leader(
			"Heptarch",
			"One of seven rulers governing through rotating chair, negotiated portfolios, or regional mandate.",
			{ mode: "fixed", value: 7 },
		),
		advisor("Regional Councilor", "Provides local administration."),
		advisor("Unity Advocate", "Mediates conflict and supports cohesion."),
		advisor("Master Artisan", "Represents industry and production."),
		advisor("Cultural Custodian", "Preserves tradition and legitimacy."),
		advisor("Trade Negotiator", "Handles commerce and treaties."),
	],
	Anarchy: [
		advisor("Facilitator", "Leads meetings and consensus processes."),
		advisor("Mediator", "Resolves disputes."),
		advisor("Resource Steward", "Coordinates supplies and distribution."),
		advisor("Work Coordinator", "Coordinates projects and labor."),
		advisor(
			"Self-Defense Coordinator",
			"Coordinates voluntary community safety.",
		),
		advisor("Envoy/Liaison", "Handles external agreements and diplomacy."),
	],
};
