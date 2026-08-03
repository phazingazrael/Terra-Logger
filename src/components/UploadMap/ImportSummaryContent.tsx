import { Alert, AlertTitle, Grid, Stack, Typography } from "@mui/material";
import type { MapImportSummary } from "./importSummary";

type ImportSummaryContentProps = {
	summary: MapImportSummary | null;
};

export default function ImportSummaryContent({
	summary,
}: Readonly<ImportSummaryContentProps>) {
	return (
		<>
			<Typography variant="h5" component="p" sx={{ mb: 3 }}>
				{summary?.mapName}
			</Typography>

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, md: 6 }}>
					<Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
						Imported
					</Typography>
					<Stack spacing={0.75}>
						{summary?.imported.map((entry) => (
							<Stack
								key={entry.label}
								direction="row"
								justifyContent="space-between"
								spacing={2}
							>
								<Typography>{entry.label}</Typography>
								<Typography fontWeight={600}>
									{entry.count.toLocaleString()}
								</Typography>
							</Stack>
						))}
					</Stack>
				</Grid>

				<Grid size={{ xs: 12, md: 6 }}>
					<Typography variant="h6" component="h2" sx={{ mb: 1.5 }}>
						Generated NPCs
					</Typography>
					{summary && summary.generatedNPCs.length > 0 ? (
						<Stack spacing={0.75}>
							{summary.generatedNPCs.map((entry) => (
								<Stack
									key={entry.label}
									direction="row"
									justifyContent="space-between"
									spacing={2}
								>
									<Typography>{entry.label}</Typography>
									<Typography fontWeight={600}>
										{entry.count.toLocaleString()}
									</Typography>
								</Stack>
							))}
						</Stack>
					) : (
						<Typography color="text.secondary">No NPCs generated.</Typography>
					)}
				</Grid>
			</Grid>

			{summary && summary.issues.length > 0 ? (
				<Stack spacing={1.25} sx={{ mt: 3 }}>
					<Typography variant="h6" component="h2">
						Upload Issues
					</Typography>
					<Typography variant="body2" color="text.secondary">
						The map was imported, but Terra-Logger encountered the following
						recoverable issues.
					</Typography>
					{summary.issues.map((issue) => (
						<Alert
							key={`${issue.severity}-${issue.label}`}
							severity={issue.severity}
							variant="outlined"
						>
							<AlertTitle>
								{issue.count.toLocaleString()}{" "}
								{issue.count === 1 ? "occurrence" : "occurrences"}
							</AlertTitle>
							{issue.label}
							{issue.examples.length > 0 ? (
								<Typography variant="body2" sx={{ mt: 0.5 }}>
									Examples: {issue.examples.join(", ")}
								</Typography>
							) : null}
						</Alert>
					))}
				</Stack>
			) : null}
		</>
	);
}
