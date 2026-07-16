import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryPoliticalRelationsBlock = createMustacheMarkdownBlock({
	id: "default.country.politicalRelations",
	template: "## Political Relations\n- **Military Units:**\n{{#political.military}}\n  - {{name}} (ID: {{id}})\n    Icon: {{icon}}, Total: {{a}}\n    Composition: Cavalry {{u.cavalry}}, Archers {{u.archers}}, Infantry {{u.infantry}}\n{{/political.military}}\n- **Diplomatic Relations:**\n{{#political.diplomacy}}\n  - {{name}}: {{status}}\n{{/political.diplomacy}}\n- **Neighbors:**\n{{#political.neighbors}}\n  - {{name}} (ID: {{id}})\n{{/political.neighbors}}",
});
