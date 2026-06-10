import type { TLCountry } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { clear, computedBlock, createContentShell, descriptionBlock, detailsListBlock, entityChipListBlock, entitySection, entitySplitListBlock, richTextBlock, sectionPreset } from "../core/presets";

function createCountryContent(entity: TLCountry): AtlasContent {
  return createContentShell({
    sourceType: "country",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.nameFull || entity.name,
    layout: "content-grid",
    className: "content-grid",
    sections: [
      entitySection("Header", "section header", [computedBlock("countryHeader", "header", "country")], clear),
      entitySection("Description", "section description", [
        descriptionBlock(),
      ]),
      entitySection("Cities", "section citiesList", [entityChipListBlock("Cities", "cities")]),
      entitySection("Military", "section military", [computedBlock("countryMilitary", "Military", "country.military")]),
      sectionPreset("Political Information", "section political-info", [
        detailsListBlock([
          { label: "Government Type", value: "political.formName", valueMode: "entity", emptyText: "No government type listed." },
          { label: "Capital", valueMode: "computed", resolver: "country.capitalCityName", emptyText: "No government capital listed.", },
          { label: "Current Rulers", value: "[King, High Priestess, AI Overlord, Elder Council, etc.]" },
          { label: "Noble Houses & Factions", value: "[Major power groups, noble families, rival factions.]" },
          { label: "Laws & Justice System", value: "[Trial by combat? Magic-enforced law? A dystopian police state?]" },
          { label: "Corruption Level", value: "[Low, moderate, high, controlled by crime syndicates.]" }
        ]),
        richTextBlock("Add political details here."),
      ]),
      sectionPreset("Economy", "section economy", [
        entitySplitListBlock("Imports and Exports", [
          {
            label: "Exports",
            entityPath: "economy.exports",
            emptyText: "No exports listed.",
          },
          {
            label: "Imports",
            entityPath: "economy.imports",
            emptyText: "No imports listed.",
          },
        ]),
        detailsListBlock([
          { label: "Economic Description", value: "economy.description", valueMode: "entity", emptyText: "No economic description listed." },
          { label: "Major Industries", value: "[Alchemy, soul-forging, mecha production, space mining, etc.]" },
          { label: "Currency and Trade", value: "[Gold coins, credits, mana crystals, barter system, etc.]" },
          { label: "Notable Guilds & Corporations", value: "[Merchant houses, cybernetic megacorps, thieves’ guilds, etc.]" },
          { label: "Black Market & Illicit Trade", value: "[Contraband, smugglers, underground syndicates, etc.]" }
        ]),
        richTextBlock("Add economic details here."),
      ]),
      entitySection("Diplomacy", "section diplomacy", [computedBlock("countryDiplomacy", "Diplomacy", "country.political.diplomacy")]),
      sectionPreset("History", "section history", [
        detailsListBlock([
          { label: "Historical Overview", value: "history.details", valueMode: "entity", emptyText: "No historical overview listed." },
          // change line below to render history.events[] as a list of events with dates and descriptions
          { label: "Major Events", value: "[Wars, revolutions, golden ages, disasters, etc.]" },
          { label: "Notable Founding Myths/Legends", value: "[Ancient tales about how the city was formed or its divine/magical origins.]" },
          { label: "Major Wars & Conflicts", value: "[Significant wars, galactic conflicts, magical wars, or civil uprisings.]" },
          { label: "Epochs & Eras", value: "[Different historical periods, dynasties, or interstellar ages.]" },
          { label: "Notable Leaders & Rulers", value: "[Kings, Emperors, Warlords, AI Governors, etc.]" },
        ]),
        // entityChipListBlock("Events", "history.events"),
        richTextBlock("Add country history notes here."),
      ]),
      sectionPreset("Demographics & Society", "section demographics", [
        detailsListBlock([
          { label: "Population Growth & Migration", value: "[Stable, declining, booming, dependent on magic/artificial births.]" },
          { label: "Ethnic & Racial Composition", value: "[Humans, Elves, Orcs, Androids, Clones, etc.]" },
          { label: "Language & Scripts", value: "[Common tongue, ancient runes, digital code-based speech.]" },
          { label: "Religion & Deities", value: "[Worship of gods, forgotten cosmic entities, AI prophets.]" },
          { label: "Castes, Classes & Social Hierarchy", value: "[Strict hierarchy, meritocracy, anarchist communes, slave societies.]" },
        ]),
        richTextBlock("Add demographic and societal details here."),
      ]),
      // sectionPreset("Additional Details", "section additional-details", [
      //   detailsListBlock([
      //     { label: "Government Type", value: entity.political.formName ?? entity.political.form ?? "" },
      //     { label: "Capital", value: entity.cities?.find((city) => city.capital === true)?.name ?? "" },
      //   ]),
      // ]),
      sectionPreset("Education & Knowledge", "section education-knowledge", [
        detailsListBlock([
          { label: "Academies & Universities", value: "[Magical academies, science research institutes, AI learning centers.]" },
          { label: "Forbidden Knowledge & Secret Societies", value: "[Cults, hidden libraries, esoteric scholars.]" },
          { label: "Notable Thinkers & Researchers", value: "[Famous wizards, AI philosophers, other intellectuals.]" },
          { label: "Libraries & Archives", value: "[World’s largest collection of spell tomes, AI-encrypted data vaults.]" },
        ])
      ]),
      sectionPreset("Culture, Arts & Entertainment", "section culture-arts", [
        detailsListBlock([
          { label: "Music & Performing Arts", value: "[Bards, holographic opera, psychic concerts.]" },
          { label: "Festivals & Holidays", value: "[Ritual sacrifice days, AI awakening celebrations, etc.]" },
          { label: "Cuisine & Food Culture", value: "[Elven wine, synthetic protein cubes, soul-infused delicacies.]" },
          { label: "Fashion & Dress", value: "[Steampunk, cybernetic enhancements, enchanted robes.]" }
        ]),
      ]),
      sectionPreset("Religion & Mythology", "section religion-mythology", [
        detailsListBlock([
          {
            "label": "Gods, Demons & Cosmic Entities",
            "value": "[Who is worshiped or feared in the city?]"
          },
          {
            "label": "Sacred Sites & Temples",
            "value": "[Massive cathedrals, shrines hidden in floating cities.]"
          },
          {
            "label": "Religious Factions & Cults",
            "value": "[What groups enforce (or subvert) faith?]"
          },
          {
            "label": "Miracles & Divine Interventions",
            "value": "[Recent divine events or mythological sightings.]"
          }
        ])
      ]),
      sectionPreset("Notable Figures & Legends", "section notable-figures", [
        detailsListBlock([
          { label: "Influential Figures:", value: "[List of influential people, such as rulers, warriors, philosophers, criminals, and deities.]" },
        ]),
        richTextBlock("Add notable figures and legends details here."),
      ]),
      entitySection("Tags", "section tags", [entityChipListBlock("Tags", "tags")]),
    ],
  });
}

export const countryAdapter: AtlasAdapter<"country"> = {
  sourceType: "country",
  label: "Country",
  defaultLayout: "content-grid",
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.nameFull || entity.name,
  createDefaultContent: createCountryContent,
  sectionPresets: commonSectionPresets<"country">(),
  blockPresets: commonBlockPresets<"country">(),
};
