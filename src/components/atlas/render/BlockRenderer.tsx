import type {
	AtlasBlock,
	AtlasRenderContext,
} from "../../../definitions/Atlas";
import { atlasBlockPlugins } from "./plugins/registry";
import { shouldRenderAtlasBlock } from "./utils/blockVisibility";

export function BlockRenderer({
	block,
	context,
}: Readonly<{
	block: AtlasBlock;
	context: AtlasRenderContext;
}>) {
	const plugin = atlasBlockPlugins[block.type];

	if (!plugin) {
		return (
			<div className="atlas-block atlas-block--missing">
				Missing block plugin: {block.type}
			</div>
		);
	}

	if (!shouldRenderAtlasBlock(block, context)) {
		return null;
	}

	return (
		<div
			className={`atlas-block atlas-block--${block.type}`}
			data-block-id={block.id}
		>
			{plugin.Render({ block, context })}
		</div>
	);
}
