import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const targetByPlatform = {
  "darwin-arm64": "aarch64-apple-darwin",
  "darwin-x64": "x86_64-apple-darwin",
  "win32-arm64": "aarch64-pc-windows-msvc",
  "win32-x64": "x86_64-pc-windows-msvc",
};
const target = targetByPlatform[`${process.platform}-${process.arch}`];

if (!target) {
  throw new Error(`Unsupported desktop notice target: ${process.platform}-${process.arch}`);
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function externalLink(label, href) {
  return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
}

function table(headers, rows) {
  return `<div class="table-scroll"><table><thead><tr>${headers.map((header) => `<th scope="col">${header}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

const npmLock = readJson("package-lock.json");
const npmRuntime = Object.entries(npmLock.packages ?? {})
  .filter(([name, dependency]) => name.startsWith("node_modules/") && dependency.dev !== true)
  .map(([name, dependency]) => ({
    name: name.slice("node_modules/".length).split("/node_modules/").at(-1),
    version: dependency.version,
    license: dependency.license,
  }))
  .sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));

if (npmRuntime.some((dependency) => !dependency.license)) {
  throw new Error("A production npm dependency has no license metadata in package-lock.json");
}

const cargo = spawnSync("cargo", [
  "metadata", "--format-version", "1", "--locked", "--filter-platform", target,
], { cwd: path.join(root, "src-tauri"), encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });

if (cargo.status !== 0) {
  throw new Error(`cargo metadata failed: ${cargo.stderr || cargo.error?.message || cargo.status}`);
}

const cargoMetadata = JSON.parse(cargo.stdout);
const cargoPackages = cargoMetadata.packages
  .filter((dependency) => dependency.source)
  .map(({ name, version, license }) => ({ name, version, license }))
  .sort((left, right) => left.name.localeCompare(right.name) || left.version.localeCompare(right.version));

if (cargoPackages.length === 0 || cargoPackages.some((dependency) => !dependency.license)) {
  throw new Error("Cargo metadata is empty or a resolved crate has no license metadata");
}

const passageAssets = [
  ...readJson("src/content/assets/passages.ko.json"),
  ...readJson("src/content/assets/passages.en.json"),
];
const copiedPassages = passageAssets.filter((passage) => passage.license === "cc-by-sa-4.0");
const publicDomainPassages = passageAssets.filter((passage) => passage.license === "public-domain");
const traditionalLines = [
  ...readJson("src/content/assets/one-line.ko.json"),
  ...readJson("src/content/assets/one-line.en.json"),
].filter((lesson) => lesson.source === "traditional");

const passageRows = copiedPassages.map((passage) => `<tr>
  <td>${escapeHtml(passage.title)}</td>
  <td>${escapeHtml(passage.language.toUpperCase())}</td>
  <td>${escapeHtml(passage.credit.author)}</td>
  <td>${externalLink(passage.credit.source, passage.credit.url)}</td>
  <td>${externalLink("CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0/")}</td>
  <td>발췌; 타자 연습용 문단·줄바꿈과 화면 줄바꿈을 적용</td>
</tr>`);

const publicDomainRows = publicDomainPassages.map((passage) => `<tr>
  <td>${escapeHtml(passage.title)}</td>
  <td>${escapeHtml(passage.credit.author)}</td>
  <td>${externalLink(passage.credit.source, passage.credit.url)}</td>
  <td>발췌; 화면 표시를 위해 줄바꿈</td>
</tr>`);

const traditionalRows = traditionalLines.map((lesson) => `<tr>
  <td>${escapeHtml(lesson.text)}</td>
  <td>${escapeHtml(lesson.credit.author)}</td>
  <td>${externalLink(lesson.credit.source, lesson.credit.url)}</td>
</tr>`);

const npmRows = npmRuntime.map((dependency) => `<tr>
  <td>${escapeHtml(dependency.name)}</td>
  <td>${escapeHtml(dependency.version)}</td>
  <td><code>${escapeHtml(dependency.license)}</code></td>
</tr>`);

