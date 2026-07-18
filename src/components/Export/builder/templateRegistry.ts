import type { MarkdownDocumentTemplate } from "./exportTypes";
import { defaultTemplate } from "../templates/default/template";
import { botiTemplate } from "../templates/boti/template";

const markdownDocumentTemplates: MarkdownDocumentTemplate[] = [
	defaultTemplate,
	botiTemplate,
];

export function getMarkdownDocumentTemplates(): MarkdownDocumentTemplate[] {
	return markdownDocumentTemplates;
}

export function getMarkdownDocumentTemplate(
	labelOrId: string,
): MarkdownDocumentTemplate {
	return (
		markdownDocumentTemplates.find(
			(template) =>
				template.id === labelOrId || template.label === labelOrId,
		) ?? defaultTemplate
	);
}
