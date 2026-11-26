# User guide · 사용 안내

This guide covers installation warnings, Korean input, results, and local data. The in-app `?` help explains the available keyboard controls.

## English

### Download and install

Download the installer and its `SHA256SUMS.txt` from the same [latest release](https://github.com/SaehwanPark/tagak/releases/latest). Choose the Apple Silicon DMG for macOS 14 or later, or the x64 installer for Windows 11. The Windows installer is per-user.

The macOS app is ad-hoc signed and not notarized; Gatekeeper may warn or restrict it. The Windows installer is unsigned, so SmartScreen may warn. Compare the downloaded file with the checksum in that release before installing. Do not disable system-wide security protections.

The app works offline after installation. Updates use the same app identity and local storage. Export a backup before moving to another device or reinstalling.

### Practice and Korean input

Choose **One-line**, **Short passages**, or **Long passages** from the home menu. One-line practice starts with 20 sentences; Settings offers 5, 10, 20, 30, 50, 75, or 100. Short and long passages are entered one line at a time, in groups of five.

Submit a complete line with `Enter` or `Space`. A `Space` pressed before the line is complete stays in your input. With a Korean IME, a key used to finish composition does not also submit the line. If `Enter` finishes composition, press it again to submit. If `Space` finishes composition, Tagak inserts one space while text remains, or submits when the line is complete.

Open the home help with `?`. Use arrow keys and `Enter` to move through menus; use `Esc` to go back. The `s` and `r` shortcuts open Settings and recent practice history when the typing field is not active.

### Results and saved data

Accuracy updates while you type. Speed appears when a line is submitted; passage speed appears at the end of each five-line group. Session results summarize submitted lines. High-score comparisons use completed sessions that meet the app's accuracy and sample requirements; the result screen explains when a session does not qualify.

Settings and practice records stay on this device. Tagak does not use an account, telemetry, or an online leaderboard. The app keeps recent practice sessions and separate personal high scores. Venice records are stored separately.

In **Settings → Data backup and import**, export a JSON backup before reinstalling or changing devices. A backup includes settings, practice history, sessions, high scores, and Venice records; unsubmitted text is not included. When imported data meets existing data, choose merge, replace, or cancel. Unsupported or damaged files are not applied.

### Security warning or troubleshooting

If macOS or Windows displays a security warning, first confirm that the installer came from the official release and that its SHA-256 matches `SHA256SUMS.txt`. The current release is not notarized on macOS and is not code-signed on Windows. The release page lists the supported systems and verification evidence.

## 한국어

이 안내는 설치 경고, 한글 입력, 결과와 로컬 데이터 사용법을 다룹니다. 사용할 수 있는 키보드 조작은 앱 안의 `?` 도움말에서 확인할 수 있습니다.

### 다운로드와 설치

[최신 릴리즈](https://github.com/SaehwanPark/tagak/releases/latest)에서 설치 파일과 `SHA256SUMS.txt`를 함께 받으세요. macOS 14 이상은 Apple Silicon용 DMG를, Windows 11은 x64 설치 파일을 선택합니다. Windows 앱은 현재 사용자 계정에 설치됩니다.

macOS 앱은 ad-hoc 서명만 되어 있고 공증되지 않아 Gatekeeper가 경고하거나 실행을 제한할 수 있습니다. Windows 설치 파일은 코드 서명되지 않아 SmartScreen 경고가 표시될 수 있습니다. 설치 전에 해당 릴리즈의 체크섬과 내려받은 파일을 비교하세요. 운영체제의 보안 기능을 전체적으로 끄지 마세요.

설치한 뒤에는 오프라인으로 실행할 수 있습니다. 업데이트는 같은 앱 ID와 로컬 저장소를 사용합니다. 기기를 바꾸거나 앱을 다시 설치하기 전에 백업을 내보내세요.

### 연습과 한글 입력

홈 메뉴에서 **한 줄**, **짧은 글**, **긴 글**을 고릅니다. 한 줄 연습은 처음에 20문장으로 시작하며 환경설정에서 5·10·20·30·50·75·100문장을 선택할 수 있습니다. 짧은 글과 긴 글은 한 줄씩 입력하고 다섯 줄 단위로 진행합니다.

한 줄을 완성한 뒤 `Enter` 또는 `Space`로 제출합니다. 미완성 상태에서 누른 `Space`는 입력에 남습니다. 한글 IME 조합을 끝낼 때 쓴 키는 제출까지 실행하지 않습니다. `Enter`로 조합을 끝냈다면 한 번 더 눌러 제출하세요. `Space`로 조합을 끝냈을 때는 남은 제시문이 있으면 공백 하나를 넣고, 줄이 완성됐으면 제출합니다.

홈에서 `?`로 도움말을 엽니다. 방향키와 `Enter`로 메뉴를 이동하고 `Esc`로 돌아갑니다. 입력창을 벗어난 상태에서 `s`는 환경설정, `r`은 최근 연습 기록을 엽니다.

### 결과와 저장 데이터

입력 중에는 정확도만 갱신됩니다. 속도는 한 줄을 제출할 때 표시되고, 글 속도는 다섯 줄 묶음이 끝날 때 표시됩니다. 세션 결과에는 제출한 줄의 요약이 나옵니다. 하이스코어는 정확도와 유효 표본 조건을 충족한 완료 세션만 비교하며, 자격이 없으면 결과 화면에서 이유를 설명합니다.

환경설정과 연습 기록은 이 기기에만 저장됩니다. 타각은 계정·원격 측정·온라인 순위를 사용하지 않습니다. 최근 연습 세션과 개인 하이스코어는 별도로 보관하며 베네치아 기록도 독립 저장합니다.

재설치하거나 기기를 옮기기 전에 **환경설정 → 데이터 백업·가져오기**에서 JSON 백업을 저장하세요. 백업에는 환경설정, 연습 기록, 세션, 하이스코어, 베네치아 기록이 포함되고 제출하지 않은 입력은 포함되지 않습니다. 가져올 데이터와 기존 데이터가 함께 있으면 병합·전체 교체·취소를 선택할 수 있습니다. 지원되지 않거나 손상된 파일은 적용하지 않습니다.

### 보안 경고와 문제 해결

운영체제 경고가 표시되면 먼저 공식 릴리즈에서 설치 파일을 받았는지, SHA-256이 `SHA256SUMS.txt`와 일치하는지 확인하세요. 현재 macOS 릴리즈는 공증되지 않았고 Windows 설치 파일은 코드 서명되지 않았습니다. 지원 시스템과 확인 근거는 릴리즈 페이지에 있습니다.
