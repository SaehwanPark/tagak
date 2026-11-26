# 플랫폼 검증표

현재 개발 기준은 **macOS 14+ · Tauri 2/WebKit**이다. 이 환경에서 설치·빌드·실행 또는 기본 한글 연습을 막는 치명적 문제가 재현된 경우에만 현재 개발을 멈춘다. 검증 도구의 한계나 확인되지 않은 항목은 실패가 아닌 증거 공백으로 기록한다.

| 환경 | 확인한 내용 | 남은 확인 |
| --- | --- | --- |
| **macOS 14+ · Tauri 2/WebKit (현재 기준)** | 2026-11-22 macOS 27.2.1 · Apple Silicon에서 Tauri 2.12.7 호스트의 `.app`/DMG 빌드가 통과했다. DMG의 앱에서 `tauri://localhost`, `⌘S` 네이티브 저장 대화상자·선택 경로 PNG, 네이티브 JSON 내보내기·가져오기를 직접 검증했다. 사용자는 오프라인 첫 실행, 실제 2-Set Korean IME의 조합·Backspace·Enter·Space, 키보드 초점·창 복귀, 두 번째 실행, 설정·연습·베네치아 기록의 재실행 보존을 정상 확인했다고 보고했다. 2026-11-26 v0.14.0 DMG를 실행해 macOS의 창 이동·크기 조절과 종료 후 재실행 복원을 확인했다. 창 Zoom 상태도 저장 파일에서 확인하고 재실행 후 복원했다. 2026-11-26 v0.15.0 앱에서 키보드 `?` 도움말 열기, Esc 닫기·초점 복귀, `s` 설정·`r` 기록 이동과 설정↔기록 전환, 연습 입력 중 `s` 문자 입력을 확인했다. 2026-11-26 v0.16.0 앱에서 10자 입력 후 Esc 종료 확인, `계속 연습` 기본 초점, Esc 취소 후 입력·초점 복구, 뒤로 버튼 확인과 종료를 확인했다. v0.17.0 DMG 앱에서 30초 도전을 설정·기록 화면에 둔 채 약 7초 기다린 뒤 복귀해 남은 시간이 이어지는 것을 확인했다. | 실제 2차 물리 모니터 분리와 해상도/DPI 변경은 수동 재현하지 않았다. 작은 viewport/큰 글자/영어·라이트 테마는 Playwright에서 검증했으며, 창 경계·DPI 환산은 Rust 단위 테스트로 확인했다. C2에서 실제 OS 한글 IME 조합·물리 키 반복과 Windows Tauri 앱의 도움말·이동 단축키는 수동 미확인이다. C3에서 실제 OS IME 조합·물리 키 반복과 Windows Tauri의 종료 확인은 수동 미확인이다. C4에서 실제 OS IME, 네이티브 창 비활성 전환, Windows Tauri 타이밍 수동 확인은 하지 않았다. |
| **Windows 11 · Tauri 2/WebView2 (A32 지원)** | 2026-11-22 Windows 11 Pro build 26100.9818 · WSL2 Fedora 43에서 Windows 임시 작업 디렉터리에 소스 스냅샷을 만들고 호스트 Windows Node 26.13.0/npm 12.2.0, Rust MSVC stable, Visual Studio Build Tools 2022로 `npm run desktop:build:windows`를 실행했다. `npm ci`, `npm run build`, Rust release, per-user NSIS 설치 파일 생성이 통과했다. `Tagak_0.3.0_x64-setup.exe`는 2,382,364 bytes (2.27 MiB)다. 격리 프로필과 WebView2 외부 네트워크 차단 설정에서 앱 오프라인 실행, 단일 인스턴스, 네이티브 `Ctrl+S` PNG 저장, JSON 백업 내보내기·가져오기와 병합을 확인했다. 설치된 Microsoft 한국어 IME의 Type 3 배열을 `Shift+Space`로 선택하고 OS 키 입력 이벤트로 `연필`을 입력했다. 첫 Enter는 조합 확정, 두 번째 Enter는 제출로 처리됐다. 재실행 뒤 영어 UI 설정, 연습 기록 1건, 베네치아 최근 기록 1건·Top 10 1건이 보존됐다. | 이 수동 확인은 현재 Windows 11 호스트와 설치된 WebView2 런타임에 한정한다. 이슈 #58의 기본 창 크기 1120×960과 홈 메뉴 무스크롤 표시는 실제 앱 창에서 확인하지 않았다. 물리 키보드로 별도 재확인, 200% 확대, Windows Edge, 다른 Windows 기기 검증과 자동화 테스트 스위트는 이 슬라이스에서 수행하지 않았다. |
| Windows 11 · Chrome (보조) | Windows 호스트 Node 26.13.0 / npm 12.2.0에서 엄격한 `npm ci`, `npm run build`, `node serve.mjs`와 루프백 HTTP 200을 확인했다. Chrome의 기본 한글 연습, 다음 문장, 점수와 메뉴 복귀도 확인했다. 2026-11-18 사용자 수동 감사에서 실제 Microsoft 한국어 IME 조합, Backspace 수정, 조합 확정 Enter와 제출 Enter 구분, 새 프로필의 오프라인 연습, 200% 확대, A10 테마와 A11 글꼴을 모두 정상 확인했다고 보고했다. 2026-11-22 사용자 확인에서 베네치아의 Windows 11 · Chrome 게임 동작과 밸런스도 정상이라고 확인했다. | A17은 IME Space 이벤트 변경 이후의 Windows Chrome 수동 회귀를, A18은 실제 Windows Chrome Alt+Tab 복귀를 확인하지 않았다. 베네치아 게임의 실제 입력과 밸런스 수동 기준은 2026-11-22 사용자 확인으로 완료 처리했다. 컴퓨터 제어 도구가 로컬 URL 허용을 확인하지 못해 검증을 중단했던 이력은 실패 재현이 아닌 증거 공백이다. Windows Edge는 별도의 후속 호환성 범위다. |
| macOS · Chrome (보조, A30 리뷰 보고) | 2026-11-22 사용자가 베네치아의 macOS · Chrome 게임 동작과 매끄러운 밸런스를 확인했다. | 이 확인은 A30과 브라우저 경로에 한정한다. Tauri 앱 또는 모든 macOS 버전의 통과로 확대하지 않는다. |
| macOS · Playwright Chromium (A31 자동화) | 2026-11-22 `npm ci && npm run verify` 통과: Vitest 15개 파일 89개 테스트, 프로덕션 빌드, Playwright 58개. 기본 앱 JS 청크는 494.90KB이며 500KB 경고가 없다. 기존 A30 회귀와 데이터 백업/가져오기 흐름, 저장 충돌·손상 입력 처리를 확인했다. | 자동화는 패키지 앱의 오프라인 동작이나 실제 OS 입력기 검증을 대신하지 않는다. A30의 수동 플랫폼 확인은 해당 사용자 보고 행에 기록했다. |
| macOS Tahoe · Chrome 157 (이슈 범위 확인) | 이슈 #23의 사전 수정 재현은 기본 한국어 두벌식 입력기에서 조합 중 Space 한 번이 두 칸 공백을 남기는 것이었다. 2026-11-18 사용자 실제 입력기 확인에서 수정 후 `한글을` 뒤 Space 한 번이 공백 하나만 남기고, 제시문 완료 뒤 Space 한 번이 한 단계만 이동하는 것을 확인했다. 이슈 #24의 두 상단 버튼 위쪽 좌표도 각각 95.3 CSS px로 맞는 것을 확인했다. | 이번 검증은 이슈 #23의 IME 흐름과 #24의 연습 화면 정렬에 한정한다. Windows Chrome 기준 환경은 아니며 macOS 전체 호환성 또는 Safari 확인을 뜻하지 않는다. |
| Windows 11 · Edge (후속) | 확장 탭에서 로컬 배포물과 연습 입력창을 열었다. | Edge 호환성은 현재 기준이 아니다. |
| macOS · Safari (후속) | 실제 macOS 런타임 검증 전. 사용자 로그에서 npm 12.2.0 `npm ci`는 완료됐지만 잠금 파일의 macOS 전용 선택 의존성 `fsevents@2.3.3` 설치 스크립트가 차단됐다는 경고가 있었다. 프로젝트는 이 잠긴 버전만 `allowScripts`에서 승인한다. | macOS 설치·빌드와 Safari·한국어 IME 호환성. 승인 설정은 경고 원인을 다루며 macOS 앱 검증을 뜻하지 않는다. |
| Ubuntu · Firefox · IBus 한글 두벌식 (보조) | 실제 조합, Backspace, 조합 확정과 제출용 Enter, Esc 메뉴 복귀, 브라우저 200% 확대를 확인했다. Chromium·Firefox·WebKit 배포물 자동 확인도 마쳤다. | 보조 환경 증거로 유지한다. |