const cargoRows = cargoPackages.map((dependency) => `<tr>
  <td>${escapeHtml(dependency.name)}</td>
  <td>${escapeHtml(dependency.version)}</td>
  <td><code>${escapeHtml(dependency.license)}</code></td>
</tr>`);

const themeCredits = [
  ["Catppuccin Mocha · Catppuccin Latte", "Catppuccin palette", "MIT", "https://github.com/catppuccin/catppuccin/blob/main/LICENSE"],
  ["Tokyo Night", "Tokyo Night VS Code theme", "MIT", "https://github.com/tokyo-night/tokyo-night-vscode-theme/blob/master/LICENSE.txt"],
  ["Nord · Nord Light", "Nord", "MIT", "https://github.com/nordtheme/nord/blob/develop/license"],
  ["Gruvbox Dark", "Gruvbox", "MIT/X11", "https://github.com/morhetz/gruvbox"],
  ["Dracula", "Dracula theme", "MIT", "https://github.com/dracula/dracula-theme/blob/master/LICENSE"],
  ["Rosé Pine", "Rosé Pine theme", "MIT", "https://github.com/rose-pine/rose-pine-theme/blob/main/LICENSE"],
  ["Solarized Light", "Solarized", "MIT", "https://github.com/altercation/solarized/blob/master/LICENSE"],
];

