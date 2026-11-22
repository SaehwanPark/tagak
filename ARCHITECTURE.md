# 타각(Tagak) ARCHITECTURE

타각(Tagak)의 구조와 설계 결정을 정리한 문서입니다. 처음 코드를 보는 개발자가 "어디를 고쳐야 하는지" 빨리 찾을 수 있도록 계층, 데이터 흐름, 불변식, 검증 방법을 다룹니다. 제품 요구사항은 [docs/PROJECT-SPEC.md](docs/PROJECT-SPEC.md)를 따릅니다.

- 스택: TypeScript(strict) + React 19 + CSS, Vite 빌드, Vitest + Playwright 검증
- 배포: 정적 `dist/` + Node.js 내장 모듈만 쓰는 `serve.mjs`
- 상태: 도메인은 순수 함수, 브라우저 입출력은 경계로 격리

## 한눈에 보는 구조

```
키보드·IME → 확정된 입력과 시각 → 순수 상태 전이 → 화면 갱신 → 기록 저장 / 완료 효과음
             (ui/TypingInput)      (domain/*)         (app/usePractice)   (storage/*, ui/completionSound)
```

| 위치 | 책임 | 브라우저·React 의존 |
| --- | --- | --- |
| `src/domain/` | 세션 타입, 상태 전이, 입력 비교, 점수 계산, 줄바꿈, 기록 정렬 | 없음 (순수) |
| `src/content/` | 애셋 JSON 읽기·검증, 화면 문구, 연습 자료 구성 | 없음 (모듈 로드 시 검증) |
| `src/storage/` | localStorage 읽기·검증·마이그레이션·저장 | `localStorage`, `navigator.locks` |
| `src/app/` | 화면 전환 reducer, 저장·설정 훅, 결과 기록 큐 | React 훅 |
| `src/ui/` | React 화면, IME 입력 어댑터, 초점, PNG 저장, 효과음 | DOM, React |

의존 방향은 대체로 `ui → app → storage → domain`이고, `content/`는 `domain/` 위에 놓입니다. 지켜야 할 규칙은 **`domain/`이 브라우저·React·저장소에 의존하지 않는다**는 점입니다. `domain/`은 `content/`에서 `Language`·`NonEmpty` 같은 **타입만** 가져오고, `content/`는 `domain/`의 순수 함수(`splitCharacters`, `wrapText`)를 값으로 씁니다. 이 경계가 깨지면 순수 함수 테스트가 브라우저 환경을 요구하게 되므로 리뷰에서 우선 확인합니다.

## 디렉터리 지도