Playwright의 `CompositionEvent` 테스트는 앱이 합성 IME 이벤트 순서를 처리하는지 확인한다. 운영체제의 실제 입력기를 구동하는 검증으로 간주하지 않는다.

## D1 · 공개 문서와 콘텐츠 권리 정리

- 2026-11-26 `npm run verify` 통과: Vitest 25개 파일 176개 테스트, 프로덕션 빌드, Playwright E2E 86개. E2E에서 환경설정의 저작권·제3자 고지 진입, CC BY-SA 안내와 Rust 의존성 목록, 앱 복귀를 확인했다. Playwright Chromium에서 캡처한 README 이미지는 실제 앱 빌드 UI이며 합성 목업이 아니다.
- `npm run desktop:build` 통과: macOS ARM64 `Tagak_0.19.0_aarch64.dmg`(3.32 MiB)를 생성했다. DMG 안의 앱을 실행하고 환경설정에서 `tauri://localhost/THIRD-PARTY-NOTICES.html`을 열었다. CC BY-SA 4.0 글의 저자·출처·변경 사항, 저작권법 제7조 연결, 런타임 JavaScript 7개와 macOS 대상 Rust 247개 목록이 표시되는 것을 확인했다. 외부 링크는 열지 않아 고지 화면에 네트워크 연결이 필요하지 않다.
- 이번 확인에서 실제 OS IME로 연습하거나 Windows 설치 패키지를 만들지는 않았다. D1은 입력·채점·저장 동작을 바꾸지 않았으며, Windows 릴리즈 빌드 자동화는 별도 D2 슬라이스에서 검증한다.

