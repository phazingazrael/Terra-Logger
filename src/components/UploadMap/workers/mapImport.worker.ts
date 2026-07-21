/// <reference lib="webworker" />

import type {
  MapImportProgress,
  MapImportValidationResult,
  MapImportWorkerMessage,
  MapImportWorkerRequest,
} from "./mapImportTypes";

const ctx: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;

function postProgress(requestId: string, progress: MapImportProgress) {
  const message: MapImportWorkerMessage = {
    type: "PROGRESS",
    requestId,
    progress,
  };

  ctx.postMessage(message);
}

function postError(requestId: string, error: unknown) {
  const message: MapImportWorkerMessage = {
    type: "ERROR",
    requestId,
    error: {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    },
  };

  ctx.postMessage(message);
}

function parseLoadedResultInWorker(
  result: ArrayBuffer,
): [mapFile: string[], mapVersion: number, versionString: string, version: string] {
  const resultAsString = new TextDecoder().decode(result);
  const isDelimited = resultAsString.substring(0, 10).includes("|");
  const decoded = isDelimited
    ? resultAsString
    : decodeURIComponent(atob(resultAsString));

  const mapFile = repairMultilineMapSections(decoded.split(/\r?\n/));
  const versionparts = mapFile[0].split("|")[0].split(".").map(Number);

  if (
    versionparts.length < 3 ||
    versionparts.some((part) => Number.isNaN(part))
  ) {
    throw new Error("Invalid map file: could not read map version.");
  }

  const patchVersion =
    versionparts[2] > 9 ? versionparts[2] : `0${versionparts[2]}`;

  const version = `${versionparts[0]}.${versionparts[1]}.${patchVersion}`;
  const versionString = JSON.stringify(version);
  const mapVersion = Number(`${versionparts[0]}${versionparts[1]}${patchVersion}`);

  return [mapFile, mapVersion, versionString, version];
}

function isValidVersion(versionString: string) {
  if (!versionString) return false;

  const [major, minor, patch] = versionString.split(".");

  return (
    !Number.isNaN(Number(major)) &&
    !Number.isNaN(Number(minor)) &&
    !Number.isNaN(Number(patch))
  );
}

function compareVersions(
  version1: string,
  version2: string,
  options = { major: true, minor: true, patch: true },
) {
  if (!isValidVersion(version1) || !isValidVersion(version2)) {
    return { isEqual: false, isNewer: false, isOlder: false };
  }

  let [major1, minor1, patch1] = version1.split(".").map(Number);
  let [major2, minor2, patch2] = version2.split(".").map(Number);

  if (!options.major) major1 = major2 = 0;
  if (!options.minor) minor1 = minor2 = 0;
  if (!options.patch) patch1 = patch2 = 0;

  const isEqual = major1 === major2 && minor1 === minor2 && patch1 === patch2;
  const isNewer =
    major1 > major2 ||
    (major1 === major2 &&
      (minor1 > minor2 || (minor1 === minor2 && patch1 > patch2)));
  const isOlder =
    major1 < major2 ||
    (major1 === major2 &&
      (minor1 < minor2 || (minor1 === minor2 && patch1 < patch2)));

  return { isEqual, isNewer, isOlder };
}

function validateLoadedMap(
  mapFile: string[],
  version: string,
  currentVersion: string,
  oldestSupportedVersion: string,
): MapImportValidationResult {
  const isInvalid = !mapFile || !version || mapFile.length < 26 || !mapFile[5];

  const isUpdated = compareVersions(version, currentVersion).isEqual;
  const isAncient = compareVersions(version, oldestSupportedVersion).isOlder;
  const isNewer = compareVersions(version, currentVersion).isNewer;
  const isOutdated = compareVersions(version, currentVersion).isOlder;

  return {
    isUpdated,
    isNewer,
    isInvalid,
    isAncient,
    isOutdated,
  };
}