```
src/
├── domain/                 # 순수 규칙
│   ├── typing.ts           # 세션·채점·한글 타수·문자소 분할·실시간 정확도
│   ├── typingSpeed.ts      # cpm/wpm 단위 변환
│   ├── textLayout.ts       # 5줄 묶음, 폭 기준 줄바꿈
│   ├── passagePractice.ts  # 글 연습 진행, 묶음/글 전체 누적, 묶음 종료 판정
│   ├── positions.ts        # 두벌식 자리 연습 세션
│   ├── challenge.ts        # 30초 도전 상태 기계
│   ├── venice.ts           # 베네치아 게임 상태 전이·레벨·효과·추천·득점
│   └── history.ts          # 기록 모드·정렬·중복 제거·직전 기록 비교
├── content/
│   ├── interfaceText.ts    # 한국어/영어 UI 문구 (InterfaceText 타입)
│   ├── lessons.ts          # 낱말·한 줄 자료 타입과 검증, 한글 문장부호 정리
│   ├── library.ts          # 애셋 JSON → 활동 목록, 도전 낱말
│   ├── veniceWords.ts      # 베네치아 한글 낱말 애셋 검증·타수 계산
│   ├── passages.ts         # 글 애셋 검증(라이선스·출처)과 줄바꿈
│   ├── textLicenseInventory.ts # 연습문 출처·라이선스 문서 생성
│   └── assets/*.json       # 연습 자료 원본 (venice-words.ko.json 별도 풀)
├── storage/
│   ├── appPreferences.ts   # 언어·완료 효과음·속도 단위 (v2)
│   ├── settingsStorage.ts  # 글자 크기 / 테마 / 언어별 글꼴
│   ├── historyStorage.ts   # 최근 기록 (v3, 구버전 마이그레이션)
│   └── veniceStorage.ts    # 베네치아 최근 30회·Top 10 (독립 v1 스키마)
├── app/
│   ├── usePractice.ts      # 화면 전환 reducer + 완료 기록 큐
│   ├── useHistory.ts       # 기록 저장·동기화·초기화
│   ├── useAppPreferences.ts
│   ├── useTextSize.ts
│   ├── useColorTheme.ts
│   ├── usePracticeFont.ts
│   └── useScreenCapture.ts # Ctrl+S 경계, IME 조합 중 차단
└── ui/
    ├── App.tsx             # 화면 조립, 효과음 트리거
    ├── useScreenFocus.ts   # 탭 복귀·환경설정 왕복 초점 복구
    ├── TypingInput.tsx     # IME 이벤트 어댑터 (가장 민감한 경계)
    ├── PracticeView.tsx    # 낱말·한 줄·글 한 줄 공통 화면
    ├── PassageView.tsx     # 5줄 묶음 문맥
    ├── ChallengeView.tsx / VeniceView.tsx / PositionView.tsx / FreePracticeView.tsx
    ├── ResultView.tsx / HistoryView.tsx / DisplaySettings.tsx
    ├── Scoreboard.tsx / ActivityMenu.tsx / ScreenCaptureControl.tsx
    ├── useFocus.ts         # 마운트 시 초점
    ├── completionSound.ts / veniceSound.ts # Web Audio 피드백
    ├── screenCapture.ts    # html-to-image → PNG 다운로드
    └── styles.css          # CSS 사용자 정의 속성 기반 테마·글꼴
```

## 핵심 도메인 모델

### 세션과 점수

`PracticeSession`(낱말·한 줄·글의 한 줄)은 `input`, `startedAt`, `completedAt`만 가집니다. 시간은 항상 인자로 전달되어 같은 입력에서 같은 결과를 냅니다.

`TypingScore`는 정확도·글자 수·경과 시간과 언어별 속도 값을 담습니다.

- 한국어: `keystrokeCount`, `keystrokesPerMinute` (두벌식 타수 기준)
- 영어: `charactersPerMinute`

표시 단위(cpm/wpm)는 점수에 저장하지 않고 `typingSpeed.ts`에서 변환합니다. 기록에는 원시 값이 남으므로 단위를 바꿔도 과거 기록을 다시 계산할 수 있습니다.

### 실시간 정확도 vs 제출 시점 속도

화면이 연습 중에 보여주는 값은 `calculateLiveAccuracy`(또는 `passageAccuracy`)로, 속도를 의도적으로 `null`로 둡니다. 속도는 연습 단위가 끝날 때만 산출합니다. 이 분리가 없으면 "입력 중 속도 미표시" 규칙이 화면마다 흩어집니다. `PracticeView`는 250ms 타이머 없이 `liveScore()` 콜백만 받습니다.

### 글 연습의 두 스코프

`PassageSession`은 진행을 두 겹으로 누적합니다.

| 필드 | 범위 | 쓰임 |
| --- | --- | --- |
| `passage` | 완료한 줄들의 입력 시간 합 + 현재 줄 | 연습 완료 결과의 글 전체 속도 |
| `bundle` | 현재 5줄 묶음에서 완료한 줄들의 입력 시간 합 + 현재 줄 | 묶음이 끝날 때의 묶음 속도 |
| `lastBundle` | 마지막으로 끝난 묶음 | 다음 줄 화면에 "완료한 묶음" 점수로 표시 |

