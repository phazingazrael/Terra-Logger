---
BANNER: "[[tatiana-zhukova-wVRrpDI6qB0-unsplash.jpg]]"
Name: {{name}}
Aliases: {{name}}
Capital: {{#capital}}Yes{{/capital}}{{^capital}}No{{/capital}}
Country: {{country.name}}
Defences:
GovtType: {{country.govForm}}
Imports:
Exports:
Leaders:
Features:
{{#features}}
  - {{.}}
{{/features}}
Population: {{population}}
Pronounced:
Religions:
Rulers:
Terrain:
Theme: {{type}}
Type: {{type}}
tags:
{{#tags}}
  - {{Name}}
{{/tags}}
---

> [!infobox]
> # City of `=this.Name`
> **Pronounced:**  "`=this.Pronounced`"
> ![[{{name}}.svg]]
> ###### Info
>  |
> ---|---|
> **Alias** | `=this.Aliases` |
> **Type** | `=this.Type` |
> **Capital** | `=this.Capital` |
> **Population** | `=this.Population` |
> **Theme** | `=this.Theme` |
> **Country** | `=link(this.Country)` |
> **Terrain** | `=this.Terrain` |
> **Features** | `=join(this.Features,", ")` |
> **Map Link** | [City Map]({{mapLink}}) |
> ###### Politics
>  |
> ---|---|
> **Rulers** | `=this.Rulers` |
> **Leaders** | `=this.Leaders` |
> **Govt Type** | `=this.GovtType` ({{country.govName}}) |
> **Defenses** | `=this.Defences` |
> **Religions** | `=link(this.Religions)` |
> ###### Commerce
>  |
> ---|---|
> **Imports** | `=this.Imports` |
> **Exports** | `=this.Exports` |
> ###### Description
> {{description}}

# **`=this.Name`**
> [!recite]- Introduction
> {{description}}

> [!districts]- Districts
> [[🪧 District Database|🪧Add New District]]
> ```dataview
> table join(aliases, ", ") AS Aliases, join(type, ", ") AS Types
> WHERE Settlement = this.Name AND contains(NoteIcon, "District")
> SORT file.name ASC

> [!shops]- Shops
> [[💲 Shop & Service Database|📝Add New Shop/Service]]
> ```dataview
> table join(aliases, ", ") AS Aliases, join(type, ", ") AS Types
> WHERE Location = this.Name AND contains(NoteIcon, "Shop")
> SORT file.name ASC

> [!pois]- Points of Interest
> [[❓ POI Database|📝Add New Point of Interest]]
> ```dataview
> table join(aliases, ", ") AS Aliases, join(type, ", ") AS Types
> WHERE Location = this.Name AND contains(NoteIcon, "POI")
> SORT file.name ASC

> [!groups]- Groups
> [[🔰 Group Database| 🔰 Add New Group]]
> ```dataview
> table join(aliases, ", ") AS Aliases, join(type, ", ") AS Types
> WHERE econtains(Location, this.Name) AND contains(NoteIcon, "Group")
> SORT file.name ASC

> [!characters]- Characters
> [[👨‍👩‍👧‍👦 NPC Database| 📝Add New NPC]]
> ```dataview
> table join(aliases, ", ") AS Aliases, join(occupation, ", ") AS "Occupations", join(link(associatedgroup), ", ") AS "Groups"
> WHERE Location = this.Name AND contains(NoteIcon, "Character") AND !contains(Condition, "Dead")
> SORT file.name ASC

> [!npcs]- NPC's
> [[💲 Shop & Service Database|📝Add New Shop/Service]]
> ```dataview
> table join(aliases, ", ") AS Aliases, join(type, ", ") AS Types
> WHERE Location = this.Name AND contains(NoteIcon, "Shop")
> SORT file.name ASC


>[!history]- History
> Provide a historical overview, including legendary origins, significant battles, magical events, or technological advancements.
>> [!notes]- Notable Founding Myths/Legends
>> Ancient tales about how the city was formed or its divine/magical origins.
>
>> [!notes]- Major Wars & Conflicts
>> Significant wars, galactic conflicts, magical wars, or civil uprisings.
>
>> [!notes]- Epochs & Eras
>> Different historical periods, dynasties, or interstellar ages.
>
>> [!notes]- Notable Leaders & Rulers
>> Kings, Emperors, Warlords, AI Governors, etc.

>[!regions]- Geography & Environment
>> [!notes]- Location
>> Describe location within the world, dimension, or space sector.
>
>> [!notes]- Climate & Atmosphere
>> Earth-like, toxic, magical storms, artificial climate, etc.
>
>> [!notes]- Topography & Terrain
>> Floating islands, underground caverns, space stations, etc.
>
>> [!notes]- Planar/Dimensional Traits
>> Is it tied to another plane? Does time move differently here?
>
>> [!notes]- Unique Natural Features
>> Magical ley lines, sentient forests, shifting deserts, etc.

> [!resources]- Economy & Trade
>> [!notes]- Major Industries
>> Alchemy, soul-forging, mecha production, space mining, etc.
>
>> [!notes]- Currency & Trade
>> Gold coins, credits, mana crystals, barter system, etc.
>
>> [!notes]- Notable Guilds & Corporations
>> Merchant houses, cybernetic megacorps, thieves’ guilds, etc.
>
>> [!notes]- Imports & Exports
>> What does the city rely on, and what does it supply to others?
>
>> [!notes]- Black Market & Illicit Trade
>> Contraband, smugglers, underground syndicates.

> [!government]- Government & Power Structure
>> [!notes]- Government Type
>> Monarchy, Theocracy, AI-Controlled, Mage Council, etc.
>
>> [!notes]- Current Ruler(s)
>> King, High Priestess, AI Overlord, Elder Council, etc.
>> `=this.Rulers`
>
>> [!notes]- Noble Houses & Factions
>> Major power groups, noble families, rival factions.
>
>> [!notes]- Laws & Justice System
>> Trial by combat? Magic-enforced law? A dystopian police state?
>
>> [!notes]- Corruption Level
>> Low, moderate, high, controlled by crime syndicates.

> [!demographics]- Demographics & Society
>> [!notes]- Population Growth & Migration
>> Stable, declining, booming, dependent on magic/artificial births.
>
>> [!notes]- Ethnic & Racial Composition
>> Humans, Elves, Orcs, Androids, Clones, etc.
>
>> [!notes]- Language & Scripts
>> Common tongue, ancient runes, digital code-based speech.
>
>> [!notes]- Religion & Deities
>> Worship of gods, forgotten cosmic entities, AI prophets.
>
>> [!notes]- Caste/Class System
>> Strict hierarchy, meritocracy, anarchist communes, slave societies.

> [!military]- Military & Defense
>> [!notes]- City Guard & Enforcers
>> Knights, robotic enforcers, spectral guardians, etc.
>
>> [!notes]- Standing Army/Navy
>> Size and structure of land, sea, air, or space forces.
>
>> [!notes]- Walls & Defenses
>> Titanium barriers, magical shields, psychic wards.
>
>> [!notes]- Notable Weapons & Technology
>> Arcane cannons, plasma rifles, necromantic constructs.
>
>> [!notes]- Mercenaries & Private Forces
>> Who offers protection outside of government control?

> [!travel]- Transportation & Infrastructure
>> [!notes]- Public Transit
>> Horse-drawn carriages, teleportation circles, maglev trains, hovercraft.
>
>> [!notes]- Portals & Dimensional Gates
>> Natural rifts, constructed portals, wormholes.
>
>> [!notes]- Skyports & Spaceports
>> Landing zones for airships, starships, or mecha units.
>
>> [!notes]- Roads & Paths
>> Ancient cobblestone roads, bioluminescent highways, self-assembling roads.

> [!education]- Education & Knowledge
>> [!notes]- Academies & Universities
>> Magical academies, science research institutes, AI learning centers.
>
>> [!notes]- Forbidden Knowledge & Secret Societies
>> Cults, hidden libraries, esoteric scholars.
>
>> [!notes]- Notable Thinkers & Researchers
>> Famous wizards, AI philosophers, other intellectuals.
>
>> [!notes]- Libraries & Archives
>> World’s largest collection of spell tomes, AI-encrypted data vaults.

> [!culture]- Culture, Arts & Entertainment
>> [!notes]- Music & Performing Arts
>> Bards, holographic opera, psychic concerts.
>
>> [!notes]- Festivals & Holidays
>> Ritual sacrifice days, AI awakening celebrations, etc.
>
>> [!notes]- Cuisine & Food Culture
>> Elven wine, synthetic protein cubes, soul-infused delicacies.
>
>> [!notes]- Fashion & Dress
>> Steampunk, cybernetic enhancements, enchanted robes.

> [!sports]- Sports & Competitive Games
>> [!notes]- Popular Sports
>> Dragon racing, zero-gravity combat sports, golem battles.
>
>> [!notes]- Underground Fighting Rings
>> Gladiatorial combat, beast fights, cyber duels.
>
>> [!notes]- Famous Athletes & Champions
>> Legendary warriors, gladiators, virtual-realm champions.

> [!magic]- Magic & Technology
>
>> [!notes]- Level of Magic/Tech Advancement
>> Medieval, arcane-punk, cyberpunk, fully automated AI rule.
>
>> [!notes]- Common Spells & Technologies
>> Necromancy, sentient AI, cyber-implants, flying ships.
>
>> [!notes]- Power Sources
>> Solar energy, eldritch energy, soul crystals, antimatter cores.
>
>> [!notes]- Lost or Ancient Technology
>> Remnants of an old civilization, dark forbidden knowledge.
>
>> [!notes]- Current Scientific & Magical Research
>> Teleportation experiments, interdimensional research.

> [!secrets]- Crime & Underworld
>> [!notes]- Thieves' Guilds & Crime Syndicates
>> Who controls the underground economy?
>
>> [!notes]- Black Markets & Smuggling Rings
>> Illegal tech, cursed artifacts, ancient relics.
>
>> [!notes]- Assassins & Mercenaries
>> Infamous killers, rogue mages, bounty hunters.
>
>> [!notes]- Notable Criminals & Outlaws
>> Legendary thieves, escaped war criminals, anarchist hackers.

> [!religion]- Religion & Mythology
>
>> [!notes]- Gods, Demons & Cosmic Entities
>> Who is worshiped or feared in the city?
>
>> [!notes]- Sacred Sites & Temples
>> Massive cathedrals, shrines hidden in floating cities.
>
>> [!notes]- Religious Factions & Cults
>> What groups enforce (or subvert) faith?
>
>> [!notes]- Miracles & Divine Interventions
>> Recent divine events or mythological sightings.

> [!landmarks]- Notable Locations & Landmarks
>> [!notes]- The Great Palace/Throne Room
>> Seat of power, filled with ancient relics.
>
>> [!notes]- The Arcane University/Tech Lab
>> Center of magical/scientific advancement.
>
>> [!notes]- The Underbelly/Sewers/Shadow City
>> Underground city full of secrets.
>
>> [!notes]- The Astral Tower/Observatory
>> Study of other planes, stars, and cosmic entities.

> [!government]- Sister Cities & Interstellar Relations
>List of allied cities, rival cities, or otherworldly diplomatic ties.

> [!groups]- Notable Figures & Legends
List of influential people, such as rulers, warriors, philosophers, criminals, and deities.

> [!guilds]- Adventurers & Mercenary Work
>> [!notes]- Common Quests & Jobs
>> Hunting monsters, retrieving artifacts, political assassinations.
>
>> [!notes]- Bounty Board
>> List of wanted criminals, beasts, or rogue AI.
>
>> [!notes]- Guilds & Organizations for Adventurers
>> Who offers work and resources?

> [!notes]- Notes
>

> [!story]- Plot Hooks
>

> [!secrets]- Hidden Details
>

> [!notes]- General Notes
>
