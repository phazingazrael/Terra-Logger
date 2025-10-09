---
BANNER: "[[World Map.svg]]"
NoteIcon: Map
Width:  "{{info.width}}"
Height: "{{info.height}}"
Name: "{{settings.mapName}}"
Seed: "{{info.seed}}"
Ver: "{{info.ver}}"
Era: "{{settings.options.era}}"
EraShort: "{{settings.options.eraShort}}"
TemperatureEquator: "{{settings.options.temperatureEquator}}"
TemperatureNorthPole: "{{settings.options.temperatureNorthPole}}"
TemperatureSouthPole: "{{settings.options.temperatureSouthPole}}"
Year: "{{settings.options.year}}"
tags:
Winds:
 - "90° North: {{settings.options.winds[0]}}"
 - "60° North: {{settings.options.winds[1]}}"
 - "30° North: {{settings.options.winds[2]}}"
 - "30° South: {{settings.options.winds[3]}}"
 - "60° South: {{settings.options.winds[4]}}"
 - "90° South: {{settings.options.winds[5]}}"
---

> [!infobox]
> # `=this.Name`
> **Pronounced:**  "`=this.Pronounced`"
> ![[PlaceholderImage.png]]
> ###### Info
>  |
> ---|---|
> **Aliases** | `=this.Aliases` |
> **Type** | `=this.NoteIcon` |
> **Width × Height** | `=this.Width` × `=this.Height` |
> **Era (Year)** | `=this.Era` (`=this.Year`) |
> **Version** | `=this.Ver` |
> **Seed** | `=this.Seed` |
> **Planet/Plane** | `=this.PlanetPlane` |


# **`=this.Name`**

> [!overview]- Overview
> Purpose of this map (world, continent, region), what it depicts, and how to read it.

> [!Regions]- Regions & Zones
> Named regions, political divisions, or biome zones referenced on the map.

> [!landmarks]- Landmarks
> Mountains, canyons, great forests, monuments, megastructures, etc.

> [!Travel]- Routes & Navigation
> Roads, sea lanes, air corridors, portals; hazards or checkpoints.

> [!Weather]- Climate & Biomes
> Prevailing winds and temperature notes (use if relevant)
> - **Winds:**
>   - `=this.Winds[0]`
>   - `=this.Winds[1]`
>   - `=this.Winds[2]`
>   - `=this.Winds[3]`
>   - `=this.Winds[4]`
>   - `=this.Winds[5]`
> - **Equator Temp:** `=this.TemperatureEquator`
> - **North Pole:** `=this.TemperatureNorthPole`
> - **South Pole:** `=this.TemperatureSouthPole`

> [!History]- Historical Changes
> Borders, coastlines, or settlements that have shifted over time.

> [!Events]- Recent Events
> Quakes, eruptions, invasions, discoveries—anything that changes the map.

> [!Notes]- Notes
> Scratchpad for reminders, to-dos, and references.

> [!Rumors]- Rumors
> Unverified places, hidden routes, or alleged lost cities.

> [!Secrets]- Secrets
> GM-only locations, concealed passages, or false labels.

> [!lore]- Lore
> Origin myths, ancient cartographers, or legendary maps tied to this world.

---

### Full Azgaar Map Info.

#### Info
- **Name:** {{info.name}}
- **Seed:** {{info.seed}}
- **Dimensions:** {{info.width}} × {{info.height}}
- **Version:** {{info.ver}}

#### Map Settings
- **Map Name:** {{settings.mapName}}
- **Distance Unit:** {{settings.distanceUnit}}
- **Distance Scale:** {{settings.distanceScale}}
- **Area Unit:** {{settings.areaUnit}}
- **Height Unit:** {{settings.heightUnit}}
- **Height Exponent:** {{settings.heightExponent}}
- **Temperature Scale:** {{settings.temperatureScale}}
- **Population Rate:** {{settings.populationRate}}
- **Urbanization Level:** {{settings.urbanization}}
- **Map Size:** {{settings.mapSize}}
- **Latitude Base:** {{settings.latitude0}}
- **Precipitation Value:** {{settings.prec}}
- **Hide Labels:** {{settings.hideLabels}}
- **Style Preset:** {{settings.stylePreset}}
- **Rescale Labels:** {{settings.rescaleLabels}}
- **Urban Density:** {{settings.urbanDensity}}

## Options
- **Pin Notes:** {{settings.options.pinNotes}}
- **Winds (degrees):** {{#settings.options.winds}}{{.}}°, {{/settings.options.winds}}
- **Equator Temperature:** {{settings.options.temperatureEquator}}
- **North Pole Temperature:** {{settings.options.temperatureNorthPole}}
- **South Pole Temperature:** {{settings.options.temperatureSouthPole}}
- **State Labels Mode:** {{settings.options.stateLabelsMode}}
- **Year:** {{settings.options.year}}
- **Era:** {{settings.options.era}}
- **EraShort**: {{settings.options.eraShort}}

## Military Types

| Icon | Unit Type | Rural Presence | Urban Presence | Crew | Power | Category | Separate? |
|------|-----------|----------------|----------------|------|-------|---------|-----------|
{{#settings.options.militaryTypes}}
| {{icon}} | {{name}} | {{rural}} | {{urban}} | {{crew}} | {{power}} | {{type}} | {{#separate}}Yes{{/separate}}{{^separate}}No{{/separate}} |
{{/settings.options.militaryTypes}}
