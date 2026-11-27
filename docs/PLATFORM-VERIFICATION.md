# 플랫폼 검증표

현재 공개 지원 대상은 **macOS 14+ Apple Silicon**과 **Windows 11 x64**다. 브라우저 경로는 개발과 대체 사용을 위해 제공되며 네이티브 데스크톱 빌드의 증거를 대신하지 않는다. 자동화나 패키징 성공을 실제 OS IME·GUI 확인으로 해석하지 않는다.

## 현재 공개 릴리즈: v1.1.0

[v1.1.0 릴리즈](https://github.com/SaehwanPark/tagak/releases/tag/v1.1.0)는 main 커밋 [`fbc31af40e87f5b9a3fe4d1cd907cba74342172e`](https://github.com/SaehwanPark/tagak/commit/fbc31af40e87f5b9a3fe4d1cd907cba74342172e)에서 만들었다. 최종 [태그 Actions 실행](https://github.com/SaehwanPark/tagak/actions/runs/45917897297)에서 macOS ARM64와 Windows x64의 단위·웹 빌드·브라우저 E2E·네이티브 패키지 작업이 완료됐다.

| 대상 | v1.1.0 확인 | 제한·미확인 |
| --- | --- | --- |
| macOS 14+ · Apple Silicon | ARM64 DMG 게시, `hdiutil verify` 체크섬 검사 통과. SHA-256: `b2b3e83e1bf77eb05118027d82fc35ceba1d4cfc31c412c7c881900f807e8458`. | ad-hoc 서명만 있고 Developer ID 인증서와 공증이 없다. 기록된 Gatekeeper 평가가 종료 코드 1을 반환해 macOS가 경고하거나 실행을 제한할 수 있다. v1.1.0 실제 한국어 IME 확인은 기록되지 않았다. |
| Windows 11 · x64 | 현재 사용자용 NSIS 설치 파일 게시. SHA-256: `92bd2ceda46c273c074b4fab27b45b74e3f2b8345268e24ee0500fb5126a7311`. | Authenticode 상태는 `NotSigned`이며 SmartScreen 경고가 표시될 수 있다. v1.1.0 Windows 호스트 GUI 설치와 실제 OS IME 확인은 하지 않았다. |

해시는 게시된 [`SHA256SUMS.txt`](https://github.com/SaehwanPark/tagak/releases/download/v1.1.0/SHA256SUMS.txt)와 일치한다. 최신 설치 파일·체크섬·설치 안내의 원본은 [릴리즈 페이지](https://github.com/SaehwanPark/tagak/releases/latest)다.

## 이전 버전에서 확인한 내용

다음 관찰은 v1.0.0보다 앞선 증거이며 현재 릴리즈의 확인으로 옮겨 해석하지 않는다.

- **Windows 11 Pro · Tauri/WebView2 · v0.3.0:** 현재 사용자 계정 설치 파일 빌드·설치, 오프라인 동작, 로컬 데이터 보존, 설치된 Microsoft 한국어 IME를 확인했다. 조합 확정 Enter와 제출 Enter를 각각 두 번 눌러 구분했다.
- **macOS Apple Silicon · Tauri/WebKit · 2026-11-22:** DMG 앱을 열고 오프라인 동작, 선택 경로 PNG/JSON 파일 접근, 로컬 데이터 보존, 실제 2-Set Korean IME를 확인했다고 보고했다. 원본 기록에서 모든 관찰에 해당하는 하나의 릴리즈 태그는 특정하지 않는다.
- **macOS Tahoe · Chrome 157 · 2026-11-18:** 이슈 #23의 실제 한글 IME Space 동작을 브라우저 경로에서 확인했다. 네이티브 WebKit 앱이나 이후 Windows IME를 검증한 것은 아니다.

Playwright 조합 이벤트는 합성 이벤트 순서를 앱이 처리하는지 확인한다. 실제 OS 입력기를 구동하지 않는다. v1.1.0 패키지의 수동 GUI 설치와 실제 OS IME 확인은 하지 않았다. v1.0.0 릴리즈의 패키징·서명 상태 기록과 이전 슬라이스의 상세 기록은 [v1.0.0 태그의 플랫폼 기록](https://github.com/SaehwanPark/tagak/blob/v1.0.0/docs/PLATFORM-VERIFICATION.md)에 보존한다.
