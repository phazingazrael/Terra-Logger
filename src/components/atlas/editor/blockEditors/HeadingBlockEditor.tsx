import type { AtlasBlock } from "../../../../definitions/Atlas";

export function HeadingBlockEditor({
	block,
	onChange,
}: {
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}) {
	return (
		<div className="atlas-field-stack">
			<label>
				Heading text
				<input
					value={String(block.props.text ?? "")}
					onChange={(event) =>
						onChange({
							...block,
							props: { ...block.props, text: event.target.value },
						})
					}
				/>
			</label>
			<label>
				Level
				<input
					type="number"
					min={1}
					max={6}
					value={Number(block.props.level ?? 2)}
					onChange={(event) =>
						onChange({
							...block,
							props: { ...block.props, level: Number(event.target.value) },
						})
					}
				/>
			</label>
		</div>
	);
}
