import type { AtlasBlockPreset } from "../../../definitions/Atlas";

export function BlockPresetMenu({
	presets,
	onAdd,
}: {
	presets: AtlasBlockPreset[];
	onAdd: (preset: AtlasBlockPreset) => void;
}) {
	return (
		<label>
			Add block &nbsp;
			<select
				defaultValue=""
				onChange={(event) => {
					const preset = presets.find((item) => item.id === event.target.value);
					if (preset) onAdd(preset);
					event.currentTarget.value = "";
				}}
			>
				<option value="" disabled>
					Choose…
				</option>
				{presets.map((preset) => (
					<option key={preset.id} value={preset.id}>
						{preset.label}
					</option>
				))}
			</select>
		</label>
	);
}
