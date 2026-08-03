import type { AtlasBlock } from "../../../../definitions/Atlas";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export function HeadingBlockEditor({
	block,
	onChange,
}: {
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}) {
	const currentLevel = normalizeHeadingLevel(block.props.level);

	return (
		<div className="atlas-field-stack">
			<label>
				Heading text
				<input
					value={String(block.props.text ?? "")}
					onChange={(event) =>
						onChange({
							...block,
							props: {
								...block.props,
								text: event.target.value,
							},
						})
					}
				/>
			</label>

			<label>
				Level
				<select
					value={currentLevel}
					onChange={(event) =>
						onChange({
							...block,
							props: {
								...block.props,
								level: Number(event.target.value),
							},
						})
					}
				>
					{HEADING_LEVELS.map((level) => (
						<option key={level} value={level}>
							Heading {level}
						</option>
					))}
				</select>
			</label>
		</div>
	);
}

function normalizeHeadingLevel(
	value: unknown,
): (typeof HEADING_LEVELS)[number] {
	const level = Number(value);

	return HEADING_LEVELS.includes(level as (typeof HEADING_LEVELS)[number])
		? (level as (typeof HEADING_LEVELS)[number])
		: 2;
}
