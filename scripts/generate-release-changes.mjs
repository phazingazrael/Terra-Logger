#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const EMOJI_SHORTCODES = {
  ":art:": "🎨",
  ":zap:": "⚡️",
  ":fire:": "🔥",
  ":bug:": "🐛",
  ":ambulance:": "🚑",
  ":sparkles:": "✨",
  ":memo:": "📝",
  ":rocket:": "🚀",
  ":lipstick:": "💄",
  ":tada:": "🎉",
  ":white_check_mark:": "✅",
  ":lock:": "🔒",
  ":closed_lock_with_key:": "🔐",
  ":bookmark:": "🔖",
  ":rotating_light:": "🚨",
  ":construction:": "🚧",
  ":green_heart:": "💚",
  ":arrow_down:": "⬇️",
  ":arrow_up:": "⬆️",
  ":pushpin:": "📌",
  ":construction_worker:": "👷",
  ":chart_with_upwards_trend:": "📈",
  ":recycle:": "♻️",
  ":heavy_plus_sign:": "➕",
  ":heavy_minus_sign:": "➖",
  ":wrench:": "🔧",
  ":hammer:": "🔨",
  ":globe_with_meridians:": "🌐",
  ":pencil2:": "✏️",
  ":poop:": "💩",
  ":rewind:": "⏪",
  ":twisted_rightwards_arrows:": "🔀",
  ":package:": "📦",
  ":alien:": "👽",
  ":truck:": "🚚",
  ":page_facing_up:": "📄",
  ":boom:": "💥",
  ":bento:": "🍱",
  ":wheelchair:": "♿️",
  ":bulb:": "💡",
  ":beers:": "🍻",
  ":speech_balloon:": "💬",
  ":card_file_box:": "🗃️",
  ":loud_sound:": "🔊",
  ":mute:": "🔇",
  ":busts_in_silhouette:": "👥",
  ":children_crossing:": "🚸",
  ":building_construction:": "🏗️",
  ":iphone:": "📱",
  ":clown_face:": "🤡",
  ":egg:": "🥚",
  ":see_no_evil:": "🙈",
  ":camera_flash:": "📸",
  ":alembic:": "⚗️",
  ":mag:": "🔍",
  ":label:": "🏷️",
  ":seedling:": "🌱",
  ":triangular_flag_on_post:": "🚩",
  ":goal_net:": "🥅",
  ":dizzy:": "💫",
  ":wastebasket:": "🗑️",
  ":passport_control:": "🛂",
  ":adhesive_bandage:": "🩹",
  ":monocle_face:": "🧐",
  ":coffin:": "⚰️",
  ":test_tube:": "🧪",
  ":necktie:": "👔",
  ":stethoscope:": "🩺",
  ":bricks:": "🧱",
  ":technologist:": "🧑‍💻",
  ":money_with_wings:": "💸",
  ":thread:": "🧵",
  ":safety_vest:": "🦺",

  // Common aliases / older commit-message variants.
  ":pencil:": "✏️",
  ":books:": "📚",
  ":book:": "📖",
  ":book_mark:": "🔖",
  ":warning:": "⚠️",
  ":computer:": "💻",
  ":desktop_computer:": "🖥️",
  ":floppy_disk:": "💾",
  ":gear:": "⚙️",
  ":mag_right:": "🔎",
  ":ok_hand:": "👌",
  ":white_large_square:": "⬜",
  ":black_large_square:": "⬛",
  ":cloud:": "☁️",
  ":whale:": "🐳",
  ":penguin:": "🐧",
  ":apple:": "🍎",
  ":robot:": "🤖",
};

function renderEmojiShortcodes(value) {
  return String(value ?? "").replace(/:[a-z0-9_+-]+:/gi, (match) => {
    return EMOJI_SHORTCODES[match.toLowerCase()] ?? match;
  });
}

const args = parseArgs(process.argv.slice(2));

const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const version = String(packageJson.version ?? "").trim();

if (!version) {
  fail("package.json is missing a version.");
}

const outputPath = path.resolve(args.output ?? "src/generated/releaseChanges.ts");
const remoteName = args.remote ?? "origin";
const repoUrl = args.repo ?? getGithubRepoUrl(remoteName);
const toRef = args.to ?? "HEAD";

if (!repoUrl) {
  fail(`Could not determine GitHub repository URL from remote "${remoteName}".`);
}

const tags = getMergedTags(toRef);
const currentTag = findCurrentVersionTag(tags, version);

const releaseToRef = currentTag?.name ?? toRef;
const previousTag = findPreviousTag(tags, currentTag, version);

const commits = getCommits(previousTag?.name ?? null, releaseToRef);
const parsedCommits = commits.map((commit) => {
  const parsedSubject = parseCommitSubject(commit.rawSubject);

  return {
    hash: commit.hash,
    shortHash: commit.shortHash,
    date: commit.date,
    subject: renderEmojiShortcodes(commit.rawSubject),
    type: parsedSubject.type,
    scope: parsedSubject.scope,
    details: parsedSubject.details,
    breaking: parsedSubject.breaking,
    url: `${repoUrl}/commit/${commit.hash}`,
  };
});

const majorChanges = parsedCommits.filter((commit) => isMajorChange(commit));

const typeOptions = [
  ...new Set(parsedCommits.map((commit) => commit.type || "other")),
].sort();

const scopeOptions = [
  ...new Set(
    parsedCommits
      .map((commit) => commit.scope)
      .filter((scope) => typeof scope === "string" && scope.length > 0),
  ),
].sort();