각 줄은 첫 확정 입력부터 제출까지 시간을 재고, 글 전체·묶음 진행은 그 시간을 누적합니다. 줄을 제출한 뒤 다음 줄의 첫 입력 전까지의 전환·적응 시간은 어느 범위에도 넣지 않습니다. 이 규칙이 없으면 같은 텍스트를 한 줄 연습으로 칠 때보다 글 연습의 타수가 낮게 나옵니다.

`endsBundle(nextLineIndex, lineCount)`가 묶음 경계를 단일 규칙으로 정의합니다. 페이지 경계(`5의 배수`)이거나 마지막 줄이면 묶음이 닫힙니다. 완료 효과음도 같은 함수(`submissionEndsBundle`)를 쓰므로 "소리 시점"과 "속도 보고 시점"이 어긋날 수 없습니다.

### 두벌식 타수 계산

`countKoreanKeystrokes`는 문자열을 문자소로 나눈 뒤, 각 글자를 NFD로 분해해 자모 수를 셉니다. 기본 자음·단모음은 1타, 이중모음·겹받침·겹자음은 2타, 쌍자음은 1타입니다. 한글 음절이 아닌 문자소(공백·문장부호·영문)는 1타입니다.

## 베네치아 게임 (A30)

`domain/venice.ts`는 `ready | playing | paused | finished` 상태와 액션으로 게임 규칙을 전이한다. RNG seed, 시각, 실행 ID와 한글 낱말 풀을 인자로 주입해 같은 상태와 액션에서 같은 결과가 나온다. 화면은 준비·게임·결과를 표시하고, `requestAnimationFrame`을 약 50ms 간격으로 도메인에 전달한다. 도메인은 큰 프레임 지연을 100ms로 제한한다. 탭·창 이탈, 설정 진입, 사용자 일시 정지에서는 시간을 멈추고 다시 시작할 때 시뮬레이션 기준 시각을 재설정한다.

목표 CPM과 점수 배율은 `round(100 * 10 ** ((level - 1) / 13))`으로 100~1000 범위를 만든다. `stageDesign` 표는 레벨별 생성 간격(3,000ms → 512ms; 13레벨 599ms), 낙하 시간(9,000ms → 2,015ms), 동시 낱말 상한(4 → 10), 단어 길이와 특수 낱말 확률(7% → 14%)을 보관한다. 이는 원판 실측값이 아니라 타각판의 초기 밸런스 가정이다. 일반 단어 20개를 생성하고 화면의 낱말이 정리되면 다음 단계로 가며 14단계는 계속 생성한다. 12블록 탑이 모두 손상되면 종료한다.

`candidateVeniceWords(pool, level)`은 단계 길이와 `minimumLevel`을 적용하고, `availableVeniceWords(pool, level, usedWordTexts)`는 현재 게임에서 이미 나온 후보를 제외한다. 후보를 전부 소진한 뒤에만 다시 등장할 수 있다. 콘텐츠에는 `minimumLevel: 7` 110개, `minimumLevel: 11` 70개, `minimumLevel: 13` 118개가 추가됐다. 단계별 후보 수는 1~3레벨 148개, 4~6레벨 149개, 7~10레벨 167개, 11~12레벨 237개, 13~14레벨 209개다. 콘텐츠 회귀 검증은 1~14레벨마다 일반·특수 출현을 합쳐 24개씩, 총 336개를 중복 없이 고를 수 있는지 확인한다.

7~10레벨 후보의 평균 두벌식 입력은 기존 7.30타에서 8.33타, 11~12레벨은 8.88타로 늘었다. 기존 입력 부하를 유지하도록 7~10레벨 생성 간격을 각각 1,383·1,184·1,017·871ms, 11~12레벨은 795·680ms로 늘렸다. 13~14레벨은 평균 11.09타의 209개 후보를 사용하며 생성 간격은 599·512ms다. 낱말은 화면에서 줄바꿈하지 않고 글자 수에 맞춰 글꼴 크기를 줄인다. 레인 중심은 기존 7개 위치를 유지하면서 긴 낱말 상자가 판 가장자리를 넘지 않게 `clamp`한다. 실제 누락 기준은 낱말 상단 y=75%이며 같은 위치에 빨간 충돌선을 표시한다.

