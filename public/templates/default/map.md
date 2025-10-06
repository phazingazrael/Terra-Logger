# {{info.name}}
![[World Map.svg]]


## Map Overview
- **Map ID:** {{id}}
- **Seed:** {{info.seed}}
- **Dimensions:** {{info.width}} × {{info.height}}
- **Version:** {{info.ver}}
- **Year:** {{settings.options.year}}
- **Era:** {{settings.options.era}} ({{settings.options.eraShort}})

## General Map Settings
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

## Climate & Environment
- **Equator Temperature:** {{settings.options.temperatureEquator}}°F
- **North Pole Temperature:** {{settings.options.temperatureNorthPole}}°F
- **South Pole Temperature:** {{settings.options.temperatureSouthPole}}°F
- **Winds:** {{#settings.options.winds}}{{.}}°, {{/settings.options.winds}}
- **State Labels Mode:** {{settings.options.stateLabelsMode}}

## Military Overview
The country maintains multiple types of military forces, each adapted to rural or urban environments with different crew and power levels.

| Icon | Unit Type | Rural Presence | Urban Presence | Crew | Power | Category | Separate? |
|------|-----------|----------------|----------------|------|-------|---------|-----------|
{{#settings.options.militaryTypes}}
| {{icon}} | {{name}} | {{rural}} | {{urban}} | {{crew}} | {{power}} | {{type}} | {{#separate}}Yes{{/separate}}{{^separate}}No{{/separate}} |
{{/settings.options.militaryTypes}}

## Urban & Population Settings
- **Urbanization:** {{settings.urbanization}} (scale of 1-10)
- **Population Rate:** {{settings.populationRate}}
- **Urban Density:** {{settings.urbanDensity}}
- **Pin Notes Enabled:** {{#settings.options.pinNotes}}Yes{{/settings.options.pinNotes}}{{^settings.options.pinNotes}}No{{/settings.options.pinNotes}}
