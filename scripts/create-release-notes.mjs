import { readFileSync } from "node:fs";

const tag = process.argv[2];
const match = tag?.match(/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);

if (!match) {
  throw new Error("Release tag must use vMAJOR.MINOR.PATCH: " + (tag ?? "(missing)"));
}

const version = tag.slice(1);
const changelog = readFileSync("CHANGELOG.md", "utf8");
const lines = changelog.split(/\r?\n/);
const headingIndex = lines.findIndex((line) => line === "## [" + version + "]" || line.startsWith("## [" + version + "] -"));

if (headingIndex < 0) {
  throw new Error("CHANGELOG.md has no section for " + version);
}

const section = [];

for (const line of lines.slice(headingIndex + 1)) {
  if (/^##? \[/.test(line)) break;
  section.push(line);
}

const changelogNotes = section.join("\n").trim();

if (!changelogNotes) {
  throw new Error("CHANGELOG.md section for " + version + " is empty");
}

console.log("# Tagak " + tag + "\n");
console.log(changelogNotes);
console.log("\n## 다운로드 및 설치\n");
console.log("- macOS 14 이상 · Apple Silicon: Tagak_" + version + "_aarch64.dmg을 열고 앱을 Applications 폴더로 옮깁니다.");
console.log("- Windows 11 · x64: Tagak_" + version + "_x64-setup.exe를 실행해 현재 사용자 계정에 설치합니다.");
console.log("- 두 설치 파일과 SHA256SUMS.txt를 같은 릴리즈에서 받으세요.");
console.log("- macOS는 Apple Developer ID 서명과 공증을 하지 않았습니다. Gatekeeper가 경고하거나 실행을 제한할 수 있습니다. 시스템 전체 보호 기능을 끄지 마세요.");
console.log("- Windows 설치 파일은 코드 서명하지 않았습니다. SmartScreen 경고가 표시될 수 있습니다. 내려받은 파일의 SHA-256을 확인하세요.");
console.log("- 설정과 연습 기록은 기기에 저장됩니다. 계정, 원격측정, 자동 업데이트는 없습니다.");
console.log("\n## SHA-256 확인\n");
console.log("macOS: shasum -a 256 -c SHA256SUMS.txt");
console.log("Windows PowerShell: Get-FileHash .\\Tagak_" + version + "_x64-setup.exe -Algorithm SHA256");
