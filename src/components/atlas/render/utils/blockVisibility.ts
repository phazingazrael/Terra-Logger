import type {
	AtlasBlock,
	AtlasRenderContext,
	AtlasSection,
} from "../../../../definitions/Atlas";
import { atlasBlockPlugins } from "../plugins/registry";

export function shouldRenderAtlasBlock(
	block: AtlasBlock,
	context: AtlasRenderContext,
): boolean {
	const plugin = atlasBlockPlugins[block.type];

	if (!plugin?.shouldRender) {
		return true;
	}

	return plugin.shouldRender({ block, context });
}

export function getVisibleAtlasSection(
	section: AtlasSection,
	context: AtlasRenderContext,
): AtlasSection | null {
	if (section.editor.collapsed) {
		return null;
	}

	const blocks = section.blocks.filter((block) =>
		shouldRenderAtlasBlock(block, context),
	);

	if (blocks.length === 0) {
		return null;
	}

	return { ...section, blocks };
}
