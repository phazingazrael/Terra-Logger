#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Importing the shared release helpers must not run the changelog command.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

function main() {
	const args = parseArgs(process.argv.slice(2));

	const changelogPath = path.resolve(args.file ?? "CHANGELOG.md");
	const packageJsonPath = path.resolve("package.json");

	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
	const version = String(packageJson.version ?? "").trim();

	if (!version) {
		fail("package.json is missing a valid version.");
	}

	const releaseTag = args.tagName ?? version;
	const remoteName = args.remote ?? "origin";
	const tags = getReleaseTags(args.to ?? "HEAD");
	const currentTag = tags.find(name => compareReleaseVersions(name, version) === 0);
	const toRef = args.to ?? currentTag ?? "HEAD";
	const repoUrl = args.repo ?? getGithubRepoUrl(remoteName);

	if (!repoUrl) {
		fail(`Could not determine GitHub repo URL from remote "${remoteName}".`);
	}

	const previousTag = args.from ?? findPreviousReleaseTag(version, toRef);

	if (!previousTag) {
		fail(
			`Could not find a previous release tag. Pass one explicitly: --from <tag>`,
		);
	}

	const commits = getCommits(previousTag, toRef);

	const section = renderReleaseSection({
		version,
		releaseTag: currentTag ?? (args.tag ? releaseTag : toRef),
		previousTag,
		repoUrl,
		commits,
		releaseDate: currentTag ? new Date(git(["log", "-1", "--format=%cs", toRef]).trim() + "T12:00:00Z") : args.commit && args.tag ? new Date() : null,
	});

	const currentChangelog = existsSync(changelogPath)
		? readFileSync(changelogPath, "utf8")
		: "";

	const latestSummary = renderLatestSummary({
		commits,
		repoUrl,
		majorLimit: Number.parseInt(String(args.majorLimit ?? "10"), 10),
	});

	const nextChangelog = upsertReleaseSection({
		changelog: args.rebuild
			? rebuildReleaseSections(getReleaseTags(toRef).filter(name => compareReleaseVersions(name, version) <= 0), repoUrl).join("\n")
			: currentChangelog,
		version,
		section,
		latestSummary,
	});

	if (args.dryRun) {
		console.log(nextChangelog);
		process.exit(0);
	}

	writeFileSync(changelogPath, nextChangelog, "utf8");

	console.log(`Updated ${path.relative(process.cwd(), changelogPath)}`);
	console.log(`Release: ${version}`);
	console.log(`Range: ${previousTag}..${toRef}`);
	console.log(`Commits: ${commits.length}`);

	if (args.commit) {
		commitChangelog({
			changelogPath,
			version,
			includeVersionFiles: args.includeVersionFiles,
			noVerify: args.noVerify,
		});

		if (args.tag) {
			createReleaseTag(releaseTag, version);
		}

		if (args.push) {
			pushRelease({
				remoteName,
				releaseTag,
				pushTag: args.tag,
			});
		}
	}
}

function parseArgs(argv) {
	const parsed = {
		commit: false,
		tag: false,
		push: false,
		dryRun: false,
		rebuild: false,
		includeVersionFiles: false,
		noVerify: false,
	};

	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index];

		switch (arg) {
			case "--from":
				parsed.from = requireValue(argv, ++index, "--from");
				break;

			case "--to":
				parsed.to = requireValue(argv, ++index, "--to");
				break;

			case "--file":
				parsed.file = requireValue(argv, ++index, "--file");
				break;

			case "--repo":
				parsed.repo = requireValue(argv, ++index, "--repo");
				break;

			case "--remote":
				parsed.remote = requireValue(argv, ++index, "--remote");
				break;

			case "--tag-name":
				parsed.tagName = requireValue(argv, ++index, "--tag-name");
				break;

			case "--commit":
				parsed.commit = true;
				break;

			case "--tag":
				parsed.tag = true;
				break;

			case "--push":
				parsed.push = true;
				break;

			case "--rebuild":
				parsed.rebuild = true;
				break;

			case "--dry-run":
				parsed.dryRun = true;
				break;

			case "--include-version-files":
				parsed.includeVersionFiles = true;
				break;

			case "--no-verify":
				parsed.noVerify = true;
				break;

			case "--major-limit":
				parsed.majorLimit = requireValue(argv, ++index, "--major-limit");
				break;

			default:
				fail(`Unknown argument: ${arg}`);
		}
	}

	return parsed;
}

function requireValue(argv, index, flagName) {
	const value = argv[index];

	if (!value || value.startsWith("--")) {
		fail(`${flagName} requires a value.`);
	}

	return value;
}

function getCommits(fromTag, toRef) {
	const raw = git([
		"log",
		fromTag ? `${fromTag}..${toRef}` : toRef,
		"--date=iso-strict",
		"--pretty=format:%H%x1f%h%x1f%ad%x1f%s",
	]);

	if (!raw.trim()) {
		return [];
	}

	return raw
		.split("\n")
		.map((line) => {
			const [hash, shortHash, date, subject] = line.split("\x1f");

			return {
				hash,
				shortHash,
				date: new Date(date),
				dateKey: date.slice(0, 10),
				subject,
			};
		})
		.sort((left, right) => right.date.getTime() - left.date.getTime());
}

