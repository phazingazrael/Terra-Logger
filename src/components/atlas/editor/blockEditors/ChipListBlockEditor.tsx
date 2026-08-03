import { Button } from "@mui/material";
import type { AtlasBlock } from "../../../../definitions/Atlas";
import { v4 as uuidv4 } from "uuid";

type ChipItem = {
	id: string;
	value: string;
};

export function ChipListBlockEditor({
	block,
	onChange,
}: {
	block: AtlasBlock;
	onChange: (block: AtlasBlock) => void;
}) {
	const chips = normalizeChipItems(block.props.chips);

	function setChips(nextChips: ChipItem[]) {
		onChange({
			...block,
			props: {
				...block.props,
				chips: nextChips,
			},
		});
	}

	return (
		<div className="atlas-field-stack">
			{chips.map((chip, index) => (
				<div key={chip.id} className="atlas-row-editor">
					<input
						aria-label={`Chip item ${index + 1}`}
						value={chip.value}
						onChange={(event) =>
							setChips(
								chips.map((item) =>
									item.id === chip.id
										? {
												...item,
												value: event.target.value,
											}
										: item,
								),
							)
						}
					/>

					<Button
						variant="outlined"
						type="button"
						onClick={() =>
							setChips(chips.filter((item) => item.id !== chip.id))
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
					setChips([
						...chips,
						{
							id: uuidv4(),
							value: "New item",
						},
					])
				}
			>
				Add item
			</Button>
		</div>
	);
}

function normalizeChipItems(value: unknown): ChipItem[] {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.map((item) => {
		if (item && typeof item === "object" && "id" in item && "value" in item) {
			const record = item as {
				id: unknown;
				value: unknown;
			};

			return {
				id: String(record.id),
				value: String(record.value),
			};
		}

		return {
			id: uuidv4(),
			value: String(item),
		};
	});
}
