# 개발 실행과 빌드

타각 사용자용 설치 파일은 [GitHub Releases](https://github.com/SaehwanPark/tagak/releases)에서 받습니다. 이 문서는 저장소를 수정하거나 앱 패키지를 직접 만들 개발자를 위한 안내입니다.

## 도구

- Node.js LTS 22.12.0 이상
- Tauri 데스크톱 빌드에는 Rust stable
- macOS: macOS 14 이상과 Command Line Tools
- Windows: Windows 11, Rust MSVC 도구 모음, Visual Studio Build Tools

## 데스크톱 앱

### macOS

```sh
npm ci --include=dev
npm run desktop:dev
npm run desktop:build
```

DMG는 `src-tauri/target/release/bundle/dmg/`에 생성됩니다. 패키징 전에 오프라인 제3자 고지 파일을 `package-lock.json`과 현재 macOS 대상의 `Cargo.lock`에서 갱신합니다.

### Windows 11 x64

Windows PowerShell에서 저장소를 연 뒤 실행합니다.

```powershell
npm ci --include=dev
npm run desktop:dev
npm run desktop:build:windows
```

per-user NSIS 설치 파일은 `src-tauri/target/release/bundle/nsis/`에 생성됩니다. 패키징 전에 오프라인 제3자 고지 파일을 현재 Windows 대상에 맞춰 갱신합니다.

Linux Tauri 데스크톱 앱은 지원하지 않습니다. WSL2에서는 Linux 앱을 빌드하지 말고 Windows용 패키지가 필요하면 Windows 호스트의 Node, Rust/MSVC, Visual Studio Build Tools를 사용합니다.

## 브라우저 개발 실행

```sh
npm ci
npm run build
node serve.mjs
```

브라우저에서 [http://127.0.0.1:41793/](http://127.0.0.1:41793/)을 엽니다. 배포 시에는 `dist/`와 `serve.mjs`를 같은 디렉터리에 둡니다. Linux는 이 브라우저 경로만 사용할 수 있습니다.

## 검증 명령

```sh
npm run test                    # Vitest 단위 테스트
npx playwright install chromium # 최초 1회
npm run test:e2e                # Playwright 브라우저 E2E
npm run verify                  # 단위 테스트, 프로덕션 빌드, E2E
npm run text-licenses:update    # TEXT-LICENSES.md 다시 생성
npm run notices:update          # 오프라인 의존성·콘텐츠 고지 갱신
```

CI와 플랫폼 검증의 현재 범위는 [플랫폼 검증표](PLATFORM-VERIFICATION.md), 제품 구조는 [ARCHITECTURE.md](../ARCHITECTURE.md)에 있습니다.