function encodeTag(tagName) {
	return encodeURIComponent(tagName);
}

function renderReleaseSection({
	version,
	releaseTag,
	previousTag,
	repoUrl,
	commits,
	releaseDate,
}) {
	const compareUrl = previousTag
		? `${repoUrl}/compare/${encodeTag(previousTag)}...${encodeTag(releaseTag)}`
		: `${repoUrl}/commits/${encodeTag(releaseTag)}`;

	const lines = [
		`## ${version}`,
		"",
		`[Compare changes](${compareUrl})`,
		"",
		releaseDate ? formatReleaseDate(releaseDate) : "Unreleased",
		"",
	];

	const commitsByDate = groupCommitsByDate(commits);

	for (const group of commitsByDate) {
		if (!releaseDate || group.label !== formatReleaseDate(releaseDate)) {
			lines.push(group.label);
			lines.push("");
		}

		for (const commit of group.commits) {
			lines.push(renderCommitLine(repoUrl, commit));
		}

		lines.push("");
	}

	return `${lines.join("\n").trimEnd()}\n`;
}

function renderLatestSummary({ commits, repoUrl, majorLimit = 10 }) {
	const majorCommits = getMajorCommits(commits).slice(0, majorLimit);

	const lines = [
		`There have been ${commits.length} commits since last release.`,
		"",
		"## Major Changes since last release",
	];

	if (majorCommits.length === 0) {
		lines.push("- No major changes were detected from commit subjects.");
		return lines.join("\n");
	}

	for (const commit of majorCommits) {
		lines.push(`- ${renderCommitSummary(repoUrl, commit)}`);
	}

	return lines.join("\n");
}

function getMajorCommits(commits) {
	const majorPattern =
		/^(feat|fix|perf|refactor)(\(.+\))?!?:|BREAKING CHANGE|!:/i;

	return commits.filter((commit) => majorPattern.test(commit.subject));
}

function renderCommitSummary(repoUrl, commit) {
	const safeSubject = escapeMarkdownText(commit.subject);
	const commitUrl = `${repoUrl}/commit/${commit.hash}`;

	return `${safeSubject} [\`${commit.shortHash}\`](${commitUrl})`;
}

function groupCommitsByDate(commits) {
	const groups = new Map();

	for (const commit of commits) {
		const key = commit.dateKey;
		const label = formatReleaseDate(new Date(key + "T12:00:00Z"));

		if (!groups.has(key)) {
			groups.set(key, {
				key,
				label,
				commits: [],
			});
		}

		groups.get(key).commits.push(commit);
	}

	return [...groups.values()].sort((left, right) =>
		right.key.localeCompare(left.key),
	);
}

function renderCommitLine(repoUrl, commit) {
	const safeSubject = escapeMarkdownText(commit.subject);
	const commitUrl = `${repoUrl}/commit/${commit.hash}`;

	return `- ${safeSubject} [\`${commit.shortHash}\`](${commitUrl})`;
}

function upsertReleaseSection({ changelog, version, section, latestSummary }) {
  const sections = releaseSections(changelog).filter(entry => compareReleaseVersions(entry.version, version) !== 0);
  sections.push({ version, body: section.trimEnd() });
  sections.sort((a, b) => compareReleaseVersions(b.version, a.version));
  return joinDocumentParts([
    "# Terra-Logger Changelog", latestSummary.trimEnd(), ...sections.map(entry => entry.body),
  ]);
}

function joinDocumentParts(parts) {
	return `${parts.filter((part) => part.trim()).join("\n\n")}\n`;
}


// Only version tags are release boundaries; annotated-tag creation dates are not release order.
export function parseReleaseVersion(value) {
  const match = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:[-_]([0-9A-Za-z.-]+))?$/.exec(value);
  if (!match) return null;
  return { numbers: match.slice(1, 4).map(Number), prerelease: match[4]?.toLowerCase() ?? null };
}

export function compareReleaseVersions(left, right) {
  const a = parseReleaseVersion(left);
  const b = parseReleaseVersion(right);
  if (!a || !b) throw new Error("Invalid release version.");
  for (let index = 0; index < 3; index++) {
    if (a.numbers[index] !== b.numbers[index]) return a.numbers[index] - b.numbers[index];
  }
  if (a.prerelease === b.prerelease) return 0;
  if (a.prerelease === null) return 1;
  if (b.prerelease === null) return -1;
  const leftParts = a.prerelease.split(".");
  const rightParts = b.prerelease.split(".");
  for (let index = 0; index < Math.max(leftParts.length, rightParts.length); index++) {
    const x = leftParts[index];
    const y = rightParts[index];
    if (x === y) continue;
    if (x === undefined) return -1;
    if (y === undefined) return 1;
    const numericX = /^\d+$/.test(x);
    const numericY = /^\d+$/.test(y);
    if (numericX && numericY) {
      if (Number(x) !== Number(y)) return Number(x) - Number(y);
      continue;
    }
    if (numericX !== numericY) return numericX ? -1 : 1;
    return x < y ? -1 : 1;
  }
  return 0;
}

