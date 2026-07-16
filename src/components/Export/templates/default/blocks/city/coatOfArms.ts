import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCityCoatOfArmsBlock = createMustacheMarkdownBlock({
	id: "default.city.coatOfArms",
	template: "## Coat of Arms\n- **Shield Type:** {{coa.shield}}\n- **Tincture:** {{coa.t1}}\n- **Ordinaries:**\n{{#coa.ordinaries}}\n  - {{ordinary}} with tincture {{t}}\n{{/coa.ordinaries}}\n- **Charges:**\n{{#coa.charges}}\n  - {{charge}} with tincture {{t}}, position {{p}}, size {{size}}\n{{/coa.charges}}\n![[{{name}}.svg]]",
});