이 게임은 고전 DOS 게임 분위기에 대한 비공식 타각판 재구성이다. 효과 이름과 세부 규칙은 타각이 정의하며 역사적 정확성을 주장하지 않는다. 원작 실행 파일, 이미지, 폰트, 사운드, 단어 데이터베이스를 배포물에 포함하지 않는다.

맞는 단어 선택, 두벌식 타수 기반 점수, 감염, 지뢰와 9개 특수 효과는 순수 전이 안에 있다. 직접 맞힌 단어만 점수를 받고, 싹쓸이·지뢰의 연쇄 제거는 점수를 만들지 않는다. 시작 레벨 추천은 최근 최대 5회의 레벨별 실적 중앙값을 사용하고 언제든 사용자가 바꿀 수 있다. `content/assets/venice-words.ko.json`은 기존 30초 낱말 풀과 분리해 한글·길이·중복·선택적 최소 출현 레벨을 검증한다.

`storage/veniceStorage.ts`는 `tagak:venice:records`에 버전 1의 최근 30회와 Top 10을 일반 연습 기록과 분리해 저장한다. 날짜·레벨 통계·규칙 버전·목록 길이를 경계에서 검증한다. Web Locks가 있는 브라우저에서는 ID 기반 중복 방지와 병합 저장을 직렬화하며, 손상된 값은 덮어쓰지 않는다. 저장 실패는 결과를 감추지 않고 메모리 기록과 안내를 유지한다.

`VeniceView`는 IME 입력과 게임 제출을 분리하며 조합 중 Enter/Space/Escape를 제출·종료로 재사용하지 않는다. 붙여넣기와 드롭은 막는다. 게임 효과음은 기존 완료 효과음 설정을 따르므로 기본 무음이다. 브라우저 오디오 API가 실패해도 게임은 계속된다.

## IME 입력 경계 (`ui/TypingInput.tsx`)

이 파일이 이 앱에서 가장 까다로운 부분입니다. 브라우저·OS마다 `compositionstart`/`compositionend`/`beforeinput`/`input`/`keydown` 순서가 다르기 때문입니다.

지켜야 할 동작:

1. 조합 중인 텍스트는 편집기에 남기고, 확정된 값만 `onInput`으로 한 번 반영합니다(`confirmed` ref로 중복 차단).
2. 조합을 끝내는 `Enter`/`Space`는 제출로 이어지지 않습니다. 조합에 쓰인 물리 키는 **키를 뗄 때까지** `imeShortcuts`에 등록해 전달된 중복 이벤트를 막습니다.
3. 조합을 `Space`로 끝냈을 때: 남은 제시문이 있으면 공백 하나를 삽입하고, 입력이 끝났으면 `onSpaceSubmit`으로 제출합니다. `pendingCompositionSpace`가 조합 종료 직후 도착하는 중복 `input`을 되돌립니다.
4. macOS는 조합 확정 `Space`를 `compositionend` 이전에 텍스트로 넣기도 합니다. `spaceAlreadyInserted` 판정으로 이 경우를 처리합니다.
5. 붙여넣기·끌어놓기는 막고 `onBlockedEdit`으로 안내합니다.

여기 동작을 바꾸면 `e2e/practice.spec.ts`의 IME 시나리오와 실제 OS 입력기 수동 확인이 함께 필요합니다. [docs/PLATFORM-VERIFICATION.md](docs/PLATFORM-VERIFICATION.md)에 환경별 확인 범위를 기록합니다.

## 상태 흐름 (`app/usePractice.ts`)

`usePracticeState`는 `useReducer` 하나로 화면을 전환합니다.

