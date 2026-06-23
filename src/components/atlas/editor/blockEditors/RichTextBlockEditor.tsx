import type { AtlasBlock } from "../../../../definitions/Atlas";
import { RichTextEditor } from "../../rte/RichTextEditor";

export function RichTextBlockEditor({
	block,
	onChange,
}: {
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}) {
	return (
		<RichTextEditor
			value={String(block.props.json ?? "")}
			onChange={(json) =>
				onChange({
					...block,
					props: {
						...block.props,
						json,
					},
				})
			}
		/>
	);
}