## D2 · 네이티브 릴리즈 자동화

- 2026-11-26 PR [#85](https://github.com/SaehwanPark/tagak/pull/85)의 [Actions run 45847973680](https://github.com/SaehwanPark/tagak/actions/runs/45847973680)에서 `macos-15` ARM64와 `windows-2025` x64 검증·패키지 작업이 모두 통과했다. 두 runner에서 lockfile 기반 설치, Vitest 176개, 프로덕션 웹 빌드, Playwright E2E 86개와 Tauri 패키징을 확인했다. PR 이벤트라 공개 Release job은 실행하지 않았다.
- macOS artifact `Tagak_0.19.0_aarch64.dmg`는 3,483,269 bytes이며 다운로드한 DMG에서 `hdiutil verify` 체크섬 검증이 통과했다. 포함 앱의 서명은 `Signature=adhoc`, `TeamIdentifier=not set`; Developer ID 서명이나 공증이 없다. 로컬 `spctl -a -vv` 평가는 `code has no resources but signature indicates they must be present`를 반환했으므로, 다운로드한 앱의 Gatekeeper 경고·실행 제한 가능성을 릴리즈 노트에서 알린다. 최종 v1.0.0 산출물에서도 서명과 실행 평가를 다시 확인한다.
- Windows artifact `Tagak_0.19.0_x64-setup.exe`는 2,418,489 bytes이고 PE32/NSIS 설치 프로그램으로 식별됐다. Actions에서 빌드와 업로드는 통과했으나 실제 Windows 11 호스트에서 설치·실행하거나 Authenticode 상태를 확인한 것은 아니다. 최종 산출물에서 서명 상태를 확인하고 릴리즈 노트에 실제 결과를 적는다.
- 이 검증은 최종 버전 정렬·태그 기반 정식 게시 경로를 실행하지 않았다. 최종 릴리즈에서 태그가 현재 `main` HEAD와 버전에 일치하는지, 첨부 자산·체크섬·노트와 공개 Release 상태를 다시 확인한다. 두 runner는 [GitHub-hosted runner labels](https://docs.github.com/en/actions/reference/runners/github-hosted-runners)에 따라 macOS ARM64와 Windows x64를 제공한다.

## A37 · 데스크톱 창 내 레이아웃과 내부 스크롤

- 2026-11-24 macOS 호스트에서 `npm run verify`를 통과했다: Vitest 18개 파일 103개 테스트, 프로덕션 빌드, Playwright E2E 69개. Playwright Chromium은 1120×960, 900×700, 760×560, 1280×560 및 320×420 viewport에서 가로·세로 문서 바깥 스크롤, 내부 목록 스크롤과 포커스 reveal, 영어 UI·종이 테마·큰 글자, 백업 오류 알림, 지문·기록·베네치아 Top 10 키보드/포인터 스크롤, 연습·도전 필수 조작, 창 크기 변경 중 베네치아 보드 상태를 확인했다. 프로덕션 앱 JS 청크는 524.45KB로 Vite의 500KB 경고 기준을 넘는다.
- `npm run desktop:build`는 macOS `.app`과 DMG 생성을 통과했다. 데스크톱 제어 도구가 빌드 앱 창에 연결되지 않아 Tauri/WebKit에서 실제 창 크기 변경과 내부 스크롤을 수동 확인하지 못했다. 이 증거 공백은 런타임 실패를 뜻하지 않는다.
- Windows 11 Tauri/WebView2 앱의 창 크기 변경과 내부 스크롤은 수동 재확인하지 않았다. 입력·채점·IME 코드는 바꾸지 않았으며 이번 슬라이스에서 실제 OS IME를 다시 구동하지 않았다.

## A38 · 한 줄 콘텐츠·문장 수 설정·세션 통계 개선

- 2026-11-25 macOS 호스트에서 `npm run verify`를 통과했다: Vitest 19개 파일 110개 테스트, 프로덕션 빌드, Playwright E2E 71개. E2E는 세션 5문장·20문장 완료, 설정 저장·초기화, 통계 표본 제외와 P25–P75 표시를 확인했다. 앱 JS 청크는 555.59KB로 Vite의 500KB 경고 기준을 넘는다.
- `npm run desktop:build`가 macOS `.app`과 3.29 MiB DMG를 생성했다. 빌드 과정에서 `src-tauri/src/main.rs:30`의 기존 `window` 미사용 경고가 나왔다. 이번 슬라이스에서 빌드 앱 GUI를 열어 수동 조작하거나 실제 OS IME를 다시 입력하지는 않았다.
- 이번 변경은 콘텐츠 읽기, 설정 저장·표시, 세션 종료 통계에 한정된다. 실제 OS IME 경로와 Windows 데스크톱 설정·백업의 수동 회귀는 검증하지 않았다.

## A39 · 연습 세션 하이스코어와 통계적 갱신 보상

- 2026-11-25 macOS 호스트에서 `npm run verify`를 통과했다: Vitest 21개 파일 122개 테스트, 프로덕션 빌드, Playwright E2E 75개. E2E는 한 줄 완료·조기 종료, 짧은 글 완료·조기 종료 세션, 세션 통계, 한국어/영어 하이스코어 안내, 안정적인 갱신과 음소거·상승음, 하이스코어만 초기화, 세션/하이스코어 백업·복원을 확인했다. 앱 JS 청크는 573.40KB로 Vite의 500KB 경고 기준을 넘는다.
- `npm run desktop:build`가 `Tagak.app`과 3.30 MiB `Tagak_0.10.0_aarch64.dmg`를 생성했다. Rust 빌드에서 `src-tauri/src/main.rs:30`의 기존 `window` 미사용 경고가 있었다.
- 이 슬라이스는 IME 입력 경계를 변경하지 않았다. 앱 GUI에서 결과·기록을 직접 조작하거나 실제 OS IME를 다시 입력하지는 않았다. 앱 빌드와 브라우저 E2E는 통과했으며 이 수동 확인 공백은 런타임 실패를 뜻하지 않는다.

## C2 · 조작 발견 가능성

- 2026-11-26 macOS 호스트에서 `npm run verify`를 통과했다: Vitest 23개 파일 159개 테스트, 프로덕션 빌드, Playwright E2E 80개. E2E는 홈의 선택형 도움말, 한국어·영어 안내, `?` 도움말 초점 복귀, `s`/`r` 화면 이동과 복귀, 연습 입력창에서 단축키를 문자로 입력하는 흐름, 작은 viewport에서 도움말 영역 스크롤을 확인했다. JS 청크는 586.29KB로 Vite의 500KB 경고 기준을 넘는다.
- `npm run desktop:build`가 macOS ARM64 `.app`과 3.32 MiB DMG를 생성했다. DMG 앱에서 `?`, Esc, `s`, `r` 키 흐름과 연습 입력을 확인했다.
- 브라우저 E2E의 합성 조합 상태 검증은 실제 OS 한글 IME 검증을 대신하지 않는다. 이 슬라이스에서 OS IME 조합·물리 키 반복과 Windows Tauri GUI는 직접 확인하지 않았다.

## C3 · 세션 종료 보호

- 2026-11-26 macOS 호스트에서 `npm run verify`를 통과했다: Vitest 24개 파일 162개 테스트, 프로덕션 빌드, Playwright E2E 83개. E2E는 빈 입력과 임계값 경계, 한 줄·짧은 글·긴 글의 부분 입력 보호, 기본 초점, 취소 후 입력·초점 복구, 조합 중 Escape 무시, 반복 키 억제, 조기 종료 기록과 하이스코어 제외를 확인했다. JS 청크는 588.57KB로 Vite의 500KB 경고 기준을 넘는다.
- `npm run desktop:build`가 macOS ARM64 `.app`과 3.32 MiB DMG를 생성했다. DMG 앱에서 현재 입력을 입력한 뒤 Esc로 확인을 열고 기본 초점과 취소 복귀를 직접 확인했으며, 뒤로 버튼으로 확인을 다시 연 뒤 종료했다.
- 브라우저 조합 이벤트 테스트는 실제 OS 한글 IME 조합 검증을 대신하지 않는다. 실제 OS IME 조합·물리 키 반복과 Windows Tauri 앱은 이번 슬라이스에서 직접 확인하지 않았다.

## C5 · 하이스코어 피드백

- 2026-11-26 `npm run verify` 통과: Vitest 25개 파일 176개 테스트, 프로덕션 빌드, Playwright E2E 85개. E2E는 한국어/영어 첫 기록, 안정적 갱신, 키보드 disclosure, 원시 중간값·표시 단위·향상률·p값 설명을 확인했다. JS 청크는 595.95KB로 Vite의 500KB 경고 기준을 넘는다.
- `npm run desktop:build`가 macOS ARM64 `Tagak_0.18.0_aarch64.dmg`(3.32 MiB)를 생성했다. 마운트한 DMG 앱에서 첫 최고 기록 `757 타수/분`과 상세 설명, 정확도 0% 세션의 97% 미달 안내를 Tauri/WebKit에서 확인했다.
- 네이티브 확인에서 문장은 CUA 접근성 `setValue`로 입력했으므로 실제 macOS IME 조합은 검증하지 않았다. 비교 갱신 성공/유지와 표본 부족 사유는 자동 테스트로 확인했다. 테스트 중 만든 연습 기록은 기존 데이터를 복원해 제거했고, 기존 세 기록과 20문장 설정을 확인했다. Windows Tauri 앱은 이번 슬라이스에서 수동 확인하지 않았다.

기준 환경의 재현 절차와 완료 상태는 [실행 체크리스트](SPEC.md)의 A06 항목에 기록한다. 자유 입력 연습(A08)은 점수나 앱 저장 데이터를 만들지 않는다. A09는 사용자가 직접 저장을 요청했을 때만 입력이 이미지 파일에 포함된다.
