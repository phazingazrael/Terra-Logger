import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Divider,
	Link,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useState, type ReactNode } from "react";
import type { AppInfo } from "../../definitions/AppInfo";
import { getAppSettings } from "../../db/appSettings";
import {
	releaseChanges,
	type ReleaseChangeCommit,
} from "../../generated/releaseChanges";

import "./HomePage.css";

type HomeChangeSummaryConfig = {
	includeTypes: readonly string[];
	includeScopes?: readonly string[];
	includeCommitIds?: readonly string[];
	excludeTypes?: readonly string[];
	excludeScopes?: readonly string[];
	limit: number;
};

const HOME_CHANGE_SUMMARY_CONFIG: HomeChangeSummaryConfig = {
	includeTypes: ["feat", "fix", "perf", "refactor"],
	includeScopes: [
		"atlas",
		"editor",
		"editing",
		"export",
		"markdown",
		"boti",
		"upload",
		"worker",
		"changelog",
		"home",
		"about",
	],
	includeCommitIds: [
		// Add full or short hashes here when you want a specific commit included,
		// even if it does not match the type/scope filters.
		// "6763ba7",
	],
	excludeTypes: ["chore", "style", "test"],
	excludeScopes: [],
	limit: 10,
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
});

const HomePage = () => {
	const [app, setApp] = useState<AppInfo | null>(null);

	useEffect(() => {
		(async () => {
			const settings = await getAppSettings();
			setApp(settings);
		})();
	}, []);

	const appVersion = releaseChanges.version;
	const afmgVersion = app?.application.afmgVer ?? "1.105.15";

	const summaryCommits = getHomepageSummaryCommits();
	const releaseSummary = buildReleaseSummary(summaryCommits);

	return (
		<Container className="homePage">
			<section className="section homepage homeHero">
				<Stack
					className="homeHeader"
					direction="row"
					spacing={1}
					flexWrap="wrap"
					useFlexGap
				>
					<Chip label={`Terra-Logger v${appVersion}`} color="primary" />
					<Chip label={`AFMG ${afmgVersion}+ compatible`} color="secondary" />
				</Stack>
				<Typography variant="h5" component="h1" className="homeHeroTitle">
					Turn Azgaar maps into editable worldbuilding documents.
				</Typography>

				<Typography variant="body1" className="homeHeroText">
					Terra-Logger imports Azgaar Fantasy Map Generator <code>.map</code>{" "}
					files, converts generated map data into organized pages, lets you edit
					world details before export, and generates Generic Markdown or
					Obsidian-ready vault content.
				</Typography>

				<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
					Terra-Logger still supports maps from the AFMG Economy Update
					(V1.124.3), but newer AFMG features will not be available in
					Terra-Logger until V1.1.5.
				</Typography>
			</section>

			<section className="homeGrid">
				<Card className="homeCard">
					<CardContent>
						<Typography variant="h5" component="h2">
							What Terra-Logger does
						</Typography>

						<ul className="homeFeatureList">
							<li>
								Imports cities, countries, cultures, religions, and notes.
							</li>
							<li>Creates editable Atlas pages for generated world data.</li>
							<li>Exports Markdown files, SVG assets, and Obsidian vaults.</li>
							<li>Supports default and Bag of Tips inspired export formats.</li>
						</ul>
					</CardContent>
				</Card>

				<Card className="homeCard">
					<CardContent>
						<Typography variant="h5" component="h2">
							Basic workflow
						</Typography>

						<ol className="homeFeatureList">
							<li>
								Create or update your world in Azgaar Fantasy Map Generator.
							</li>
							<li>
								Save the world as a <code>.map</code> file.
							</li>
							<li>Upload or update the map in Terra-Logger.</li>
							<li>Edit generated Atlas pages.</li>
							<li>Export Markdown or an Obsidian-ready vault.</li>
						</ol>

						<Button
							variant="outlined"
							href="https://azgaar.github.io/Fantasy-Map-Generator/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Open Azgaar Fantasy Map Generator
						</Button>
					</CardContent>
				</Card>
			</section>

			<section className="section whatsNew">
				<Stack
					direction={{ xs: "column", md: "row" }}
					justifyContent="space-between"
					spacing={2}
				>
					<Box>
						<Typography variant="h4" component="h2">
							What&apos;s new
						</Typography>

						<Typography variant="body2" color="text.secondary">
							There have been {releaseChanges.commitCount} commits since the
							last release
							{releaseChanges.previousTag
								? ` (${releaseChanges.previousTag}).`
								: "."}
						</Typography>
					</Box>
				</Stack>

				<Divider sx={{ my: 2 }} />

				<Typography variant="body1" component="div" className="whatsNewSummary">
					{releaseSummary}
				</Typography>

				{summaryCommits.length > 0 ? (
					<>
						<Typography variant="h6" component="h3" sx={{ mt: 2 }}>
							Release highlights
						</Typography>

						<ul className="homeCommitList">
							{summaryCommits.map((commit) => (
								<li key={commit.hash}>
									<CommitLine commit={commit} />
								</li>
							))}
						</ul>
					</>
				) : (
					<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
						No highlighted release commits matched the Home page summary
						configuration.
					</Typography>
				)}
			</section>
		</Container>
	);
};

