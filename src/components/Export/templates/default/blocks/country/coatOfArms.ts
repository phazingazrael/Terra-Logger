import { createMustacheMarkdownBlock } from "../../../../builder/mustacheBlock";

export const defaultCountryCoatOfArmsBlock = createMustacheMarkdownBlock({
	id: "default.country.coatOfArms",
	template: "## Coat of Arms\n- **Shield Type:** {{coa.shield}}\n- **Tincture:** {{coa.t1}}\n- **Ordinaries:**\n{{#coa.ordinaries}}\n  - {{ordinary}} with tincture {{t}}, line {{line}}\n{{/coa.ordinaries}}\n- **Charges:**\n{{#coa.charges}}\n  - {{charge}} with tincture {{t}}, position {{p}}, size {{size}}\n{{/coa.charges}}\n![[{{name}}.svg]]",
});
