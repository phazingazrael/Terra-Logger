import type { AtlasBlock } from "../../../../definitions/Atlas";

export function LinkButtonBlockEditor({
	block,
	onChange,
}: {
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}) {
	return (
		<div className="atlas-field-stack">
			<label>
				Text
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
				URL
				<input
					value={String(block.props.href ?? "")}
					onChange={(event) =>
						onChange({
							...block,
							props: { ...block.props, href: event.target.value },
						})
					}
				/>
			</label>
		</div>
	);
}
