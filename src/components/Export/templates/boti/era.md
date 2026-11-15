---
BANNER: "[[Lore-Banner.jpg]]"
NoteIcon: Lore
Name: |-
  {{name}}
Type: Era
EraId: "{{_id}}"
MapId: |-
  {{mapId}}
ShortName: |-
  {{shortName}}
Status: "{{status}}"
FirstYear: {{firstYear}}
FinalYear: {{finalYear}}
Length: {{length}}
tags: []
---

> [!infobox]
> # `=this.Name`
> ###### Chronology
> | | |
> | --- | --- |
> | **Abbreviation** | `=this.ShortName` |
> | **Status** | `=this.Status` |
> | **First Year** | `=this.FirstYear` |
> | **Present / Final Year** | `=this.FinalYear` |
> | **Years Elapsed / Duration** | `=this.Length` |

# `=this.Name`

> [!overview]- Overview
> {{description}}

> [!history]- Chronology
> <!-- Exporter: generate the appropriate chronology from local era years. -->
> **Beginning:** Year `=this.FirstYear` `=this.ShortName`
>
> **Present / Final Recorded Year:** Year `=this.FinalYear` `=this.ShortName`
>
> **Recorded Duration:** `=this.Length` years (inclusive)
>
> <!-- Exporter: for Status=current, state "Ongoing — the final recorded year is the present year." For Status=previous, state "Concluded — the final year is the end of this era." -->

> [!story]- Notable Events
> <!-- Preserve authored Atlas Notable Events as written. No generated event dates. -->

> [!notes]- Notes
> <!-- Preserve authored Atlas Notes as written. -->

<!-- Exporter: append other authored Atlas sections in their original order, excluding duplicate generated Header, Overview, and Chronology sections. Do not output this comment. -->
