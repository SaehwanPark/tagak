# 플랫폼 검증표

현재 개발 기준은 **macOS 14+ · Tauri 2/WebKit**이다. 이 환경에서 설치·빌드·실행 또는 기본 한글 연습을 막는 치명적 문제가 재현된 경우에만 현재 개발을 멈춘다. 검증 도구의 한계나 확인되지 않은 항목은 실패가 아닌 증거 공백으로 기록한다.

| 환경 | 확인한 내용 | 남은 확인 |
| --- | --- | --- |
| **macOS 14+ · Tauri 2/WebKit (현재 기준)** | 2026-11-22 macOS 27.2.1 · Apple Silicon에서 Tauri 2.12.7 호스트의 `cargo check`와 `.app`/DMG 빌드가 통과했다. DMG의 앱을 열어 `tauri://localhost` 화면을 확인하고 `⌘S` 네이티브 저장 대화상자·선택 경로 PNG, 네이티브 JSON 내보내기·가져오기를 직접 검증했다. 사용자는 오프라인 첫 실행, 실제 2-Set Korean IME의 조합·Backspace·Enter·Space, 키보드 초점·창 복귀, 두 번째 실행, 설정·연습·베네치아 기록의 재실행 보존을 모두 정상 확인했다고 보고했다. | A31 완료 조건의 미확인 항목이 없다. |
| **Windows 11 · Tauri 2/WebView2 (A32 지원)** | 2026-11-22 Windows 11 Pro build 26100.9818 · WSL2 Fedora 43에서 Windows 임시 작업 디렉터리에 소스 스냅샷을 만들고 호스트 Windows Node 26.13.0/npm 12.2.0, Rust MSVC stable, Visual Studio Build Tools 2022로 `npm run desktop:build:windows`를 실행했다. `npm ci`, `npm run build`, Rust release, per-user NSIS 설치 파일 생성이 통과했다. `Tagak_0.3.0_x64-setup.exe`는 2,382,364 bytes (2.27 MiB)다. 격리 프로필과 WebView2 외부 네트워크 차단 설정에서 앱 오프라인 실행, 단일 인스턴스, 네이티브 `Ctrl+S` PNG 저장, JSON 백업 내보내기·가져오기와 병합을 확인했다. 설치된 Microsoft 한국어 IME의 Type 3 배열을 `Shift+Space`로 선택하고 OS 키 입력 이벤트로 `연필`을 입력했다. 첫 Enter는 조합 확정, 두 번째 Enter는 제출로 처리됐다. 재실행 뒤 영어 UI 설정, 연습 기록 1건, 베네치아 최근 기록 1건·Top 10 1건이 보존됐다. | 이 수동 확인은 현재 Windows 11 호스트와 설치된 WebView2 런타임에 한정한다. 물리 키보드로 별도 재확인, 200% 확대, Windows Edge, 다른 Windows 기기 검증과 자동화 테스트 스위트는 이 슬라이스에서 수행하지 않았다. |
| Windows 11 · Chrome (보조) | Windows 호스트 Node 26.13.0 / npm 12.2.0에서 엄격한 `npm ci`, `npm run build`, `node serve.mjs`와 루프백 HTTP 200을 확인했다. Chrome의 기본 한글 연습, 다음 문장, 점수와 메뉴 복귀도 확인했다. 2026-11-18 사용자 수동 감사에서 실제 Microsoft 한국어 IME 조합, Backspace 수정, 조합 확정 Enter와 제출 Enter 구분, 새 프로필의 오프라인 연습, 200% 확대, A10 테마와 A11 글꼴을 모두 정상 확인했다고 보고했다. 2026-11-22 사용자 확인에서 베네치아의 Windows 11 · Chrome 게임 동작과 밸런스도 정상이라고 확인했다. | A17은 IME Space 이벤트 변경 이후의 Windows Chrome 수동 회귀를, A18은 실제 Windows Chrome Alt+Tab 복귀를 확인하지 않았다. 베네치아 게임의 실제 입력과 밸런스 수동 기준은 2026-11-22 사용자 확인으로 완료 처리했다. 컴퓨터 제어 도구가 로컬 URL 허용을 확인하지 못해 검증을 중단했던 이력은 실패 재현이 아닌 증거 공백이다. Windows Edge는 별도의 후속 호환성 범위다. |
| macOS · Chrome (보조, A30 리뷰 보고) | 2026-11-22 사용자가 베네치아의 macOS · Chrome 게임 동작과 매끄러운 밸런스를 확인했다. | 이 확인은 A30과 브라우저 경로에 한정한다. Tauri 앱 또는 모든 macOS 버전의 통과로 확대하지 않는다. |
| macOS · Playwright Chromium (A31 자동화) | 2026-11-22 `npm ci && npm run verify` 통과: Vitest 15개 파일 89개 테스트, 프로덕션 빌드, Playwright 58개. 기본 앱 JS 청크는 494.90KB이며 500KB 경고가 없다. 기존 A30 회귀와 데이터 백업/가져오기 흐름, 저장 충돌·손상 입력 처리를 확인했다. | 자동화는 패키지 앱의 오프라인 동작이나 실제 OS 입력기 검증을 대신하지 않는다. A30의 수동 플랫폼 확인은 해당 사용자 보고 행에 기록했다. |
| macOS Tahoe · Chrome 157 (이슈 범위 확인) | 이슈 #23의 사전 수정 재현은 기본 한국어 두벌식 입력기에서 조합 중 Space 한 번이 두 칸 공백을 남기는 것이었다. 2026-11-18 사용자 실제 입력기 확인에서 수정 후 `한글을` 뒤 Space 한 번이 공백 하나만 남기고, 제시문 완료 뒤 Space 한 번이 한 단계만 이동하는 것을 확인했다. 이슈 #24의 두 상단 버튼 위쪽 좌표도 각각 95.3 CSS px로 맞는 것을 확인했다. | 이번 검증은 이슈 #23의 IME 흐름과 #24의 연습 화면 정렬에 한정한다. Windows Chrome 기준 환경은 아니며 macOS 전체 호환성 또는 Safari 확인을 뜻하지 않는다. |
| Windows 11 · Edge (후속) | 확장 탭에서 로컬 배포물과 연습 입력창을 열었다. | Edge 호환성은 현재 기준이 아니다. |
| macOS · Safari (후속) | 실제 macOS 런타임 검증 전. 사용자 로그에서 npm 12.2.0 `npm ci`는 완료됐지만 잠금 파일의 macOS 전용 선택 의존성 `fsevents@2.3.3` 설치 스크립트가 차단됐다는 경고가 있었다. 프로젝트는 이 잠긴 버전만 `allowScripts`에서 승인한다. | macOS 설치·빌드와 Safari·한국어 IME 호환성. 승인 설정은 경고 원인을 다루며 macOS 앱 검증을 뜻하지 않는다. |
| Ubuntu · Firefox · IBus 한글 두벌식 (보조) | 실제 조합, Backspace, 조합 확정과 제출용 Enter, Esc 메뉴 복귀, 브라우저 200% 확대를 확인했다. Chromium·Firefox·WebKit 배포물 자동 확인도 마쳤다. | 보조 환경 증거로 유지한다. |

Playwright의 `CompositionEvent` 테스트는 앱이 합성 IME 이벤트 순서를 처리하는지 확인한다. 운영체제의 실제 입력기를 구동하는 검증으로 간주하지 않는다.

기준 환경의 재현 절차와 완료 상태는 [실행 체크리스트](SPEC.md)의 A06 항목에 기록한다. 자유 입력 연습(A08)은 점수나 앱 저장 데이터를 만들지 않는다. A09는 사용자가 직접 저장을 요청했을 때만 입력이 이미지 파일에 포함된다.
