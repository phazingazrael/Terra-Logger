import type { TLCity } from "../../../definitions/TerraLogger";
import type { AtlasAdapter, AtlasContent } from "../../../definitions/Atlas";
import { commonBlockPresets, commonSectionPresets } from "./shared";
import { clear, computedBlock, createContentShell, descriptionBlock, detailsListBlock, entityChipListBlock, entitySection, richTextBlock, sectionPreset } from "../core/presets";

function createCityContent(entity: TLCity): AtlasContent {
  return createContentShell({
    sourceType: "city",
    entityId: entity._id,
    mapId: entity.mapId,
    title: entity.name,
    layout: "content-grid",
    className: "content-grid",
    sections: [
      entitySection("Header", "section header", [computedBlock("cityHeader", "header", "city")], clear),
      entitySection("Description", "section description", [
        descriptionBlock(),
      ]),
      entitySection("Features", "section featuresList", [entityChipListBlock("Features", "features")]),
      entitySection("Map", "section map-link", [computedBlock("cityMapLink", "Map Link", "city.mapLink", { text: "🗺️ View City Map" })]),
      sectionPreset("History", "section history", [detailsListBlock([
        { label: "Notable Founding Myths/Legends", value: "[Ancient tales about how the city was formed or its divine/magical origins.]" },
        { label: "Major Wars & Conflicts", value: "[Significant wars, galactic conflicts, magical wars, or civil uprisings.]" },
        { label: "Epochs & Eras", value: "[Different historical periods, dynasties, or interstellar ages.]" },
        { label: "Notable Leaders & Rulers", value: "[Kings, Emperors, Warlords, AI Governors, etc.]" }
      ]), richTextBlock("Add city history here.")]),
      sectionPreset("Economy & Trade", "section economy-trade", [
        detailsListBlock([
          { label: "Major Industries & Exports", value: "[Alchemy, soul-forging, mecha production, space mining, etc.]" },
          { label: "Currency & Trade", value: "[Gold coins, credits, mana crystals, barter system, etc.]" },
          { label: "Notable Guilds & Corporations", value: "[Merchant houses, cybernetic megacorps, thieves guilds, etc.]" },
          { label: "Imports & Exports", value: "[What does the city rely on, and what does it supply to others?]" },
          { label: "Black Market & Illicit Trade", value: "[Contraband, smugglers, underground syndicates.]" },
        ]),
        richTextBlock("Add economy and trade details here."),
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
      sectionPreset("Government & Power Structure", "section government-power", [
        detailsListBlock([
          { label: "Government Type", value: "[Monarchy, Theocracy, AI-Controlled, Mage Council, etc.]" },
          { label: "Current Ruler(s)", value: "[King, High Priestess, AI Overlord, Elder Council, etc.]" },
          { label: "Noble Houses & Factions", value: "[Major power groups, noble families, rival factions.]" },
          { label: "Laws & Justice System", value: "[Trial by combat? Magic-enforced law? A dystopian police state?]" },
          { label: "Corruption Level", value: "[Low, moderate, high, controlled by crime syndicates.]" },
        ]),
        richTextBlock("Add local government details here."),
      ]),
      sectionPreset("Demographics & Society", "section demographics-society", [
        detailsListBlock([
          { label: "Population Growth & Migration", value: "[Stable, declining, booming, dependent on magic/artificial births.]" },
          { label: "Ethnic & Racial Composition", value: "[Humans, Elves, Orcs, Androids, Clones, etc.]" },
          { label: "Language & Scripts", value: "[Common tongue, ancient runes, digital code-based speech.]" },
          { label: "Religion & Deities", value: "[Worship of gods, forgotten cosmic entities, AI prophets.]" },
          { label: "Caste/Class System", value: "[Strict hierarchy, meritocracy, anarchist communes, slave societies.]" },
        ])
        , richTextBlock("Add demographics and society details here."),
      ]),
      sectionPreset("Military & Defense", "section military-defense", [
        detailsListBlock([
          { label: "City Guard & Enforcers", value: "[Knights, robotic enforcers, spectral guardians, etc.]" },
          { label: "Standing Army/Navy", value: "[Size and structure of land, sea, air, or space forces.]" },
          { label: "Walls & Defenses", value: "[Titanium barriers, magical shields, psychic wards.]" },
          { label: "Notable Weapons & Technology", value: "[Arcane cannons, plasma rifles, necromantic constructs.]" },
          { label: "Mercenaries & Private Forces", value: "[Who offers protection outside of government control?]" },
        ]),
        richTextBlock("Add military and defense details here."),
      ]),
      sectionPreset("Education & Knowledge", "section education-knowledge", [
        detailsListBlock([
          { label: "Academies & Universities", value: "[Magical academies, science research institutes, AI learning centers.]" },
          { label: "Forbidden Knowledge & Secret Societies", value: "[Cults, hidden libraries, esoteric scholars.]" },
          { label: "Notable Thinkers & Researchers", value: "[Famous wizards, AI philosophers, other intellectuals.]" },
          { label: "Libraries & Archives", value: "[World’s largest collection of spell tomes, AI-encrypted data vaults.]" },
          { label: "Unique Local Knowledge", value: "[City-specific lore, inventions, magical secrets.]" },
        ]),
        richTextBlock("Add education and knowledge details here."),
      ]),
      sectionPreset("Culture, Arts & Entertainment", "section culture-arts", [
        detailsListBlock([
          { label: "Music & Performing Arts", value: "[Bards, holographic opera, psychic concerts.]" },
          { label: "Festivals & Holidays", value: "[Ritual sacrifice days, AI awakening celebrations, etc.]" },
          { label: "Cuisine & Food Culture", value: "[Elven wine, synthetic protein cubes, soul-infused delicacies.]" },
          { label: "Fashion & Dress", value: "[Steampunk, cybernetic enhancements, enchanted robes.]" },
        ]),
        richTextBlock("Add culture, arts, and entertainment details here."),
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
      sectionPreset("Religion & Mythology", "section religion-mythology", [
        detailsListBlock([
          { label: "Gods, Demons & Cosmic Entities", value: "[Who is worshiped or feared in the city?]" },
          { label: "Sacred Sites & Temples", value: "[Massive cathedrals, shrines hidden in floating cities.]" },
          { label: "Religious Factions & Cults", value: "[What groups enforce (or subvert) faith?]" },
          { label: "Miracles & Divine Interventions", value: "[Recent divine events or mythological sightings.]" },
        ]),
        richTextBlock("Add religion and mythology details here."),
      ]),
      sectionPreset("Notable Locations & Landmarks", "section notable-locations", [
        detailsListBlock([
          { label: "The Great Palace/Throne Room", value: "[Seat of power, filled with ancient relics.]" },
          { label: "The Arcane University/Tech Lab", value: "[Center of magical/scientific advancement.]" },
          { label: "The Astral Tower/Observatory", value: "[Study of other planes, stars, and cosmic entities.]" },
          { label: "The Underbelly/Sewers/Shadow City", value: "[Underground city full of secrets.]" },
        ]),
        richTextBlock("Add notable locations and landmarks details here."),
      ]),
      sectionPreset("Sister Cities & Relations", "section sister-cities", [
        detailsListBlock([
          { label: "Sister Cities & Diplomatic Ties", value: "[List of allied cities, rival cities, or otherworldly diplomatic ties.]" },
          { label: "Rival Cities & Enemies", value: "[Who are the city’s main rivals or enemies?]" },
          { label: "Trade Partners & Economic Ties", value: "[Which cities or factions does it trade with?]" },
        ]),
        richTextBlock("Add sister cities and other connections details here."),
      ]),
      sectionPreset("Notable Figures & Legends", "section notable-figures", [
        detailsListBlock([
          { label: "Influential Figures", value: "[List of influential people, such as rulers, warriors, philosophers, criminals, and deities.]" },
        ]),
        richTextBlock("Add notable figures and legends details here."),
      ]),
      sectionPreset("Adventurers & Mercenary Work", "section adventurers-mercenaries", [
        detailsListBlock([
          { label: "Common Quests & Jobs", value: "[Hunting monsters, retrieving artifacts, political assassinations.]" },
          { label: "Bounty Board", value: "[List of wanted criminals, beasts, or rogue AI.]" },
          { label: "Guilds & Organizations for Adventurers", value: "[Who offers work and resources?]" },
        ]),
        richTextBlock("Add adventurers and mercenary work details here."),
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

      sectionPreset("Plot Hooks", "section plot-hooks", [
        richTextBlock("Add plot hooks here."),
      ]),

      sectionPreset("Hidden Details", "section hidden-details", [
        richTextBlock("Add hidden details here."),
      ]),

      sectionPreset("General Notes", "section general-notes", [
        richTextBlock("Add general notes here."),
      ]),
      entitySection("Tags", "section tags", [entityChipListBlock("Tags", "tags")]),
    ],
  });
}

export const cityAdapter: AtlasAdapter<"city"> = {
  sourceType: "city",
  label: "City",
  defaultLayout: "content-grid",
  getEntityId: (entity) => entity._id,
  getEntityTitle: (entity) => entity.name,
  createDefaultContent: createCityContent,
  sectionPresets: commonSectionPresets<"city">(),
  blockPresets: commonBlockPresets<"city">(),
};
