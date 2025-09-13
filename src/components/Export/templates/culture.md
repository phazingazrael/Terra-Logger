# {{name}}

**Type:** {{type}}
**ID:** {{id}}

---

## Overview
- **Expansionism:** {{expansionism}}
- **Color (hex):** {{color}}

## Population
- **Urban Population:** {{urbanPop}}
- **Rural Population:** {{ruralPop}}

## Origins
{{#origins}}
- {{.}}
{{/origins}}
{{^origins}}
- _No origins listed_
{{/origins}}

## Tags
{{#tags}}
- **{{Name}}** ({{Type}}) {{#Default}}— _Default_{{/Default}}
  - {{Description}}
{{/tags}}
{{^tags}}
- _No tags_
{{/tags}}