- 화면 상태: `menu` · `library` · `history` · `challenge` · `venice` · `free-practice` · `practice` · `positions` · `passage` · `result` (+ `settings`는 `returnState`를 감싼 래퍼)
- 이벤트: `start`, `input-changed`, `submit`, `position-key`, `retry`, `back`, 설정 열기/닫기 등
- 부수 효과는 reducer 밖에서 처리합니다. `reduceSessions`가 완료 기록을 큐(`pending`)에 넣고, `useHistory`가 저장한 뒤 `acknowledge`로 큐에서 빼냅니다. 저장에 실패하면 세션 메모리에 남겨 현재 탭에서 결과를 계속 볼 수 있게 합니다.

`reduceTextPractice`는 낱말이면 결과 화면으로 넘기되 진행 위치(`wordProgress`)를 함께 남겨, 결과의 `continue`가 다음 낱말로 이어가고 `retry`는 방금 끝낸 낱말을 반복합니다. 한 줄이면 결과 없이 다음 문장으로 넘어갑니다. `reducePassagePractice`는 `submitPassageLine`의 결과(`waiting` / `next-line` / `completed`)를 화면 상태로 옮기기만 합니다.

## 저장 계층

현재 데이터 키는 `tagak:` 접두사와 스키마 `version`을 가집니다. `legacyStorage.ts`는 이전 저장 키와 현재 키의 연결, 검증된 이전, 완료 표식을 한곳에서 관리합니다. 동기 읽기는 현재 키를 우선하고, 현재 값이 없으면 마이그레이션 전까지 이전 값을 읽기 전용으로 사용합니다. 비동기 이전과 저장·초기화는 현재 키 잠금 다음 이전 키 잠금을 고정 순서로 획득해 구버전 탭의 쓰기와도 직렬화합니다.

이전은 원본을 검증한 뒤 새 키에 복사하고 다시 읽어 확인합니다. 새 값이 유효하고 완료 표식이 저장된 경우에만 이전 키를 지웁니다. 한쪽이라도 이미 데이터가 있으면 현재 키가 우선하고 이전 값은 보존합니다. 깨진 값이나 쓰기 실패는 원본을 덮어쓰지 않으며, 초기화는 표식을 먼저 저장해 이전 버전의 열린 탭이 다시 쓴 값이 되살아나지 않도록 합니다. 표식을 저장할 수 없으면 초기화를 실패 처리해 데이터를 지키고, 이전 호스트의 `localStorage`는 새 origin으로 자동 이동하지 않습니다.

| 키 | 내용 | 버전 / 마이그레이션 |
| --- | --- | --- |
| `tagak:preferences` | 인터페이스·연습 언어, 완료 효과음, 언어별 속도 단위 | v2, v1은 속도 단위 기본값을 채워 읽음 |
| `tagak:display` | 글자 크기 | v1 |
| `tagak:color-theme` | 색상 테마 | v1 |
| `tagak:practice-font` | 한국어/영어별 글꼴 | v2, v1(공통 글꼴)을 두 언어에 복사 |
| `tagak:history` | 최근 기록(최대 100) | v3, v1·v2 읽기 지원, `sentence`→`line`, `article`→`long` 변환 |
| `tagak:venice:records` | 베네치아 최근 플레이(최대 30), 하이스코어 Top 10 | 별도 규칙 버전 1; 손상·호환 불가 데이터는 보존 |

각 항목의 `tagak:migration:*` 표식은 이미 처리했거나 초기화한 이전 키를 다시 가져오지 않게 합니다. 표식은 연습 데이터와 분리되어 있으며 사용자 기록으로 노출되지 않습니다.

설정과 일반 연습 기록 쓰기는 `navigator.locks.request`로 직렬화합니다. 여러 탭이 동시에 완료해도 기록이 유실되지 않습니다. 잠금을 쓸 수 없으면 저장 실패로 처리하고 연습은 계속됩니다. 탭 간 동기화는 `storage` 이벤트로 읽기 상태만 갱신합니다. 베네치아 저장소의 잠금 및 실패 규칙은 위 A30 절을 따릅니다.

