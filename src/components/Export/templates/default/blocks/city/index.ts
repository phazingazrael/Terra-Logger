import type { MarkdownBlock } from "../../../../builder/exportTypes";
import { createDefaultCustomAtlasSectionsBlock } from "../universal/customAtlasSections";
import { createDefaultDescriptionBlock } from "../universal/description";
import { defaultFrontmatterBlock } from "../universal/frontmatter";
import { defaultCityAdventurersMercenaryWorkBlock } from "./adventurersMercenaryWork";
import { defaultCityCoatOfArmsBlock } from "./coatOfArms";
import { defaultCityCrimeUnderworldBlock } from "./crimeUnderworld";
import { defaultCityCultureArtsEntertainmentBlock } from "./cultureArtsEntertainment";
import { defaultCityDemographicsSocietyBlock } from "./demographicsSociety";
import { defaultCityEconomyTradeBlock } from "./economyTrade";
import { defaultCityEducationKnowledgeBlock } from "./educationKnowledge";
import { defaultCityFeaturesBlock } from "./features";
import { defaultCityGeneralInformationBlock } from "./generalInformation";
import { defaultCityGeographyEnvironmentBlock } from "./geographyEnvironment";
import { defaultCityGovernmentPowerStructureBlock } from "./governmentPowerStructure";
import { defaultCityHistoryBlock } from "./history";
import { defaultCityMagicTechnologyBlock } from "./magicTechnology"; createDefaultCustomAtlasSectionsBlock({
  id: "default.city.customAtlasSections",
  sourceType: "city",
  handledSectionLabels: [
    "Header",
    "General Information",
    "Overview",
    "Description",
    "Coat of Arms",
    "Features",
    "Map",
    "History",
    "Geography & Environment",
    "Economy & Trade",
    "Government & Power Structure",
    "Government & Power",
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
    "Sister Cities & Interstellar Relations",
    "Sister Cities & other Connections",
    "Sister Cities & Other Connections",
    "Notable Figures & Legends",
    "Adventurers & Mercenary Work",
    "Tags",
  ],
  handledSectionClassNames: [
    "section header",
    "section general-information",
    "section overview",
    "section description",
    "section coat-of-arms",
    "section features",
    "section featuresList",
    "section map-link",
    "section map",
    "section history",
    "section geography-environment",
    "section economy-trade",
    "section government-power-structure",
    "section government-power",
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
    "section sister-cities-interstellar-relations",
    "section sister-cities-connections",
    "section notable-figures-legends",
    "section adventurers-mercenary-work",
    "section tags",
  ],
})
import { defaultCityMilitaryDefenseBlock } from "./militaryDefense";
import { defaultCityNotableFiguresLegendsBlock } from "./notableFiguresLegends";
import { defaultCityNotableLocationsLandmarksBlock } from "./notableLocationsLandmarks";
import { defaultCityOverviewBlock } from "./overview";
import { defaultCityReligionMythologyBlock } from "./religionMythology";
import { defaultCitySisterCitiesInterstellarRelationsBlock } from "./sisterCitiesInterstellarRelations";
import { defaultCitySportsCompetitiveGamesBlock } from "./sportsCompetitiveGames";
import { defaultCityTagsBlock } from "./tags";
import { defaultCityTitleBlock } from "./title";
import { defaultCityTransportationInfrastructureBlock } from "./transportationInfrastructure";

export function getDefaultCityBlocks(): MarkdownBlock[] {
  return [
    defaultFrontmatterBlock,
    defaultCityTitleBlock,
    defaultCityGeneralInformationBlock,
    defaultCityOverviewBlock,
    createDefaultDescriptionBlock({
      id: "default.city.description",
      sourceType: "city",
    }),
    defaultCityCoatOfArmsBlock,
    defaultCityFeaturesBlock,
    defaultCityHistoryBlock,
    defaultCityGeographyEnvironmentBlock,
    defaultCityEconomyTradeBlock,
    defaultCityGovernmentPowerStructureBlock,
    defaultCityDemographicsSocietyBlock,
    defaultCityMilitaryDefenseBlock,
    defaultCityTransportationInfrastructureBlock,
    defaultCityEducationKnowledgeBlock,
    defaultCityCultureArtsEntertainmentBlock,
    defaultCitySportsCompetitiveGamesBlock,
    defaultCityMagicTechnologyBlock,
    defaultCityCrimeUnderworldBlock,
    defaultCityReligionMythologyBlock,
    defaultCityNotableLocationsLandmarksBlock,
    defaultCitySisterCitiesInterstellarRelationsBlock,
    defaultCityNotableFiguresLegendsBlock,
    defaultCityAdventurersMercenaryWorkBlock,
    createDefaultCustomAtlasSectionsBlock({
      id: "default.city.customAtlasSections",
      sourceType: "city",
      handledSectionLabels: [
        "Header",
        "General Information",
        "Overview",
        "Description",
        "Coat of Arms",
        "Features",
        "Map",
        "History",
        "Geography & Environment",
        "Economy & Trade",
        "Government & Power Structure",
        "Government & Power",
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
        "Sister Cities & Interstellar Relations",
        "Sister Cities & other Connections",
        "Sister Cities & Other Connections",
        "Notable Figures & Legends",
        "Adventurers & Mercenary Work",
        "Tags",
      ],
      handledSectionClassNames: [
        "section header",
        "section general-information",
        "section overview",
        "section description",
        "section coat-of-arms",
        "section features",
        "section featuresList",
        "section map-link",
        "section map",
        "section history",
        "section geography-environment",
        "section economy-trade",
        "section government-power-structure",
        "section government-power",
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
        "section sister-cities-interstellar-relations",
        "section sister-cities-connections",
        "section notable-figures-legends",
        "section adventurers-mercenary-work",
        "section tags",
      ],
    }),
    defaultCityTagsBlock,
  ];
}
