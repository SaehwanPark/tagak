import { readFileSync } from "node:fs";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readCargoPackageVersion(path) {
  const contents = readFileSync(path, "utf8");
  const packageSection = contents
    .split(/(?=^\[)/m)
    .find((section) => section.startsWith("[package]"));

  if (!packageSection) {
    throw new Error("Could not find the [package] section in " + path);
  }

  const version = packageSection.match(/^version\s*=\s*"([^"]+)"\s*$/m)?.[1];

  if (!version) {
    throw new Error("Could not find the package version in " + path);
  }

  return version;
}

function readCargoLockVersion(path, packageName) {
  const packageBlock = readFileSync(path, "utf8")
    .split("[[package]]")
    .find((block) => new RegExp("^name = \"" + packageName + "\"$", "m").test(block));
  const version = packageBlock?.match(/^version = "([^"]+)"\s*$/m)?.[1];

  if (!version) {
    throw new Error("Could not find " + packageName + "'s locked version in " + path);
  }

  return version;
}

const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const specVersion = readFileSync("docs/SPEC.md", "utf8").match(/^현재 버전은.*v([0-9.]+)/m)?.[1];
const versions = {
  "package.json": packageJson.version,
  "package-lock.json": packageLock.version,
  "tauri.conf.json": tauriConfig.version,
  "Cargo.toml": readCargoPackageVersion("src-tauri/Cargo.toml"),
  "Cargo.lock": readCargoLockVersion("src-tauri/Cargo.lock", "tagak"),
  "docs/SPEC.md": specVersion,
};
const uniqueVersions = new Set(Object.values(versions));

if (uniqueVersions.size !== 1) {
  throw new Error("Release versions do not match: " + JSON.stringify(versions));
}

if (!readFileSync("CHANGELOG.md", "utf8").includes("## [" + packageJson.version + "]")) {
  throw new Error("CHANGELOG.md has no release section for " + packageJson.version);
}

const tag = process.argv[2];

if (tag) {
  const match = tag.match(/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);

  if (!match) {
    throw new Error("Release tag must use vMAJOR.MINOR.PATCH: " + tag);
  }

  const tagVersion = tag.slice(1);

  if (tagVersion !== packageJson.version) {
    throw new Error("Tag " + tag + " does not match package version " + packageJson.version);
  }
}

console.log("Release versions match" + (tag ? " " + tag : "") + ": " + packageJson.version);