export function getReleaseTags(toRef) {
  const raw = git(["tag", "--merged", toRef]);
  const tags = raw.split("\n").map(name => name.trim()).filter(name => parseReleaseVersion(name));
  tags.sort((a, b) => compareReleaseVersions(b, a) || Number(a.startsWith("v")) - Number(b.startsWith("v")));
  // Prefer an unprefixed tag when both spellings identify the same release.
  return tags.filter((name, index) => !index || compareReleaseVersions(name, tags[index - 1]) !== 0);
}

export function findPreviousReleaseTag(version, toRef) {
  return getReleaseTags(toRef).find(name => compareReleaseVersions(name, version) < 0) ?? null;
}

function releaseSections(changelog) {
  const headings = [...changelog.matchAll(/^## (v?\d+\.\d+\.\d+(?:[-_][0-9A-Za-z.-]+)?)\s*$/gm)];
  return headings.map((heading, index) => ({
    version: heading[1],
    body: changelog.slice(heading.index, headings[index + 1]?.index)
      .replace(/^## Major Changes since last release\b[\s\S]*$/m, "").trim(),
  }));
}

function rebuildReleaseSections(tags, repoUrl) {
  return tags.map(name => {
    const previousTag = findPreviousReleaseTag(name, name);
    const date = git(["log", "-1", "--format=%cs", name]).trim();
    return renderReleaseSection({
      version: name.replace(/^v/, ""), releaseTag: name, previousTag, repoUrl,
      commits: getCommits(previousTag, name),
      releaseDate: new Date(date + "T12:00:00Z"),
    });
  });
}

function getGithubRepoUrl(remoteName) {
	const remoteUrl = git(["config", "--get", `remote.${remoteName}.url`], {
		allowEmpty: true,
	}).trim();

	if (!remoteUrl) {
		return null;
	}

	if (remoteUrl.startsWith("git@github.com:")) {
		return `https://github.com/${remoteUrl
			.slice("git@github.com:".length)
			.replace(/\.git$/, "")}`;
	}

	if (remoteUrl.startsWith("https://github.com/")) {
		return remoteUrl.replace(/\.git$/, "");
	}

	return null;
}

function commitChangelog({
	changelogPath,
	version,
	includeVersionFiles,
	noVerify,
}) {
	git(["add", changelogPath]);

	if (includeVersionFiles) {
		git(["add", "package.json"], { allowFailure: true });
		git(["add", "package-lock.json"], { allowFailure: true });
		git(["add", "npm-shrinkwrap.json"], { allowFailure: true });
	}

	const hasStagedChanges = !commandSucceeds(["diff", "--cached", "--quiet"]);

	if (!hasStagedChanges) {
		console.log("No staged changes to commit.");
		return;
	}

	const commitArgs = ["commit", "-m", `docs: update changelog for ${version}`];

	if (noVerify) {
		commitArgs.push("--no-verify");
	}

	git(commitArgs);
}

function createReleaseTag(releaseTag, version) {
	if (tagExists(releaseTag)) {
		fail(`Tag already exists: ${releaseTag}`);
	}

	git(["tag", "-a", releaseTag, "-m", `Release ${version}`]);
	console.log(`Created tag ${releaseTag}`);
}

function pushRelease({ remoteName, releaseTag, pushTag }) {
	const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).trim();

	if (!branch || branch === "HEAD") {
		fail("Cannot push automatically from detached HEAD.");
	}

	git(["push", remoteName, branch]);

	if (pushTag) {
		git(["push", remoteName, releaseTag]);
	}
}

function tagExists(tagName) {
	return commandSucceeds([
		"rev-parse",
		"--verify",
		"--quiet",
		`refs/tags/${tagName}`,
	]);
}

function commandSucceeds(args) {
	try {
		git(args);
		return true;
	} catch {
		return false;
	}
}

function formatReleaseDate(date) {
	return new Intl.DateTimeFormat("en-GB", {
		timeZone: "UTC",
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(date);
}

function escapeMarkdownText(value) {
	return String(value ?? "")
		.replace(/\\/g, "\\\\")
		.replace(/\[/g, "\\[")
		.replace(/\]/g, "\\]");
}

function git(args, options = {}) {
	try {
		return execFileSync("git", args, {
			cwd: process.cwd(),
			encoding: "utf8",
			stdio: ["ignore", "pipe", options.allowFailure ? "pipe" : "inherit"],
		});
	} catch (error) {
		if (options.allowEmpty) {
			return "";
		}

		if (options.allowFailure) {
			return "";
		}

		throw error;
	}
}

function fail(message) {
	console.error(`\n${message}\n`);
	process.exit(1);
}
