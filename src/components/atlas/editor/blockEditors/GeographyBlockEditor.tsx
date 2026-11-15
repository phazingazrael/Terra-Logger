import { Alert, MenuItem, Stack, TextField } from "@mui/material";
import type {
	AtlasEditorContext,
	AtlasGeographyData,
} from "../../../../definitions/Atlas";
import type { TLCity, TLCountry } from "../../../../definitions/TerraLogger";
import { GeographySummary } from "../../render/GeographySummary";

export function GeographyBlockEditor({
	context,
}: {
	context: AtlasEditorContext;
}) {
	if (context.sourceType !== "city" && context.sourceType !== "country")
		return null;
	const entity = context.entity as TLCity | TLCountry;
	const data = context.mapGeography;
	if (!data?.biomes?.length || !entity.mapId) {
		return (
			<Alert severity="info">
				Reimport this map to include its biome data.
			</Alert>
		);
	}
	const mapId = entity.mapId;
	const city = context.sourceType === "city" ? (entity as TLCity) : undefined;
	const cellId = city?.cellId;
	const geography = data.geography;
	const currentId =
		cellId === undefined ? undefined : geography?.cells.biome[cellId];
	function change(after: AtlasGeographyData) {
		context.onRelatedUpdate({
			action: "update",
			store: "maps",
			field: "geography",
			key: mapId,
			value: { mapId, before: data ?? {}, after },
		});
	}
	return (
		<Stack spacing={2}>
			{city && geography && cellId !== undefined && currentId !== undefined ? (
				<>
					<TextField
						select
						label="City biome"
						value={currentId}
						onChange={(event) => {
							const biome = [...geography.cells.biome];
							biome[cellId] = Number(event.target.value);
							change({
								...data,
								geography: { cells: { ...geography.cells, biome } },
							});
						}}
					>
						{data.biomes
							.filter((biome) => !biome.removed || biome.i === currentId)
							.map((biome) => (
								<MenuItem key={biome.i} value={biome.i}>
									{biome.name}
								</MenuItem>
							))}
					</TextField>
					<small>
						This changes the City's map cell. Country composition recalculates
						from the cell assignments.
					</small>
				</>
			) : (
				<GeographySummary context={context} />
			)}
		</Stack>
	);
}