function getHomepageSummaryCommits(): ReleaseChangeCommit[] {
	const includeTypeSet = toLowerSet(HOME_CHANGE_SUMMARY_CONFIG.includeTypes);
	const includeScopeSet = toLowerSet(
		HOME_CHANGE_SUMMARY_CONFIG.includeScopes ?? [],
	);
	const includeCommitIdSet = toLowerSet(
		HOME_CHANGE_SUMMARY_CONFIG.includeCommitIds ?? [],
	);
	const excludeTypeSet = toLowerSet(
		HOME_CHANGE_SUMMARY_CONFIG.excludeTypes ?? [],
	);
	const excludeScopeSet = toLowerSet(
		HOME_CHANGE_SUMMARY_CONFIG.excludeScopes ?? [],
	);

	return releaseChanges.commits
		.filter((commit) => {
			const type = commit.type.toLowerCase();
			const scope = (commit.scope ?? "").toLowerCase();
			const hash = commit.hash.toLowerCase();
			const shortHash = commit.shortHash.toLowerCase();

			const explicitlyIncluded = [...includeCommitIdSet].some(
				(commitId) =>
					hash.startsWith(commitId) || shortHash.startsWith(commitId),
			);

			if (explicitlyIncluded) {
				return true;
			}

			if (excludeTypeSet.has(type)) {
				return false;
			}

			if (
				scope &&
				[...excludeScopeSet].some((excludedScope) =>
					scope.includes(excludedScope),
				)
			) {
				return false;
			}

			const matchesType = includeTypeSet.size === 0 || includeTypeSet.has(type);

			const matchesScope =
				includeScopeSet.size === 0 ||
				[...includeScopeSet].some((includedScope) =>
					scope.includes(includedScope),
				);

			return matchesType && matchesScope;
		})
		.slice(0, HOME_CHANGE_SUMMARY_CONFIG.limit);
}

function buildReleaseSummary(commits: ReleaseChangeCommit[]): ReactNode {
	if (commits.length === 0) {
		return "This release focuses on internal maintenance and smaller polish changes that do not appear in the curated Home page summary.";
	}

	const counts = countCommitTypes(commits);
	const summaryParts: string[] = [];

	if ((counts.feat ?? 0) > 0) {
		summaryParts.push(
			`${counts.feat} feature ${pluralize(counts.feat, "update", "updates")}`,
		);
	}

	if ((counts.fix ?? 0) > 0) {
		summaryParts.push(`${counts.fix} ${pluralize(counts.fix, "fix", "fixes")}`);
	}

	if ((counts.refactor ?? 0) > 0) {
		summaryParts.push(
			`${counts.refactor} refactor ${pluralize(
				counts.refactor,
				"change",
				"changes",
			)}`,
		);
	}

	if ((counts.perf ?? 0) > 0) {
		summaryParts.push(
			`${counts.perf} performance ${pluralize(
				counts.perf,
				"improvement",
				"improvements",
			)}`,
		);
	}

	const summaryLead =
		summaryParts.length > 0
			? `This release highlights ${formatList(summaryParts)}.`
			: `This release highlights ${commits.length} curated project changes.`;

	const topCommit = commits[0];

	if (!topCommit) {
		return summaryLead;
	}

	const topCommitText = topCommit.details || topCommit.subject;

	return (
		<>
			{summaryLead} <br />
			The most recent highlighted change is:{" "}
			<Chip
				className="whatsNewSummaryChip"
				component="span"
				size="small"
				label={topCommitText}
				variant="outlined"
			/>
			.
		</>
	);
}

function countCommitTypes(
	commits: ReleaseChangeCommit[],
): Record<string, number> {
	return commits.reduce<Record<string, number>>((acc, commit) => {
		acc[commit.type] = (acc[commit.type] ?? 0) + 1;
		return acc;
	}, {});
}

function CommitLine({ commit }: { commit: ReleaseChangeCommit }) {
	const dateLabel = DATE_FORMATTER.format(new Date(commit.date));

	return (
		<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
			<Chip size="small" label={commit.type} variant="outlined" />

			{commit.scope ? (
				<Chip size="small" label={commit.scope} variant="outlined" />
			) : null}

			<span>
				{commit.details || commit.subject}{" "}
				<Link href={commit.url} target="_blank" rel="noopener noreferrer">
					<code>{commit.shortHash}</code>
				</Link>
			</span>

			<Typography component="span" variant="caption" color="text.secondary">
				{dateLabel}
			</Typography>
		</Stack>
	);
}

function toLowerSet(values: readonly string[]): Set<string> {
	return new Set(values.map((value) => value.toLowerCase()));
}

function pluralize(count: number, singular: string, plural: string): string {
	return count === 1 ? singular : plural;
}

function formatList(values: string[]): string {
	if (values.length === 0) {
		return "";
	}

	if (values.length === 1) {
		return values[0] ?? "";
	}

	if (values.length === 2) {
		return `${values[0]} and ${values[1]}`;
	}

	const lastValue = values[values.length - 1] ?? "";

	return `${values.slice(0, -1).join(", ")}, and ${lastValue}`;
}

export default HomePage;
