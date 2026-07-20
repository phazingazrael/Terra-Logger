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
      sectionPreset("Government & Power Structure", "section political-info", [
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
      sectionPreset("Economy & Trade", "section economy", [
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
      sectionPreset("Geography & Environment", "section geography-environment", [
        detailsListBlock([
          { label: "Location", value: "[Describe location within the world, dimension, or space sector.]" },
          { label: "Climate & Atmosphere", value: "[Earth-like, toxic, magical storms, artificial climate, etc.]" },
          { label: "Topography & Terrain", value: "[Floating islands, underground caverns, space stations, etc.]" },
          { label: "Planar/Dimensional Traits", value: "[Is it tied to another plane? Does time move differently here?]" },
          { label: "Unique Natural Features", value: "[Magical ley lines, sentient forests, shifting deserts, etc.]" },
        ]),
        richTextBlock("Add geography and environment details here."),
      ]),

      sectionPreset("Politics & Relationships", "section politics-relationships", [
        detailsListBlock([
          { label: "Military Units", value: "[Describe important military forces, commands, garrisons, and strategic deployments.]" },
          { label: "Diplomatic Relations", value: "[Describe alliances, rivalries, treaties, vassals, enemies, and neutral powers.]" },
          { label: "Neighbors", value: "[Describe neighboring countries, border tensions, shared territories, and regional relationships.]" },
        ]),
        richTextBlock("Add politics and relationship details here."),
      ]),

      sectionPreset("Military & Defense", "section military-defense", [
        detailsListBlock([
          { label: "City Guard & Enforcers", value: "[Knights, robotic enforcers, spectral guardians, etc.]" },
          { label: "Standing Army/Navy", value: "[Size and structure of land, sea, air, or space forces.]" },
          { label: "Walls & Defenses", value: "[Titanium barriers, magical shields, psychic wards.]" },
          { label: "Notable Weapons & Technology", value: "[Arcane cannons, plasma rifles, necromantic constructs.]" },
          { label: "Mercenaries & Private Forces", value: "[Who offers protection outside of government control?]" },
          { label: "War Campaigns", value: "[Major campaigns, invasions, defenses, civil wars, or expeditions.]" },
        ]),
        richTextBlock("Add military and defense details here."),
      ]),

      sectionPreset("Transportation & Infrastructure", "section transportation-infrastructure", [
        detailsListBlock([
          { label: "Public Transit", value: "[Horse-drawn carriages, teleportation circles, maglev trains, hovercraft.]" },
          { label: "Portals & Dimensional Gates", value: "[Natural rifts, constructed portals, wormholes.]" },
          { label: "Skyports & Spaceports", value: "[Landing zones for airships, starships, or mecha units.]" },
          { label: "Roads & Paths", value: "[Ancient cobblestone roads, bioluminescent highways, self-assembling roads.]" },
        ]),
        richTextBlock("Add transportation and infrastructure details here."),
      ]),

      sectionPreset("Sports & Competitive Games", "section sports-games", [
        detailsListBlock([
          { label: "Popular Sports", value: "[Dragon racing, zero-gravity combat sports, golem battles.]" },
          { label: "Underground Fighting Rings", value: "[Gladiatorial combat, beast fights, cyber duels.]" },
          { label: "Famous Athletes & Champions", value: "[Legendary warriors, gladiators, virtual-realm champions.]" },
        ]),
        richTextBlock("Add sports and competitive games details here."),
      ]),

      sectionPreset("Magic & Technology", "section magic-technology", [
        detailsListBlock([
          { label: "Level of Magic/Tech Advancement", value: "[Medieval, arcane-punk, cyberpunk, fully automated AI rule.]" },
          { label: "Common Spells & Technologies", value: "[Necromancy, sentient AI, cyber-implants, flying ships.]" },
          { label: "Power Sources", value: "[Solar energy, eldritch energy, soul crystals, antimatter cores.]" },
          { label: "Lost or Ancient Technology", value: "[Remnants of an old civilization, dark forbidden knowledge.]" },
          { label: "Current Scientific & Magical Research", value: "[Teleportation experiments, interdimensional research.]" },
        ]),
        richTextBlock("Add magic and technology details here."),
      ]),

      sectionPreset("Crime & Underworld", "section crime-underworld", [
        detailsListBlock([
          { label: "Thieves' Guilds & Crime Syndicates", value: "[Who controls the underground economy?]" },
          { label: "Black Markets & Smuggling Rings", value: "[Illegal tech, cursed artifacts, ancient relics.]" },
          { label: "Assassins & Mercenaries", value: "[Infamous killers, rogue mages, bounty hunters.]" },
          { label: "Notable Criminals & Outlaws", value: "[Legendary thieves, escaped war criminals, anarchist hackers.]" },
        ]),
        richTextBlock("Add crime and underworld details here."),
      ]),

      sectionPreset("Notable Locations & Landmarks", "section notable-locations", [
        detailsListBlock([
          { label: "The Great Palace/Throne Room", value: "[Seat of power, filled with ancient relics.]" },
          { label: "The Arcane University/Tech Lab", value: "[Center of magical/scientific advancement.]" },
          { label: "The Underbelly/Sewers/Shadow City", value: "[Underground city full of secrets.]" },
          { label: "The Astral Tower/Observatory", value: "[Study of other planes, stars, and cosmic entities.]" },
        ]),
        richTextBlock("Add notable locations and landmarks details here."),
      ]),

      sectionPreset("Adventurers & Mercenary Work", "section adventurers-mercenaries", [
        detailsListBlock([
          { label: "Common Quests & Jobs", value: "[Hunting monsters, retrieving artifacts, political assassinations.]" },
          { label: "Bounty Board", value: "[List of wanted criminals, beasts, or rogue AI.]" },
          { label: "Guilds & Organizations for Adventurers", value: "[Who offers work and resources?]" },
        ]),
        richTextBlock("Add adventurers and mercenary work details here."),
      ]),

      sectionPreset("Current Events", "section current-events", [
        richTextBlock("Add current events here."),
      ]),

      sectionPreset("Plot Hooks", "section plot-hooks", [
        richTextBlock("Add plot hooks here."),
      ]),

      sectionPreset("Hidden Details", "section hidden-details", [
        richTextBlock("Add hidden details here."),
      ]),

      sectionPreset("General Notes", "section general-notes", [
        richTextBlock("Add general notes here."),
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
        ]),
        richTextBlock("Add education and knowledge details here."),
      ]),
      sectionPreset("Culture, Arts & Entertainment", "section culture-arts", [
        detailsListBlock([
          { label: "Music & Performing Arts", value: "[Bards, holographic opera, psychic concerts.]" },
          { label: "Festivals & Holidays", value: "[Ritual sacrifice days, AI awakening celebrations, etc.]" },
          { label: "Cuisine & Food Culture", value: "[Elven wine, synthetic protein cubes, soul-infused delicacies.]" },
          { label: "Fashion & Dress", value: "[Steampunk, cybernetic enhancements, enchanted robes.]" }
        ]),
        richTextBlock("Add culture, arts, and entertainment details here."),
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
        ]),
        richTextBlock("Add religion and mythology details here."),
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
