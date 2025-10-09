---
BANNER: "[[Country-Banner.png|145]]"
Name:
Aliases:
GovtType: "{{political.form}}"
Leaders:
NoteIcon: Country
PlanetPlane:
Pronounced:
Religions:
Rulers:
Terrain:
Theme:
tags:
{{#tags}}
  - "{{Name}}"
{{/tags}}
---

> [!infobox]
> # Country of {{name}}
> **Pronounced:**  "{{name}}"
> ![[{{name}}.svg]]
> ###### Info
>  |
> ---|---|
> **Aliases** | {{name}}, {{nameFull}} |
> **Theme** | {{type}} |
> **Planet** |  |
> **Terrain** |  |
> ###### Politics
>  |
> ---|---|
> **Rulers** |  |
> **Leaders** |  |
> **Govt Type** | {{political.formName}} ({{political.form}}) |
> **Religions** |  |
> ###### Population
>  |
> ---|---|
  > **Rural** | {{population.rural}} |
> **Urban** | {{population.urban}} |
> **Total** | {{population.total}} |
> ###### Description
> {{description}}

# **`=this.Name`**
> [!overview]- Overview
> {{description}}

> [!districts]- Areas
> ```base
> filters:
>   and:
>     - file.inFolder("World/05. Areas")
>     - and:
>         - file.hasProperty("Name")
> views:
>   - type: table
>     name: Table
>     limit: 50
>     order:
>       - file.name
>       - Name
>       - Type
>       - Category
>       - Climate
>       - ConnectedAreas
>       - Control
>       - Encounters
>       - Hazards
>       - Landmarks
>       - ParentRegion
>       - Resources
>       - Settlements
>       - Terrain
>       - tags
>   - type: cards
>     name: Cards
>     order:
>       - file.name
>       - Name
> ```

> [!cities]- Cities
> ```base
> filters:
>   and:
>     - file.inFolder("World/06. Cities")
>     - and:
>         - file.hasProperty("Name")
> views:
>   - type: table
>     name: Table
>     limit: 50
>     order:
>       - file.name
>       - Name
>       - Pronounced
>       - Type
>       - Country
>       - Features
>       - GovtType
>       - Leaders
>       - Rulers
>       - Population
>       - Theme
>       - tags
>       - Imports
>       - Exports
>   - type: cards
>     name: Cards
>     order:
>       - file.name
>       - Name
> ```

> [!landmarks]- Landmarks
> ```base
> filters:
>   and:
>     - file.inFolder("World/08. Landmarks")
>     - and:
>         - file.hasProperty("Name")
> views:
>   - type: table
>     name: Table
>     limit: 50
>     order:
>       - file.name
>       - Name
>       - Pronounced
>       - Country
>       - Type
>       - Owners
>       - Staff
>       - tags
>   - type: cards
>     name: Cards
>     order:
>       - file.name
>       - Name
> ```

> [!groups]- Groups
> ```base
> filters:
>   and:
>     - file.inFolder("World/12. Groups")
>     - and:
>         - file.hasProperty("Name")
> views:
>   - type: table
>     name: Table
>     limit: 50
>     order:
>       - file.name
>       - Pronounced
>       - Name
>       - Type
>       - Location
>       - HQ
>       - AssociatedReligion
>       - Alignment
>       - tags
>   - type: cards
>     name: Cards
>     order:
>       - file.name
>       - Name
> ```

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
>> [!notes- Government Type
>> Monarchy, Theocracy, AI-Controlled, Mage Council, etc.
>
>> [!notes]- Current Ruler(s)
>> King, High Priestess, AI Overlord, Elder Council, etc.
>
>> [!notes]- Noble Houses & Factions
>> Major power groups, noble families, rival factions.
>
>> [!notes]- Laws & Justice System
>> Trial by combat? Magic-enforced law? A dystopian police state?
>
>> [!notes]- Corruption Level
>> Low, moderate, high, controlled by crime syndicates.


>[!npcs]- Politics & Relationships
>> [!notes]- Military Units
>>
>
>> [!notes]- Diplomatic Relations
>>
>
>> [!notes]- Neighbors
>>

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
>
>> [!notes]- War Campaigns
>> {{#warCampaigns}}
>>   - {{.}}
>> {{/warCampaigns}}
>> {{^warCampaigns}}
>> No war campaigns recorded.
>> {{/warCampaigns}}

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

> [!events]- Current Events
>

> [!story]- Plot Hooks
>

> [!secrets]- Hidden Details
>

> [!notes]- General Notes
>
