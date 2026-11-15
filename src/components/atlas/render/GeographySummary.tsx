import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import type { AtlasRenderContext } from "../../../definitions/Atlas";
import type { TLCity, TLCountry } from "../../../definitions/TerraLogger";
import { cityBiome, countryBiomeComposition } from "../core/geography";

export function GeographySummary({ context }: { context: AtlasRenderContext }) {
  if (context.sourceType !== "city" && context.sourceType !== "country") return null;
  const data = context.mapGeography;
  if (!data?.geography) return <p>Reimport this map to include its biome assignments.</p>;
  if (context.sourceType === "city") {
    const biome = cityBiome(context.entity as TLCity, data);
    return biome ? <Chip variant="outlined" label={biome.name}
      icon={<Box component="span" sx={{ bgcolor: biome.color, width: 12, height: 12, borderRadius: "50%" }} />} />
      : <p>No biome assignment is available for this City.</p>;
  }
  const rows = countryBiomeComposition((context.entity as TLCountry).id, data);
  if (!rows.length) return <p>No land cells are assigned to this Country.</p>;
  return <Box>
    <Typography variant="body2">Dominant biome: <strong>{rows[0].biome?.name ?? "Unknown biome"}</strong></Typography>
    <details>
      <summary>Biome composition</summary>
      <TableContainer>
        <Table size="small" aria-label="Country biome composition">
          <TableHead><TableRow><TableCell>Biome</TableCell><TableCell align="right">Cells</TableCell><TableCell align="right">Coverage</TableCell></TableRow></TableHead>
          <TableBody>{rows.map((row) => <TableRow key={row.id}>
            <TableCell><Box component="span" sx={{ display: "inline-block", bgcolor: row.biome?.color, width: 10, height: 10, borderRadius: "50%", mr: 1 }} />{row.biome?.name ?? "Unknown biome"}</TableCell>
            <TableCell align="right">{row.count.toLocaleString()}</TableCell>
            <TableCell align="right">{row.percent.toFixed(1)}%</TableCell>
          </TableRow>)}</TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption">Coverage is the share of land cells, not land area.</Typography>
    </details>
  </Box>;
}
