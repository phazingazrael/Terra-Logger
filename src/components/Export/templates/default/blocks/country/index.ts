import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";
import { createDefaultDescriptionBlock } from "../universal/description";
import { defaultFrontmatterBlock } from "../universal/frontmatter";
import { defaultCountryAdventurersMercenaryWorkBlock } from "./adventurersMercenaryWork";
import { defaultCountryCitiesBlock } from "./cities";
import { defaultCountryCoatOfArmsBlock } from "./coatOfArms";
import { defaultCountryCrimeUnderworldBlock } from "./crimeUnderworld";
import { defaultCountryCultureArtsEntertainmentBlock } from "./cultureArtsEntertainment";
import { defaultCountryDemographicsSocietyBlock } from "./demographicsSociety";
import { defaultCountryEconomyTradeBlock } from "./economyTrade";
import { defaultCountryEducationKnowledgeBlock } from "./educationKnowledge";
import { defaultCountryGeneralInformationBlock } from "./generalInformation";
import { defaultCountryGeographyEnvironmentBlock } from "./geographyEnvironment";
import { defaultCountryGovernmentPowerStructureBlock } from "./governmentPowerStructure";
import { defaultCountryHistoryBlock } from "./history";
import { defaultCountryMagicTechnologyBlock } from "./magicTechnology";
import { defaultCountryMilitaryDefenseBlock } from "./militaryDefense";
import { defaultCountryNotableFiguresLegendsBlock } from "./notableFiguresLegends";
import { defaultCountryNotableLocationsLandmarksBlock } from "./notableLocationsLandmarks";
import { defaultCountryOverviewBlock } from "./overview";
import { defaultCountryPoliticalRelationsBlock } from "./politicalRelations";
import { defaultCountryReligionMythologyBlock } from "./religionMythology";
import { defaultCountrySportsCompetitiveGamesBlock } from "./sportsCompetitiveGames";
import { defaultCountryTagsBlock } from "./tags";
import { defaultCountryTitleBlock } from "./title";
import { defaultCountryTransportationInfrastructureBlock } from "./transportationInfrastructure";
import { defaultCountryWarCampaignsBlock } from "./warCampaigns";



export function getDefaultCountryBlocks(): MarkdownBlock[] {
  return [
    defaultFrontmatterBlock,
    defaultCountryTitleBlock,
    defaultCountryGeneralInformationBlock,
    createDefaultDescriptionBlock({
      id: "default.country.description",
      sourceType: "country",
    }),
    defaultCountryCoatOfArmsBlock,
    defaultCountryOverviewBlock,
    defaultCountryCitiesBlock,
    defaultCountryHistoryBlock,
    defaultCountryGeographyEnvironmentBlock,
    defaultCountryEconomyTradeBlock,
    defaultCountryGovernmentPowerStructureBlock,
    defaultCountryPoliticalRelationsBlock,
    defaultCountryDemographicsSocietyBlock,
    defaultCountryMilitaryDefenseBlock,
    defaultCountryTransportationInfrastructureBlock,
    defaultCountryEducationKnowledgeBlock,
    defaultCountryCultureArtsEntertainmentBlock,
    defaultCountrySportsCompetitiveGamesBlock,
    defaultCountryMagicTechnologyBlock,
    defaultCountryCrimeUnderworldBlock,
    defaultCountryReligionMythologyBlock,
    defaultCountryNotableLocationsLandmarksBlock,
    defaultCountryNotableFiguresLegendsBlock,
    defaultCountryAdventurersMercenaryWorkBlock,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.country.customAtlasSections",
      sourceType: "country",
      handledSectionLabels: [
        "Header",
        "General Information",
        "Overview",
        "Description",
        "Coat of Arms",
        "Cities",
        "History",
        "Geography & Environment",
        "Economy & Trade",
        "Economy",
        "Government & Power Structure",
        "Government & Power",
        "Political Information",
        "Political Relations",
        "Demographics & Society",
        "Military & Defense",
        "Transportation & Infrastructure",
        "Education & Knowledge",
        "Culture, Arts & Entertainment",
        "Sports & Competitive Games",
        "Magic & Technology",
        "Crime & Underworld",
        "Religion & Mythology",
        "Notable Locations & Landmarks",
        "Notable Figures & Legends",
        "Adventurers & Mercenary Work",
        "Tags",
        "War Campaigns",
      ],
      handledSectionClassNames: [
        "section header",
        "section general-information",
        "section overview",
        "section description",
        "section coat-of-arms",
        "section cities",
        "section history",
        "section geography-environment",
        "section economy-trade",
        "section economy",
        "section government-power-structure",
        "section government-power",
        "section political-information",
        "section political-info",
        "section political",
        "section political-relations",
        "section demographics-society",
        "section military-defense",
        "section transportation-infrastructure",
        "section education-knowledge",
        "section culture-arts-entertainment",
        "section culture-arts",
        "section sports-competitive-games",
        "section magic-technology",
        "section crime-underworld",
        "section religion-mythology",
        "section notable-locations-landmarks",
        "section notable-locations",
        "section notable-figures-legends",
        "section notable-figures",
        "section adventurers-mercenary-work",
        "section adventurers-mercenaries",
        "section tags",
        "section war-campaigns",
      ],
    }),
    defaultCountryTagsBlock,
    defaultCountryWarCampaignsBlock,
  ];
}