A16 이전 한국어 기록은 두벌식 타수를 복원할 수 없으므로 정확도·시간은 남기고 CPM만 `null`로 감춥니다(`decodeRecord`).

## 표시 설정과 테마

글자 크기·테마·글꼴은 문서 루트의 `data-*` 속성으로 내려가고, `styles.css`의 CSS 사용자 정의 속성이 실제 색과 글꼴을 결정합니다.

```
html[data-color-theme="paper"] { --page: …; --ink: …; }
html[data-practice-font="serif"] { --practice-font: …; }
html[data-practice-language="en"][data-practice-font="serif"] { … }
```

- 초기값은 `main.tsx`가 첫 렌더 전에 설정해 깜빡임을 막습니다.
- `--practice-font`는 제시문·입력창·글 문맥·연습장·도전 낱말에만 적용하고, 메뉴·자판 도식·점수는 기본 글꼴을 유지합니다.
- 외부 글꼴·CDN을 쓰지 않습니다(오프라인 유지).

## 초점 관리 (`ui/useScreenFocus.ts`, `ui/useFocus.ts`)

키보드만으로 전체 흐름을 쓸 수 있어야 하므로 초점은 명시적으로 관리합니다. 탭 복귀와 환경설정 왕복에 관련된 상태·리스너는 `useScreenFocus`가 맡고, `App`은 화면 조립과 효과음 트리거에 집중합니다.

- 화면 전환 시 `restoreContentFocus`가 화면별 대상(입력창, 첫 메뉴 항목, 결과 제목 등)을 찾아 초점을 둡니다. `contentState`는 환경설정 래퍼에서 실제 화면을 꺼내는 단일 규칙입니다.
- 환경설정은 열기 직전 요소를 기억했다가 닫을 때 복원합니다.
- `visibilitychange`/`blur`/`focus`/`pageshow`로 탭 복귀 시 마지막 유효 컨트롤에 초점을 되돌립니다(없으면 화면 기본 대상).
- 설정 메뉴는 roving tabindex로 탭 정지점을 하나만 둡니다.

## 화면 저장과 효과음

- **PNG 저장**: `ui/screenCapture.ts`가 `html-to-image`로 앱 루트를 2배 해상도 PNG로 만듭니다. `data-capture-ignore="true"` 노드(저장 버튼)는 이미지에서 제외합니다. `useScreenCapture`는 `Ctrl+S`를 앱 화면 안에서만 처리하고 IME 조합 중에는 가로채지 않습니다.
- **완료 효과음**: `completionSound.ts`가 Web Audio로 짧은 톤을 1회 재생합니다. 트리거는 `App.tsx`에서 `submissionEndsBundle`(글)과 `hasReachedEnd`(낱말·한 줄·자리)로 판단하며, 오디오 실패는 연습을 막지 않습니다.

## 콘텐츠 애셋

연습 자료는 코드가 아니라 JSON에 있습니다. 경계에서 검증하고, 잘못된 항목은 조용히 버립니다.

- `one-line.{ko,en}.json`, `words.{ko,en}.json`, `challenge-words.json` — `lessons.ts`, `library.ts`가 읽습니다. 빈 문자열과 줄바꿈 포함 항목은 제외합니다.
- `passages.{ko,en}.json` — `passages.ts`가 읽습니다. `license`가 `original`이 아니면 `credit`(저자·출처·HTTPS URL)이 반드시 있어야 하고, 없으면 그 글을 싣지 않습니다. 이는 CC BY-SA·공공누리 출처 표기 의무를 지키기 위한 코드 수준의 가드입니다.
- 줄바꿈은 언어별 고정 폭(한국어 24자, 영어 44자)으로 미리 계산해 5줄 묶음 경계가 새로고침·화면 너비에 흔들리지 않게 합니다(`textLayout.ts`).
- `TEXT-LICENSES.md`는 `textLicenseInventory.ts`가 `activities`·`challengeWords`·`passageActivities`에서 생성합니다. 앱이 실제로 읽는 자료와 출처 표기가 같으므로, 새 자료를 추가하면 `npm run text-licenses:update`로 문서를 갱신합니다. `textLicenseInventory.test.ts`가 문서와 애셋 메타데이터의 일치를 검사합니다.

