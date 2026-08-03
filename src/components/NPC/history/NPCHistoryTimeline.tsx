import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import type { NPCHistoryEntry } from "../../../definitions/TerraLogger";
import { toFormalCase } from "../relationships/registry";

type Props = { entries: readonly NPCHistoryEntry[]; embedded?: boolean };

export function NPCHistoryTimeline({ entries, embedded = false }: Props) {
	const ordered = [...entries].sort((a, b) => {
		const yearDelta =
			(a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER);
		if (yearDelta !== 0) return yearDelta;
		return a.createdAt.localeCompare(b.createdAt);
	});

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
							label={
								entry.year === undefined
									? "Year: Unknown"
									: entry.era
										? `Year: ${entry.era.year} ${entry.era.shortName}`
										: `Year: ${entry.year}`
							}
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