const themeRows = themeCredits.map(([theme, project, license, url]) => `<tr>
  <td>${escapeHtml(theme)}</td>
  <td>${externalLink(project, url)}</td>
  <td>${escapeHtml(license)}</td>
</tr>`);

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>타각 저작권·제3자 고지</title>
  <style>
    :root { color-scheme: light dark; font: 16px/1.55 system-ui, sans-serif; }
    body { max-width: 62rem; margin: 0 auto; padding: 1.5rem; }
    h1, h2 { line-height: 1.2; }
    p, li { max-width: 78ch; }
    a { color: #1967d2; }
    code { overflow-wrap: anywhere; }
    .table-scroll { max-width: 100%; overflow-x: auto; margin: 1rem 0 2rem; }
    table { border-collapse: collapse; min-width: 42rem; width: 100%; }
    th, td { border: 1px solid currentColor; padding: .45rem .6rem; text-align: left; vertical-align: top; }
    th { position: sticky; top: 0; background: Canvas; }
    .return { display: inline-block; margin-bottom: 1.5rem; }
    @media (prefers-color-scheme: light) { a { color: #0645ad; } }
  </style>
</head>
<body>
  <main>
    <a class="return" href="/">타각으로 돌아가기</a>
    <h1>타각 저작권·제3자 고지</h1>
    <p>이 페이지는 설치된 앱에 포함된 연습 자료, 테마 참고 출처, 런타임 및 네이티브 의존성을 정리합니다. 이 앱에는 원격 측정이나 서버 연결이 없습니다. 페이지의 외부 출처 링크를 열 때만 네트워크가 필요합니다.</p>

    <h2>Tagak 소프트웨어</h2>
    <p>Tagak 소프트웨어와 직접 작성한 콘텐츠에는 현재 포괄적인 오픈소스 라이선스가 부여되어 있지 않습니다. 공개 저장소의 열람은 복제·수정·재배포 허가를 뜻하지 않습니다. 각 제3자 자료에는 아래에 표시한 개별 조건이 적용됩니다. 자세한 안내는 저장소의 <a href="https://github.com/SaehwanPark/tagak/blob/main/RIGHTS.md">RIGHTS.md</a>에 있습니다.</p>

    <h2>CC BY-SA 4.0 연습 글 (${copiedPassages.length}편)</h2>
    <p>아래 글은 위키문헌·위키백과 원문에서 발췌했습니다. 타자 연습에 맞춰 발췌 범위와 문단·줄바꿈을 조정했습니다. 각 출처의 저자·제목·원문 링크를 표시하고, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a> 조건으로 제공합니다. 저작자나 출처가 Tagak을 후원·승인한다는 뜻은 아닙니다.</p>
    ${table(["제목", "언어", "원저자", "원문 출처", "라이선스", "변경 사항"], passageRows)}

    <h2>퍼블릭 도메인 글 (${publicDomainPassages.length}편)</h2>
    <p>대한민국 헌법은 <a href="https://www.law.go.kr/lsLinkCommonInfo.do?chrClsCd=010202&amp;lsJoLnkSeq=1029423769">저작권법 제7조 제1호</a>의 보호받지 못하는 저작물에 해당합니다. 아래 자료는 원문에서 발췌했고 화면 표시에는 줄바꿈을 적용했습니다.</p>
    ${table(["제목", "저자", "원문 출처", "변경 사항"], publicDomainRows)}

    <h2>전승 표현의 참고 출처 (${traditionalLines.length}개)</h2>
    <p>아래는 속담·격언의 참고 출처입니다. 출처 링크는 문구의 전승·저자 표기를 확인하기 위한 참고이며, 해당 사이트가 Tagak을 후원한다는 뜻이나 사이트 전체의 라이선스 표시가 아닙니다.</p>
    ${table(["표현", "저자·발화자", "참고 출처"], traditionalRows)}

    <h2>도전 낱말과 베네치아</h2>
    <p>30초 도전 낱말과 베네치아의 한국어 단어 후보는 타각에서 별도로 구성했습니다. 베네치아는 고전 DOS 게임 분위기에서 영감을 얻은 독립 재구성이며, 원작 코드·실행 파일·이미지·폰트·사운드·단어 데이터베이스를 포함하지 않습니다. 베네치아의 점수와 기록은 이 기기에 저장됩니다.</p>

    <h2>색상 팔레트 참고</h2>
    <p>표시된 테마 이름은 팔레트 참고 출처를 식별합니다. 타각은 색을 기존 UI 토큰에 맞춰 조정했고, 참조 프로젝트의 코드·이미지·폰트는 포함하지 않았습니다. 공식 포트나 후원을 뜻하지 않습니다.</p>
    ${table(["타각 테마", "참고 출처 및 라이선스 파일", "출처 라이선스"], themeRows)}

    <h2>JavaScript 런타임 의존성 (${npmRuntime.length}개)</h2>
    <p>아래는 <code>package-lock.json</code>에 고정된 프로덕션 의존성과 라이선스 표현입니다. 개발 전용 도구는 최종 앱의 런타임 목록에서 제외했습니다. 각 의존성의 고지와 배포 조건은 표시된 라이선스에 따릅니다.</p>
    ${table(["패키지", "버전", "라이선스 표현"], npmRows)}

    <h2>Rust 네이티브 의존성 (${cargoPackages.length}개)</h2>
    <p>아래 목록은 이 앱을 만든 <code>${escapeHtml(target)}</code> 대상의 <code>Cargo.lock</code>에서 해석한 네이티브·호스트 빌드 의존성입니다. 라이선스 표현은 각 패키지의 Cargo 메타데이터를 그대로 사용합니다. 여러 대안이 표시되면 패키지에 선언된 선택 조건입니다.</p>
    ${table(["크레이트", "버전", "라이선스 표현"], cargoRows)}

    <h2>기타</h2>
    <ul>
      <li>글꼴은 앱에 번들하지 않고 시스템 글꼴을 사용합니다.</li>
      <li>화면 PNG는 사용자가 저장을 요청할 때에만 생성됩니다.</li>
      <li>앱 설정과 기록은 로컬에 저장되며 서버로 전송되지 않습니다.</li>
    </ul>
    <p>전체 연습 글 인벤토리와 테마 참고 출처는 공개 저장소의 <a href="https://github.com/SaehwanPark/tagak/blob/main/TEXT-LICENSES.md">TEXT-LICENSES.md</a>와 <a href="https://github.com/SaehwanPark/tagak/blob/main/docs/THEME-CREDITS.md">THEME-CREDITS.md</a>에도 있습니다.</p>
  </main>
</body>
</html>
`;

const outputDirectory = path.join(root, "public");
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(path.join(outputDirectory, "THIRD-PARTY-NOTICES.html"), html, "utf8");
console.log(`Updated offline notices for ${target}: ${npmRuntime.length} JavaScript and ${cargoPackages.length} Rust packages`);
