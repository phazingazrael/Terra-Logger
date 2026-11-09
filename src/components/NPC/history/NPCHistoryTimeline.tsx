import { useMemo } from "react";
import { useActiveMap } from "../../../db/DataContext";
import type { MapInf } from "../../../definitions/TerraLogger";
import { getMapEras } from "../../HistoryGenerator/eras/mapEras";
import { resolveHistoryEra } from "../../HistoryGenerator/eras/model";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { NPCHistoryEntry } from "../../../definitions/TerraLogger";
import { toFormalCase } from "../relationships/registry";

type Props = { entries: readonly NPCHistoryEntry[]; embedded?: boolean };

export function NPCHistoryTimeline({ entries, embedded = false }: Props) {
	const map = useActiveMap<MapInf>();
	const eras = useMemo(() => map ? getMapEras(map) : undefined, [map]);
	const ordered = [...entries].sort((a, b) => {
		const yearDelta =
			(a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER);
		if (yearDelta !== 0) return yearDelta;
		return a.createdAt.localeCompare(b.createdAt);
	});

	function formatEntryYear(entry: NPCHistoryEntry): string {
		if (entry.year === undefined) return "Year: Unknown";
		const era = eras ? resolveHistoryEra(entry.year, eras) : entry.era;
		return era ? `Year: ${era.year} ${era.shortName}` : `Year: ${entry.year}`;
	}

	if (!ordered.length) return null;

	const content = (
		<Stack spacing={1.25} sx={{ minWidth: 0 }}>
			{ordered.map((entry) => (
				<Paper key={entry.id} variant="outlined" sx={{ p: 1.25, minWidth: 0 }}>
					<Stack
						direction="row"
						spacing={0.75}
						alignItems="center"
						flexWrap="wrap"
						useFlexGap
						sx={{ mb: 0.75 }}
					>
						<Chip
							size="small"
							color="primary"
							label={formatEntryYear(entry)}
						/>
						{entry.category ? (
							<Chip size="small" label={toFormalCase(entry.category)} />
						) : null}
						{entry.source === "authored" ? (
							<Chip size="small" variant="outlined" label="Authored" />
						) : null}
					</Stack>
					<Typography
						variant="subtitle1"
						fontWeight={700}
						sx={{ overflowWrap: "anywhere" }}
					>
						{entry.title}
					</Typography>
					<Typography
						variant="body2"
						sx={{ mt: 0.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
					>
						{entry.description}
					</Typography>
				</Paper>
			))}
		</Stack>
	);

	if (embedded) return content;
	return (
		<Box sx={{ mt: 3, minWidth: 0 }}>
			<Typography variant="h5" gutterBottom>
				History
			</Typography>
			{content}
		</Box>
	);
}
