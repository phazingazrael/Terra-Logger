import { Button } from "@mui/material";
import type {
	AtlasBlock,
	AtlasBlockPreset,
	AtlasEditorContext,
} from "../../../definitions/Atlas";
import { BlockSortable } from "../dnd/BlockSortable";
import { BlockEditorSwitch } from "./BlockEditorSwitch";
import { BlockPresetMenu } from "./BlockPresetMenu";
import OpenWithIcon from "@mui/icons-material/OpenWith";

export function BlockList({
	blocks,
	blockPresets,
	context,
	onAdd,
	onChange,
	onRemove,
	onMove,
}: {
	blocks: AtlasBlock[];
	blockPresets: AtlasBlockPreset[];
	context: AtlasEditorContext;
	onAdd: (preset: AtlasBlockPreset) => void;
	onChange: (block: AtlasBlock) => void;
	onRemove: (id: string) => void;
	onMove: (from: number, to: number) => void;
}) {
	return (
		<div className="atlas-block-list">
			<BlockPresetMenu presets={blockPresets} onAdd={onAdd} />

			{blocks.map((block, index) => {
				const hasMultipleBlocks = blocks.length > 1;
				const isComputedBlock = block.dataMode === "computed";

				const canRemoveBlock =
					hasMultipleBlocks &&
					block.editor.removable !== false &&
					!isComputedBlock;

				return (
					<BlockSortable
						key={block.id}
						index={index}
						reorderable={block.editor.reorderable !== false}
						onMove={onMove}
					>
						{({ dragHandleProps }) => (
							<div className="atlas-block-editor-card">
								{hasMultipleBlocks && block.editor.reorderable !== false ? (
									<div className="atlas-block-editor-card__toolbar">
										<button {...dragHandleProps}>
											<OpenWithIcon />
										</button>

										<Button
											variant="outlined"
											type="button"
											disabled={!canRemoveBlock}
											title={
												isComputedBlock
													? "Computed blocks cannot be removed."
													: undefined
											}
											onClick={() => onRemove(block.id)}
										>
											Remove
										</Button>
									</div>
								) : null}
								<BlockEditorSwitch
									block={block}
									context={context}
									onChange={onChange}
								/>
							</div>
						)}
					</BlockSortable>
				);
			})}
		</div>
	);
}
