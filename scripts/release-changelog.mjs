#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

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
const toRef = args.to ?? "HEAD";
const repoUrl = args.repo ?? getGithubRepoUrl(remoteName);

if (!repoUrl) {
  fail(`Could not determine GitHub repo URL from remote "${remoteName}".`);
}

const previousTag = args.from ?? findPreviousReleaseTag(releaseTag, toRef);

if (!previousTag) {
  fail(
    `Could not find a previous release tag. Pass one explicitly: --from <tag>`,
  );
}

const commits = getCommits(previousTag, toRef);

if (commits.length === 0) {
  fail(`No commits found in range ${previousTag}..${toRef}.`);
}

const section = renderReleaseSection({
  version,
  releaseTag,
  previousTag,
  repoUrl,
  commits,
  releaseDate: new Date(),
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
  changelog: currentChangelog,
  version,
  section,
  latestSummary,
});

if (args.dryRun) {
  console.log(section);
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

function parseArgs(argv) {
  const parsed = {
    commit: false,
    tag: false,
    push: false,
    dryRun: false,
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
    `${fromTag}..${toRef}`,
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
  const compareUrl = `${repoUrl}/compare/${encodeTag(previousTag)}...${encodeTag(releaseTag)}`;

  const lines = [
    `## ${version}`,
    "",
    `[Compare changes](${compareUrl})`,
    "",
    formatReleaseDate(releaseDate),
    "",
  ];

  const commitsByDate = groupCommitsByDate(commits);

  for (const group of commitsByDate) {
    lines.push(group.label);
    lines.push("");

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
    "Major Changes since last release:",
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
    const key = toDateKey(commit.date);
    const label = formatCommitGroupDate(commit.date);

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
  const bodyWithoutIntro = stripChangelogIntro(changelog);
  const marker = `## ${version}`;
  const existingIndex = bodyWithoutIntro.indexOf(marker);

  let nextBody = "";

  if (existingIndex >= 0) {
    const nextReleaseIndex = bodyWithoutIntro.indexOf(
      "\n## ",
      existingIndex + marker.length,
    );

    const before = bodyWithoutIntro.slice(0, existingIndex).trimEnd();
    const after =
      nextReleaseIndex >= 0
        ? bodyWithoutIntro.slice(nextReleaseIndex + 1).trimStart()
        : "";

    nextBody = joinDocumentParts([before, section.trimEnd(), after]);
  } else {
    nextBody = joinDocumentParts([section.trimEnd(), bodyWithoutIntro.trimStart()]);
  }

  return joinDocumentParts([
    "# Terra-Logger Changelog",
    latestSummary.trimEnd(),
    nextBody.trimEnd(),
  ]);
}

function stripChangelogIntro(changelog) {
  const firstSectionIndex = changelog.search(/^## /m);

  if (firstSectionIndex < 0) {
    return "";
  }

  return changelog.slice(firstSectionIndex).trimStart();
}

function joinDocumentParts(parts) {
  return `${parts.filter((part) => part.trim()).join("\n\n")}\n`;
}

function findPreviousReleaseTag(currentTag, toRef) {
  const raw = git(["tag", "--merged", toRef, "--sort=-creatordate"], {
    allowEmpty: true,
  });

  const tags = raw
    .split("\n")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => tag !== currentTag)
    .filter((tag) => tag !== `v${currentTag}`);

  return tags[0] ?? null;
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
  return commandSucceeds(["rev-parse", "--verify", "--quiet", `refs/tags/${tagName}`]);
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
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatCommitGroupDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
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
