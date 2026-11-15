import { useMemo } from "react";
import { Link as RouterLink } from "react-router-dom";
import { npcEraEventLinks } from "../../HistoryGenerator/eras/eraEvents";
import { useActive } from "../../../db/DataContext";
import type { TLMapEra } from "../../../definitions/History";
import { resolveHistoryEra } from "../../HistoryGenerator/eras/model";
import { Box, Chip, Link, Paper, Stack, Typography } from "@mui/material";
import type { NPCHistoryEntry } from "../../../definitions/TerraLogger";
import { toFormalCase } from "../relationships/registry";

type Props = { npcId: string; entries: readonly NPCHistoryEntry[]; embedded?: boolean };

export function NPCHistoryTimeline({ npcId, entries, embedded = false }: Props) {
	const eras = useActive<TLMapEra>("eras");
	const eventLinks = useMemo(() => npcEraEventLinks(eras, npcId), [eras, npcId]);
	const ordered = [...entries].sort((a, b) => {
		const yearDelta =
			(a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER);
		if (yearDelta !== 0) return yearDelta;
		return a.createdAt.localeCompare(b.createdAt);
	});

	function formatEntryYear(entry: NPCHistoryEntry): string {
		if (entry.year === undefined) return "Year: Unknown";
		const era = eras.length ? resolveHistoryEra(entry.year, eras) : entry.era;
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
					{(eventLinks.get(entry.id) ?? []).map((link) => <Link key={`${link.eraId}:${link.eventId}`}
						component={RouterLink} to={`/view_era/${link.eraId}#era-event-${link.eventId}`} sx={{ display: "block", mt: 1 }}>
						Related Era event: {link.name}
					</Link>)}
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