새 연습 자료를 추가할 때는 애셋만 늘리면 메뉴·기록·글자 수 표시가 따라옵니다. 테스트(`lessons.test.ts` 등)가 길이 기준과 출처 규칙을 검사하고, 라이선스 문서 테스트가 출처 표기 누락과 문서 지연을 막습니다.

## 테스트 전략

| 계층 | 도구 | 확인 내용 |
| --- | --- | --- |
| `domain/`, `content/`, `storage/` | Vitest (`src/**/*.test.ts`) | 채점·타수·묶음 경계·문자소·줄바꿈·마이그레이션·손상 데이터 |
| 브라우저 흐름 | Playwright (`e2e/*.spec.ts`) | 메뉴/설정 키보드 조작, 제출, IME 합성 이벤트, 초점 복귀, PNG, 기록, 효과음 재생 횟수 |
| 실제 입력기 | 수동 확인 | OS 한국어 IME 조합, Alt+Tab 복귀, 확대 |

Playwright의 `CompositionEvent`는 앱의 이벤트 순서 처리를 검증할 뿐, 실제 OS 입력기를 대신하지 않습니다. 이 구분을 [docs/PLATFORM-VERIFICATION.md](docs/PLATFORM-VERIFICATION.md)에 유지합니다.

여러 E2E 파일이 같은 준비 코드를 쓰면 `e2e/helpers/`에 둡니다. 현재 `audio.ts`의 `stubCompletionTone`(Web Audio 스텁과 재생 횟수 조회)과 `preferences.ts`의 `seedPreferences`(스키마 버전별 설정 주입)가 있으며, 효과음 재생 횟수와 설정 이전을 한 방식으로만 관찰합니다. 시간에 의존하는 E2E는 실제 대기 대신 `page.clock` 가상 시계를 씁니다.

`npm run verify`가 `test → build → test:e2e`를 순서대로 실행합니다. 코드나 런타임 동작이 바뀌지 않는 문서 변경에는 테스트·CI를 돌리지 않습니다.

## 빌드와 실행

- `npm run build` = `tsc -b`(프로젝트 참조 타입 검사) + `vite build`
- `serve.mjs`는 `127.0.0.1:41793`에만 바인딩하고 `dist/` 안의 파일만 제공합니다. `Host` 헤더 검사, 경로 탈출 방지(`realpath` 기준), 허용 MIME 목록, `X-Content-Type-Options: nosniff`를 적용합니다. 포트가 사용 중이면 원인을 안내하고 종료합니다.
- 포트를 Vite 개발·미리보기 기본 포트와 분리해 다른 앱의 Service Worker나 저장소가 겹치지 않게 합니다.
- `serve.mjs`는 npm 패키지에 의존하지 않습니다. Node.js 내장 모듈만 씁니다.

## 확장할 때 체크리스트

1. 새 연습 모드: `domain/`에 순수 상태 기계 → `app/usePractice.ts`의 화면 상태·이벤트 → `ui/` 화면 → `interfaceText.ts` 문구(ko/en) → `history.ts` 모드 레이블 → 단위 테스트와 E2E.
2. 새 설정: `storage/`에 버전형 키와 읽기/쓰기 → `app/use*.ts` 훅 → `DisplaySettings.tsx` 행 → `interfaceText.ts`.
3. 저장 스키마 변경: 기존 버전을 **읽기**로 남기고 새 버전을 추가합니다. 손상 값은 덮어쓰지 않습니다.
4. IME 관련 변경: `TypingInput.tsx`의 5가지 규칙을 유지하고, 합성 이벤트 E2E와 수동 확인 계획을 PR에 함께 적습니다.