const releaseChanges = {
  version,
  previousTag: previousTag?.name ?? null,
  currentTag: currentTag?.name ?? version,
  compareUrl: previousTag
    ? `${repoUrl}/compare/${encodeURIComponent(previousTag.name)}...${encodeURIComponent(currentTag?.name ?? version)}`
    : null,
  commitCount: parsedCommits.length,
  majorChanges,
  typeOptions,
  scopeOptions,
  commits: parsedCommits,
  generatedAt: new Date().toISOString(),
};

mkdirSync(path.dirname(outputPath), { recursive: true });

writeFileSync(outputPath, renderGeneratedFile(releaseChanges), "utf8");

console.log(`Generated ${path.relative(process.cwd(), outputPath)}`);
console.log(`Version: ${version}`);
console.log(`Previous tag: ${previousTag?.name ?? "none"}`);
console.log(`Commits: ${parsedCommits.length}`);

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    switch (arg) {
      case "--output":
        parsed.output = requireValue(argv, ++index, "--output");
        break;

      case "--repo":
        parsed.repo = requireValue(argv, ++index, "--repo");
        break;

      case "--remote":
        parsed.remote = requireValue(argv, ++index, "--remote");
        break;

      case "--to":
        parsed.to = requireValue(argv, ++index, "--to");
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

function getMergedTags(toRef) {
  const raw = git(
    [
      "for-each-ref",
      "--merged",
      toRef,
      "--sort=-creatordate",
      "--format=%(refname:short)%09%(creatordate:iso8601-strict)",
      "refs/tags",
    ],
    { allowEmpty: true },
  );

  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, dateRaw] = line.split("\t");

      return {
        name,
        date: dateRaw ? new Date(dateRaw) : new Date(0),
      };
    })
    .filter((tag) => Number.isFinite(tag.date.getTime()));
}

function findCurrentVersionTag(tags, version) {
  return (
    tags.find((tag) => tag.name === version) ??
    tags.find((tag) => tag.name === `v${version}`) ??
    null
  );
}

function findPreviousTag(tags, currentTag, version) {
  if (currentTag) {
    const currentIndex = tags.findIndex((tag) => tag.name === currentTag.name);
    return tags[currentIndex + 1] ?? null;
  }

  return (
    tags.find((tag) => tag.name !== version && tag.name !== `v${version}`) ??
    null
  );
}

function getCommits(previousRef, currentRef) {
  const range = previousRef ? `${previousRef}..${currentRef}` : currentRef;

  const raw = git(
    [
      "log",
      range,
      "--date=iso-strict",
      "--pretty=format:%H%x1f%h%x1f%ad%x1f%s",
    ],
    { allowEmpty: true },
  );

  if (!raw.trim()) {
    return [];
  }

  return raw
    .split("\n")
    .map((line) => {
      const [hash, shortHash, date, rawSubject] = line.split("\x1f");

      return {
        hash,
        shortHash,
        date,
        rawSubject,
      };
    })
    .filter((commit) => commit.hash && commit.rawSubject)
    .sort((left, right) => right.date.localeCompare(left.date));
}

function parseCommitSubject(subject) {
  const normalizedSubject = String(subject ?? "").trim();

  const conventionalCommitMatch = normalizedSubject.match(
    /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<details>.+)$/i,
  );

  if (!conventionalCommitMatch?.groups) {
    return {
      type: "other",
      scope: null,
      details: renderEmojiShortcodes(normalizedSubject),
      breaking: false,
    };
  }

  return {
    type: conventionalCommitMatch.groups.type.toLowerCase(),
    scope: conventionalCommitMatch.groups.scope ?? null,
    details: renderEmojiShortcodes(conventionalCommitMatch.groups.details),
    breaking: Boolean(conventionalCommitMatch.groups.breaking),
  };
}

function isMajorChange(commit) {
  if (commit.breaking) {
    return true;
  }

  return ["feat", "fix", "perf", "refactor"].includes(commit.type);
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

function renderGeneratedFile(releaseChanges) {
  return [
    "/* This file is generated by scripts/generate-release-changes.mjs. */",
    "/* Do not edit manually. */",
    "",
    "export type ReleaseChangeCommit = {",
    "\thash: string;",
    "\tshortHash: string;",
    "\tdate: string;",
    "\tsubject: string;",
    "\ttype: string;",
    "\tscope: string | null;",
    "\tdetails: string;",
    "\tbreaking: boolean;",
    "\turl: string;",
    "};",
    "",
    "export type ReleaseChanges = {",
    "\tversion: string;",
    "\tpreviousTag: string | null;",
    "\tcurrentTag: string;",
    "\tcompareUrl: string | null;",
    "\tcommitCount: number;",
    "\tmajorChanges: ReleaseChangeCommit[];",
    "\ttypeOptions: string[];",
    "\tscopeOptions: string[];",
    "\tcommits: ReleaseChangeCommit[];",
    "\tgeneratedAt: string;",
    "};",
    "",
    `export const releaseChanges: ReleaseChanges = ${JSON.stringify(
      releaseChanges,
      null,
      2,
    )};`,
    "",
  ].join("\n");
}



function git(args, options = {}) {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", options.allowEmpty ? "pipe" : "inherit"],
    });
  } catch {
    if (options.allowEmpty) {
      return "";
    }

    throw new Error(`git ${args.join(" ")} failed.`);
  }
}

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}
