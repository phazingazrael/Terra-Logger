import { Button } from "@mui/material";
import type { AtlasBlock } from "../../../../definitions/Atlas";

export function ChipListBlockEditor({
	block,
	onChange,
}: {
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}) {
	const chips = (
		Array.isArray(block.props.chips) ? block.props.chips : []
	) as string[];
	return (
		<div className="atlas-field-stack">
			{chips.map((chip, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: index is computed as PART of key, not as full key
				<div key={index} className="atlas-row-editor">
					<input
						value={chip}
						onChange={(event) =>
							onChange({
								...block,
								props: {
									...block.props,
									chips: chips.map((item, i) =>
										i === index ? event.target.value : item,
									),
								},
							})
						}
					/>
					<Button
						variant="outlined"
						type="button"
						onClick={() =>
							onChange({
								...block,
								props: {
									...block.props,
									chips: chips.filter((_, i) => i !== index),
								},
							})
						}
					>
						Remove
					</Button>
				</div>
			))}
			<Button
				variant="outlined"
				type="button"
				onClick={() =>
					onChange({
						...block,
						props: { ...block.props, chips: [...chips, "New item"] },
					})
				}
			>
				Add item
			</Button>
		</div>
	);
}
