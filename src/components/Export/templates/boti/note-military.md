---
BANNER:
# --- Identification ---
NoteIcon: Note
Type: "Military"
Name: "{{name}}"
# --- Content ---
Content: "{{legend}}"
Allegiance:
Commander:
Status:     # active, garrisoned, marching, routed
LastSeen:   # date or session number
---

> [!infobox]
> # `=this.file.name`
> ###### Info
>  |
> ---|---|
> **Type** | `=this.Type` |
> **Allegiance** | `=this.Allegiance` |
> **Commander** | `=this.Commander` |
> **Status** | `=this.Status` |
> **Last Seen** | `=this.LastSeen` |

# **`=this.file.name`**

> [!military]- `=this.Name` Details
> `=this.Content`