ctx.onmessage = async (event: MessageEvent<MapImportWorkerRequest>) => {
  const request = event.data;

  if (!request || request.type !== "IMPORT_MAP") {
    return;
  }

  const {
    requestId,
    fileName,
    buffer,
    currentVersion,
    oldestSupportedVersion,
  } = request;

  try {
    postProgress(requestId, {
      phase: "reading",
      message: `Reading ${fileName}...`,
      percent: 5,
    });

    postProgress(requestId, {
      phase: "parsing",
      message: "Parsing map container...",
      percent: 35,
    });

    const [mapFile, mapVersion, versionString, version] =
      parseLoadedResultInWorker(buffer);

    const identity = getMapIdentityFromMapFile(mapFile);

    postProgress(requestId, {
      phase: "validating",
      message: `Validating map version ${version}...`,
      percent: 65,
    });

    const validation = validateLoadedMap(
      mapFile,
      version,
      currentVersion,
      oldestSupportedVersion,
    );

    postProgress(requestId, {
      phase: "complete",
      message: "Map container parsed.",
      percent: 100,
    });

    const message: MapImportWorkerMessage = {
      type: "SUCCESS",
      requestId,
      result: {
        fileName,
        mapFile,
        mapVersion,
        versionString,
        version,
        validation,
        identity,
      },
    };

    ctx.postMessage(message);
  } catch (error) {
    postError(requestId, error);
  }
};


function repairMultilineMapSections(parts: string[]): string[] {
  const svgRepaired = repairSvgLineBreakSplit(parts);
  return repairNameBasesLineBreakSplit(svgRepaired);
}

function repairNameBasesLineBreakSplit(parts: string[]): string[] {
  const expectedSectionCount = 39;
  const nameBasesIndex = 31;
  const trailingSectionCount = expectedSectionCount - (nameBasesIndex + 1);

  if (parts.length <= expectedSectionCount) {
    return parts;
  }

  const riversIndex = parts.length - trailingSectionCount;
  const possibleRivers = parts[riversIndex] ?? "";

  // Modern FMG files end with rivers, rulers, fonts, markers, cell routes,
  // routes, and zones. Custom name bases may contain literal line breaks,
  // causing the single names section at index 31 to be split into many lines.
  if (!/^\s*\[\s*\{[\s\S]*\"source\"\s*:/i.test(possibleRivers)) {
    return parts;
  }

  return [
    ...parts.slice(0, nameBasesIndex),
    parts.slice(nameBasesIndex, riversIndex).join("\n"),
    ...parts.slice(riversIndex),
  ];
}

function repairSvgLineBreakSplit(parts: string[]): string[] {
  const svgIndex = 5;

  if (parts.length <= 39) {
    return parts;
  }

  const possibleSvgStart = parts[svgIndex] ?? "";

  if (!/<svg\b/i.test(possibleSvgStart)) {
    return parts;
  }

  let svgDepth = 0;
  let svgEndIndex = -1;

  for (let index = svgIndex; index < parts.length; index += 1) {
    const part = parts[index] ?? "";
    const openingTags = part.match(/<svg\b/gi)?.length ?? 0;
    const closingTags = part.match(/<\/svg\s*>/gi)?.length ?? 0;

    svgDepth += openingTags - closingTags;

    if (svgDepth === 0 && closingTags > 0) {
      svgEndIndex = index;
      break;
    }
  }

  if (svgEndIndex <= svgIndex) {
    return parts;
  }

  return [
    ...parts.slice(0, svgIndex),
    parts.slice(svgIndex, svgEndIndex + 1).join("\r\n"),
    ...parts.slice(svgEndIndex + 1),
  ];
}

function getMapIdentityFromMapFile(mapFile: string[]) {
  const params = mapFile[0]?.split("|") ?? [];
  const settings = mapFile[1]?.split("|") ?? [];

  const name = String(settings[20] ?? "").trim();
  const id = String(params[6] ?? "").trim();

  return {
    name,
    id,
    mapId: `${name}-${id}`,
  };
}
