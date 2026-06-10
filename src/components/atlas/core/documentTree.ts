import type { AtlasBlock, AtlasContent, AtlasSection } from "../../../definitions/Atlas";

export function replaceSection(content: AtlasContent, section: AtlasSection): AtlasContent {
	return {
		...content,
		sections: content.sections.map((current) => (current.id === section.id ? section : current)),
	};
}

export function addSection(content: AtlasContent, section: AtlasSection, index = content.sections.length): AtlasContent {
	const sections = [...content.sections];
	sections.splice(index, 0, section);
	return { ...content, sections };
}

export function removeSection(content: AtlasContent, sectionId: string): AtlasContent {
	return { ...content, sections: content.sections.filter((section) => section.id !== sectionId) };
}

export function moveSection(content: AtlasContent, fromIndex: number, toIndex: number): AtlasContent {
	const sections = [...content.sections];
	const [section] = sections.splice(fromIndex, 1);
	if (!section) return content;
	sections.splice(toIndex, 0, section);
	return { ...content, sections };
}

export function addBlock(section: AtlasSection, block: AtlasBlock, index = section.blocks.length): AtlasSection {
	const blocks = [...section.blocks];
	blocks.splice(index, 0, block);
	return { ...section, blocks };
}

export function replaceBlock(section: AtlasSection, block: AtlasBlock): AtlasSection {
	return { ...section, blocks: section.blocks.map((current) => (current.id === block.id ? block : current)) };
}

export function removeBlock(section: AtlasSection, blockId: string): AtlasSection {
	return { ...section, blocks: section.blocks.filter((block) => block.id !== blockId) };
}

export function moveBlock(section: AtlasSection, fromIndex: number, toIndex: number): AtlasSection {
	const blocks = [...section.blocks];
	const [block] = blocks.splice(fromIndex, 1);
	if (!block) return section;
	blocks.splice(toIndex, 0, block);
	return { ...section, blocks };
}
