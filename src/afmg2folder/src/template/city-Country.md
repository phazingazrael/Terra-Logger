---
Pronounced: "{{name}}"
Alias: 
 - {{name}}
 - {{fullName}}
 - {{countryFull}}
NoteIcon: {{Settlement}}
Type: [{{size}}, {{type}}]
Population: {{populationout}}
Theme: {{type}}
Region: {{country}}
Defences: 
GovtType: {{govName}} ({{govForm}})
Religions:
Imports:
Exports:
#customYMLTags
creation_date: <%+ tp.file.creation_date("dddd Do MMMM YYYY HH:mm:ss") %> 
modification_date: <%+ tp.file.last_modified_date("dddd Do MMMM YYYY HH:mm:ss") %>
Features:
{{#Features}}
 - {{name}}
{{/Features}}
Country: {{country}}
tags:
 - Location
 - {{Settlement}}
 - {{name}}
 - {{capitalCity}}
{{#Features}}
 - {{name}}
{{/Features}}
{{capitalCityTag}}
---


> [!infobox]
> # `=this.file.name`
> **Pronounced:**  "`=this.Pronounced`"
> ![[{{countryFull}}.png|cover hm-sm]]
> ###### Info
>  |
> ---|---|
> **Alias** | `=this.alias` |
> **Type** | `=this.type` |
> **Population** | `=this.population` |
> **Theme** | `=this.theme` |
> **Region** | `=link(this.Region)` |
> **Terrain** | `=this.terrain` |
> ###### Politics
>  |
> ---|---|
> **Ruler(s)** | TBD |
> **Leaders** | TBD |
> **Govt Type** | `=this.GovtType` |
> **Defenses** | `=this.defences` |
> **Religion(s)** | `=link(this.religions)` |
> ###### Commerce
>  |
> ---|---|
> **Imports** | `=this.imports` |
> **Exports** | `=this.exports` |
> ###### Groups
> [[Group Database|Add New Group]]
> ```dataview 
table join(Type, ", ") AS Type
WHERE econtains(Location, this.file.name) AND contains(NoteIcon, "Group")
SORT Type ASC

# **`=this.file.name`**
> [!info|bg-c-purple]- Overview
TBD

## Map
> ```leaflet
> id: {{name}}
> tileServer: https://phazingazrael.github.io/TTRPGKB/Map/{z}/{x}/{y}.png
> height: 550px
> width: 550px
> lat: 50
> long: 50
> minZoom: 1
> maxZoom: 10
> defaultZoom: 1
> osmLayer: false
> scale: 1
> darkMode: false
> ```

## Notable Locations

> [!info|bg-c-purple]- Districts
TBD

> ###### Notable Shops/Services
> [[Shop & Service Database|Add New Shop/Service]]
> ```dataview
table join(Type, ", ") AS Type, join(link(AffiliatedGroup), ", ") AS "Affiliated Group(s)"
WHERE Location = this.file.name AND contains(NoteIcon, "Shop")
SORT file.name ASC

> ###### Notable Points of Interest
> [[POI Database|Add New Point of Interest]]
> ```dataview
table join(Type, ", ") AS Type, join(link(AffiliatedGroup), ", ") AS "Affiliated Group(s)"
WHERE Location = this.file.name AND contains(NoteIcon, "POI")
SORT file.name ASC

## Notable Characters

> ###### Notable Characters
> [[NPC Database|Add New NPC]]
> ```dataview
table Art, Pronouns, Party1Standing AS "Party 1 Standing", join(Occupation, ", ") AS "Occupation(s)", join(link(AssociatedGroup), ", ") AS "Associated Group(s)", join(link(AssociatedReligion), ", ") AS "Associated Religion(s)"
WHERE Location = this.file.name AND contains(NoteIcon, "Character") AND !contains(Condition, "Dead")
SORT file.name ASC

## History
TBD

## DM Notes
### Plot Hooks


### Hidden Details


### General Notes