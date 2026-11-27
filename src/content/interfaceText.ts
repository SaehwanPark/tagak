import type { Language } from "./lessons";
import type { TypingSpeedUnit } from "../domain/typingSpeed";
import { colorThemes } from "../storage/settingsStorage";
import type { ColorTheme } from "../storage/settingsStorage";

export type InterfaceText = Readonly<{
  brand: string;
  typingPractice: string;
  games: string;
  menu: string;
  back: string;
  settings: string;
  backToMenu: string;
  backToSettings: string;
  start: string;
  quitApp: string;
  navigationHint: string;
  helpEntry: string;
  helpTitle: string;
  closeHelp: string;
  helpIntro: string;
  helpNavigationLabel: string;
  helpNavigation: string;
  helpTypingLabel: string;
  helpTyping: string;
  helpBackLabel: string;
  helpBack: string;
  helpShortcutsLabel: string;
  helpShortcuts: string;
  helpScreenCaptureLabel: string;
  helpScreenCapture: string;
  helpBeginnerLabel: string;
  helpBeginner: string;
  practiceExitTitle: string;
  practiceExitMessage: string;
  continuePractice: string;
  endPractice: string;
  screenCapture: string;
  saving: string;
  captureDisclosure: string;
  interfaceLanguage: string;
  practiceLanguage: string;
  practiceLanguageAfterMenu: string;
  linePracticeSessionLength: string;
  linePracticeSessionLengthHelp: string;
  linePracticeSessionLengthOption: (count: number) => string;
  koreanSpeedUnit: string;
  englishSpeedUnit: string;
  speedUnitCpm: (language: Language) => string;
  speedUnitWpm: string;
  speedUnitHelp: string;
  speedLabel: (unit: TypingSpeedUnit, language: Language) => string;
  speedValue: (value: number, unit: TypingSpeedUnit, language: Language) => string;
  korean: string;
  english: string;
  practiceSize: string;
  resetSize: string;
  standardSize: string;
  largeSize: string;
  largestSize: string;
  colorTheme: string;
  resetTheme: string;
  colorThemeName: (theme: ColorTheme) => string;
  chooseColorTheme: string;
  colorThemePosition: (current: number, total: number) => string;
  themePickerHelp: string;
  practiceFont: string;
  resetFont: string;
  gothicFont: string;
  serifFont: string;
  completionSound: string;
  completionSoundHelp: string;
  soundOn: string;
  soundOff: string;
  resetSettings: string;
  settingsHelp: string;
  saveFailed: string;
  invalidSettings: string;
  chooseShortPassage: string;
  chooseLongPassage: string;
  randomPassage: string;
  randomPassageDetail: string;
  recentPassage: string;
  recentPassageDetail: (passage: string) => string;
  shortPassage: string;
  longPassage: string;
  select: string;
  firstLast: string;
  currentPrompt: string;
  sourceLabel: string;
  openSource: (source: string) => string;
  originalLineSource: string;
  followAlong: string;
  submit: string;
  spaceSubmitHint: string;
  finishPractice: string;
  currentScore: string;
  previousSentence: string;
  previousScore: string;
  accuracy: string;
  elapsedTime: string;
  result: string;
  practiceComplete: string;
  thisResult: string;
  sameModePrevious: string;
  previousResult: string;
  practiceAgain: string;
  lineSessionProgress: (current: number, total: number) => string;
  lineSessionCompleted: (count: number) => string;
  lineSessionResult: string;
  lineSessionStatistics: string;
  lineSessionSampleCount: (included: number, total: number) => string;
  mean: string;
  standardDeviation: string;
  median: string;
  interquartileRange: string;
  highScoreFirstRecord: (median: string, speedUnit: string) => string;
  highScoreUpdated: (current: string, previous: string, speedUnit: string, changePercent: string) => string;
  highScoreKept: (current: string, previous: string, speedUnit: string, changePercent: string) => string;
  highScoreBelowThreshold: (changePercent: string, minimumChange: string) => string;
  highScoreNotSignificant: (improvementPercent: string) => string;
  highScoreBothFailed: (changePercent: string) => string;
  highScoreAccuracyReason: (accuracy: string | null, minimumAccuracy: number) => string;
  highScoreSamplesReason: (count: number, minimum: number) => string;
  highScoreIncompleteReason: string;
  highScoreInvalidRateReason: string;
  highScoreExplanationTitle: string;
  highScoreRulesExplanation: (minimumAccuracy: number, minimumSamples: number, minimumChange: string, significanceLevel: string) => string;
  highScoreComparisonDetails: (changePercent: string, pValue: string, minimumChange: string, significanceLevel: string) => string;
  returnTo: (destination: string) => string;
  openPractice: string;
  blockedPracticeInput: string;
  remainingCharacters: (count: number) => string;
  noRecords: string;
  practiceKind: string;
  all: string;
  clearHistory: string;
  confirmClearHistory: string;
  clearAllHistory: string;
  cancel: string;
  historySaveFailed: string;
  historyClearFailed: string;
  historyCleared: string;
  historyReadFailed: string;
  sessionSaveFailed: string;
  highScoreDecisionFailed: string;
  highScoresCleared: string;
  sessionHistoryTitle: string;
  trendTitle: string;
  trendScopeNote: string;
  trendRecentAverage: (speed: string, sessions: number) => string;
  trendChartLabel: (scope: string) => string;
  trendPointLabel: (date: string, speed: string) => string;
  trendRange: (earliest: string, latest: string) => string;
  trendInsufficientSessions: (count: number, minimum: number) => string;
  highScoresTitle: string;
  clearHighScores: string;
  confirmClearHighScores: string;
  clearHighScoresAction: string;
  sessionCompleted: string;
  sessionEndedEarly: string;
  sessionSamples: (count: number) => string;
  highScoreScope: (mode: string, language: string, lineSessionLength: number | null) => string;
  accuracyValue: (value: number) => string;
  challengeTitle: string;
  challengeInstruction: string;
  challengePauseNotice: string;
  challengePaused: string;
  challengeStart: string;
  challengeResult: string;
  timeEnded: string;
  challengeStopped: string;
  solvedWords: string;
  solvedWordCount: (count: number) => string;
  elapsedTimeValue: (seconds: string) => string;
  retryChallenge: string;
  remainingTime: (seconds: number) => string;
  enterWord: string;
  stopChallenge: string;
  blockedWordInput: string;
  veniceTitle: string;
  veniceInstruction: string;
  veniceCollisionLine: string;
  veniceLevel: string;
  veniceRecommended: (level: number) => string;
  veniceStart: string;
  veniceReadyHint: string;
  veniceTargetCpm: string;
  veniceScore: string;
  veniceTower: string;
  veniceStageProgress: (spawned: number, total: number) => string;
  veniceEndlessProgress: (spawned: number) => string;
  veniceInputLabel: string;
  veniceSubmit: string;
  veniceFinish: string;
  venicePaused: string;
  venicePause: string;
  veniceResume: string;
  veniceMismatch: string;
  veniceEffectLabel: (effect: string) => string;
  veniceInfectionActive: string;
  veniceResult: string;
  venicePlayAgain: string;
  veniceChooseLevel: string;
  veniceStartLevel: string;
  veniceHighestLevel: string;
  veniceTypedWords: string;
  veniceMissedWords: string;
  veniceTopScores: string;
  veniceRank: string;
  veniceDate: string;
  veniceNoScores: string;
  veniceSaveFailed: string;
  veniceReadFailed: string;
  passagePage: (page: number, total: number) => string;
  charactersSuffix: string;
  passageCurrentLine: string;
  passageCompletedLine: string;
  passageNextLine: string;
  passageBundleScore: string;
  genreLabel: (genre: string) => string;
  licenseLabel: (license: string) => string;
  screenCaptureError: string;
  screenCaptureSuccess: string;
  screenCaptureUnsupported: string;
  dataTransferTitle: string;
  dataTransferDescription: string;
  thirdPartyNotices: string;
  backupExport: string;
  backupImport: string;
  backupContents: string;
  backupChooseFile: string;
  backupFormatError: string;
  backupReadError: string;
  backupExportSuccess: string;
  backupExportError: string;
  backupConflict: string;
  backupMerge: string;
  backupReplace: string;
  backupImportSuccess: string;
  backupReplaceSuccess: string;
  backupRestoreError: string;
  backupCurrentDataError: string;
  activityLabel: (id: string, fallback: string) => string;
  modeLabel: (mode: string) => string;
}>;

const ko: InterfaceText = {
  brand: "타각",
  typingPractice: "타자 연습",
  games: "게임",
  menu: "메뉴",
  back: "← 뒤로",
  settings: "환경설정",
  backToMenu: "← 메뉴",
  backToSettings: "← 환경설정",
  start: "시작",
  quitApp: "앱 종료",
  navigationHint: "선택 · 시작",
  helpEntry: "사용 안내 (?)",
  helpTitle: "키보드 사용 안내",
  closeHelp: "닫기",
  helpIntro: "필요할 때 확인하고 바로 연습으로 돌아오세요. Tab과 Shift+Tab은 버튼·입력창·읽기 스크롤 영역 사이를 이동합니다.",
  helpNavigationLabel: "메뉴와 목록",
  helpNavigation: "↑/↓로 이동하고 Enter로 선택합니다. Home/End는 목록의 처음과 끝으로 이동합니다. 읽기 영역에 초점을 두고 ↑/↓ 또는 PageUp/PageDown으로 스크롤할 수 있습니다.",
  helpTypingLabel: "입력과 제출",
  helpTyping: "한 줄·글은 제시문을 입력한 뒤 Enter 또는 Space로 제출합니다. 한글 IME 조합 중 Enter/Space는 글자를 먼저 확정합니다. 조합 확정에 쓴 키를 놓았다가 다시 눌러 제출하세요. Space는 제시문을 다 입력하기 전까지 공백으로 들어갑니다.",
  helpBackLabel: "뒤로 가기",
  helpBack: "Esc는 이전 화면으로 돌아갑니다. 진행이 있는 연습을 끝내려면 확인이 필요하며, 취소하면 입력을 이어갈 수 있습니다. 데스크톱 앱은 홈에서 Esc로 종료하며 브라우저에서는 종료하지 않습니다.",
  helpShortcutsLabel: "바로 가기",
  helpShortcuts: "홈의 ?는 이 안내를 엽니다. 입력란 밖에서 s는 환경설정, r은 최근 연습 기록을 엽니다. IME 조합 중, 편집 가능한 요소에 초점이 있을 때, 키 반복 입력에서는 동작하지 않습니다.",
  helpScreenCaptureLabel: "화면 저장",
  helpScreenCapture: "macOS에서는 ⌘S, Windows와 브라우저에서는 Ctrl+S를 누르거나 머리글의 화면 저장을 선택합니다. 저장되는 PNG에는 화면에 보이는 연습 내용도 포함됩니다.",
  helpBeginnerLabel: "처음 시작한다면",
  helpBeginner: "환경설정의 한 줄 문장 수에서 5문장을 고를 수 있습니다. 베네치아를 시작할 때는 레벨 1부터 선택할 수 있습니다.",
  practiceExitTitle: "연습을 끝낼까요?",
  practiceExitMessage: "연습을 끝내면 현재 줄의 미제출 입력은 저장되지 않고, 이미 제출한 줄만 기록에 남습니다.",
  continuePractice: "계속 연습",
  endPractice: "연습 종료",
  screenCapture: "화면 저장",
  saving: "저장 중…",
  captureDisclosure: "화면 저장을 선택하면 입력 내용도 PNG에 포함됩니다.",
  interfaceLanguage: "인터페이스 언어",
  practiceLanguage: "연습 언어",
  practiceLanguageAfterMenu: "연습 중에는 현재 내용을 유지합니다. 언어 변경은 메뉴로 돌아간 뒤 적용하세요.",
  linePracticeSessionLength: "한 줄 문장 수",
  linePracticeSessionLengthHelp: "연습할 문장 수입니다. 변경 사항은 다음 세션부터 적용됩니다.",
  linePracticeSessionLengthOption: (count) => `${count}문장`,
  koreanSpeedUnit: "한국어 속도 단위",
  englishSpeedUnit: "영어 속도 단위",
  speedUnitCpm: (language) => language === "ko" ? "분당 타수 (CPM)" : "분당 글자 수 (CPM)",
  speedUnitWpm: "분당 단어 수 (WPM)",
  speedUnitHelp: "WPM은 분당 타수를 5로 나눈 값입니다.",
  speedLabel: (unit, language) => unit === "wpm" ? "단어/분" : language === "ko" ? "타수/분" : "글자/분",
  speedValue: (value, unit, language) => String(value) + " " + (unit === "wpm" ? "단어/분" : language === "ko" ? "타수/분" : "글자/분"),
  korean: "한국어",
  english: "영어",
  practiceSize: "연습 글자 크기",
  resetSize: "기본 크기로 되돌리기",
  standardSize: "기본",
  largeSize: "크게",
  largestSize: "아주 크게",
  colorTheme: "색상 테마",
  resetTheme: "기본 색상으로 되돌리기",
  colorThemeName: (theme) => colorThemes[theme].ko,
  chooseColorTheme: "테마 바로 선택",
  colorThemePosition: (current, total) => `${current}/${total}`,
  themePickerHelp: "←/→로 테마를 바꾸거나 목록에서 바로 고르세요. 목록에서는 방향키로 선택하고 Esc로 닫습니다.",
  practiceFont: "연습 글꼴",
  resetFont: "기본 글꼴로 되돌리기",
  gothicFont: "고딕",
  serifFont: "명조",
  completionSound: "효과음",
  completionSoundHelp: "연습 완료·최고 기록 갱신과 베네치아의 입력·정답·피격·종료 때 재생합니다. 기본은 끔입니다.",
  soundOn: "켬",
  soundOff: "끔",
  resetSettings: "환경설정을 기본값으로 되돌리기",
  settingsHelp: "↑/↓로 항목을 이동하고 ←/→ 또는 Enter/Space로 값을 바꾸세요. 색상 테마는 목록에서 바로 고를 수도 있습니다. 초기화 항목은 Enter/Space로 실행합니다. Esc로 이전 화면으로 돌아가며 변경 사항은 이 브라우저에 저장됩니다.",
  saveFailed: "설정을 저장하지 못했습니다. 현재 탭에서만 적용됩니다.",
  invalidSettings: "저장된 환경설정을 읽지 못했습니다. 기본값을 사용하며 기존 값은 보존했습니다.",
  chooseShortPassage: "짧은 글 고르기",
  chooseLongPassage: "긴 글 고르기",
  randomPassage: "무작위 글",
  randomPassageDetail: "목록에서 무작위로 골라 바로 시작",
  recentPassage: "최근 연습한 글",
  recentPassageDetail: (passage) => `최근 연습: ${passage}`,
  shortPassage: "짧은 글",
  longPassage: "긴 글",
  select: "선택",
  firstLast: "처음/끝",
  currentPrompt: "제시문",
  sourceLabel: "출처",
  openSource: (source) => `출처 확인: ${source} (새 탭에서 열림)`,
  originalLineSource: "타각 직접 작성",
  followAlong: "따라 입력하기",
  submit: "제출",
  spaceSubmitHint: "제시문을 모두 입력한 뒤 제출",
  finishPractice: "연습 마치기",
  currentScore: "현재 점수",
  previousSentence: "직전 한 줄",
  previousScore: "직전 점수",
  accuracy: "정확도",
  elapsedTime: "경과 시간",
  result: "결과",
  practiceComplete: "연습 완료",
  thisResult: "이번 결과",
  sameModePrevious: "같은 모드의 이전 기록",
  previousResult: "이전 결과",
  practiceAgain: "다시 연습",
  lineSessionProgress: (current, total) => `문장 ${current} / ${total}`,
  lineSessionCompleted: (count) => `${count}문장 완료`,
  lineSessionResult: "한 줄 연습 세션",
  lineSessionStatistics: "세션 속도 통계",
  lineSessionSampleCount: (included, total) => `유효한 속도 ${total}개 중 ${included}개로 통계 계산`,
  mean: "평균",
  standardDeviation: "표준편차",
  median: "중간값",
  interquartileRange: "IQR (P25–P75)",
  highScoreFirstRecord: (median, speedUnit) => `첫 최고 기록! 중간값: ${median} ${speedUnit}.`,
  highScoreUpdated: (current, previous, speedUnit, changePercent) => `🏆 새 최고 기록! 이번 ${current} ${speedUnit} · 기존 ${previous} ${speedUnit} · 변화 ${changePercent}%`,
  highScoreKept: (current, previous, speedUnit, changePercent) => `이번 ${current} ${speedUnit} · 최고 기록 ${previous} ${speedUnit} · 변화 ${changePercent}%`,
  highScoreBelowThreshold: (changePercent, minimumChange) => `중간값 변화 ${changePercent}%가 갱신 기준 +${minimumChange}%에 미달해 최고 기록을 유지했습니다.`,
  highScoreNotSignificant: (changePercent) => `중간값은 ${changePercent}% 높지만, 이번 표본 비교 기준을 충족하지 못해 최고 기록을 유지했습니다.`,
  highScoreBothFailed: (changePercent) => `중간값 변화 ${changePercent}%와 표본 비교가 갱신 기준에 미달해 최고 기록을 유지했습니다.`,
  highScoreAccuracyReason: (accuracy, minimumAccuracy) => accuracy === null
    ? `입력된 글자가 없어 세션 정확도를 계산할 수 없습니다. 최고 기록 기준은 정확도 ${minimumAccuracy}% 이상입니다.`
    : `세션 정확도 ${accuracy}%가 최고 기록 기준 ${minimumAccuracy}%에 미달합니다.`,
  highScoreSamplesReason: (count, minimum) => `유효한 속도 표본 ${count}개로, 최고 기록에 필요한 ${minimum}개에 미달합니다.`,
  highScoreIncompleteReason: "세션을 끝까지 완료하지 않아 최고 기록을 갱신하지 않았습니다.",
  highScoreInvalidRateReason: "유효한 속도 값이 없어 최고 기록을 갱신하지 않았습니다.",
  highScoreExplanationTitle: "하이스코어 판정 기준",
  highScoreRulesExplanation: (minimumAccuracy, minimumSamples, minimumChange, significanceLevel) => `첫 자격 세션은 바로 기록합니다. 이후에는 정확도 ${minimumAccuracy}%·유효 표본 ${minimumSamples}개를 충족하고, 원시 중간값이 ${minimumChange}% 이상 높으며 단측 Mann–Whitney 검정 p<${significanceLevel}일 때 갱신합니다. 이 검정은 두 세션의 속도 표본 순위를 비교하는 타각의 규칙이며, 실력 향상의 과학적 증명이 아닙니다. 표본 수·문장 난이도·줄 간 상관·반복 비교의 영향을 받을 수 있습니다. 속도 표시는 소수 첫째 자리까지 반올림하고 판정은 원시 값으로 합니다.`,
  highScoreComparisonDetails: (changePercent, pValue, minimumChange, significanceLevel) => `이번 비교: 중간값 변화 ${changePercent}%, ${pValue.startsWith("<") ? `p${pValue}` : `p=${pValue}`}. 갱신 기준은 변화 +${minimumChange}% 이상 및 p<${significanceLevel}입니다.`,
  returnTo: (destination) => destination === "메뉴" ? "메뉴로 돌아가기" : `${destination}으로 돌아가기`,
  openPractice: "연습으로 돌아가기",
  blockedPracticeInput: "연습 문장은 키보드로 직접 입력하세요.",
  remainingCharacters: (count) => `제시문이 ${count}자 남았습니다.`,
  noRecords: "표시할 연습 기록이 없습니다.",
  practiceKind: "연습 종류",
  all: "전체",
  clearHistory: "기록 지우기",
  confirmClearHistory: "이 브라우저에 저장한 연습 기록, 세션 이력과 최고 기록을 모두 지울까요?",
  clearAllHistory: "전체 기록 지우기",
  cancel: "취소",
  historySaveFailed: "이번 기록은 저장하지 못했습니다. 앱을 닫기 전까지 볼 수 있습니다.",
  historyClearFailed: "기록을 지우지 못했습니다. 브라우저의 저장 설정을 확인하세요.",
  historyCleared: "연습 기록, 세션 이력과 최고 기록을 지웠습니다.",
  historyReadFailed: "저장된 기록을 읽을 수 없습니다. 현재 연습은 계속할 수 있습니다.",
  sessionSaveFailed: "세션 기록을 저장하지 못했습니다. 기존 최고 기록은 그대로 유지됩니다.",
  highScoreDecisionFailed: "세션은 저장했지만 최고 기록을 계산하지 못했습니다. 기존 최고 기록은 그대로 유지됩니다.",
  highScoresCleared: "최고 기록을 지웠습니다.",
  sessionHistoryTitle: "연습 세션 기록",
  trendTitle: "속도 추이",
  trendScopeNote: "완료한 세션만 모드·연습 언어·한 줄 문장 수별로 비교합니다. 최근 100개 세션 기록을 사용합니다.",
  trendRecentAverage: (speed, sessions) => `최근 ${sessions}회 평균 ${speed}`,
  trendChartLabel: (scope) => `${scope} 최근 세션 속도 추이`,
  trendPointLabel: (date, speed) => `${date}: ${speed}`,
  trendRange: (earliest, latest) => `${earliest} → ${latest}`,
  trendInsufficientSessions: (count, minimum) => `비교할 완료 세션이 ${minimum}회 이상 필요합니다. 현재 ${count}회입니다.`,
  highScoresTitle: "최고 기록",
  clearHighScores: "최고 기록 지우기",
  confirmClearHighScores: "최고 기록만 지울까요? 연습 기록은 그대로 보존됩니다.",
  clearHighScoresAction: "최고 기록만 지우기",
  sessionCompleted: "완료",
  sessionEndedEarly: "조기 종료",
  sessionSamples: (count) => `속도 표본 ${count}개`,
  highScoreScope: (mode, language, length) => `${mode} · ${language}${length === null ? "" : ` · ${length}문장`}`,
  accuracyValue: (value) => `정확도 ${value}%`,
  challengeTitle: "30초 낱말 도전",
  challengeInstruction: "한글 낱말을 그대로 입력하고 Enter를 누르세요. 30초 동안 맞힌 낱말 수를 셉니다.",
  challengePauseNotice: "환경설정 화면을 열거나 앱 창이 비활성 상태가 되면 제한 시간이 멈춥니다.",
  challengePaused: "도전 시간이 멈췄습니다. 앱으로 돌아오면 이어집니다.",
  challengeStart: "도전 시작",
  challengeResult: "도전 결과",
  timeEnded: "시간이 끝났습니다.",
  challengeStopped: "도전을 중단했습니다.",
  solvedWords: "맞힌 낱말",
  solvedWordCount: (count) => `${count}개`,
  elapsedTimeValue: (seconds) => `${seconds}초`,
  retryChallenge: "다시 도전",
  remainingTime: (seconds) => `남은 시간 ${seconds}초`,
  enterWord: "낱말은 키보드로 직접 입력하세요.",
  stopChallenge: "중단",
  blockedWordInput: "제시된 낱말과 같은지 확인하세요.",
  veniceTitle: "베네치아",
  veniceInstruction: "낱말을 입력해 탑을 지키세요. 일반 낱말 상단이 빨간 충돌선에 닿으면 탑 블록 1개가 손상됩니다. 노란 특수 낱말을 맞히면 효과가 발동하며, 감염된 레벨에서는 놓친 특수 낱말도 탑에 피해를 줍니다.",
  veniceCollisionLine: "충돌선 · 일반 낱말이 닿으면 탑 -1",
  veniceLevel: "레벨",
  veniceRecommended: (level) => `최근 플레이 기준 ${level}레벨 추천`,
  veniceStart: "게임 시작",
  veniceReadyHint: "↑/↓로 시작 레벨 선택 · 1~9 숫자로 바로 선택 · Enter 시작 · Esc 메뉴",
  veniceTargetCpm: "목표 CPM",
  veniceScore: "점수",
  veniceTower: "탑 블록",
  veniceStageProgress: (spawned, total) => `일반 낱말 ${spawned} / ${total}`,
  veniceEndlessProgress: (spawned) => `최종 점수 구간 · 일반 낱말 ${spawned}개`,
  veniceInputLabel: "보이는 낱말을 입력하세요",
  veniceSubmit: "낱말 확정",
  veniceFinish: "게임 마치기",
  venicePaused: "일시 정지",
  venicePause: "게임 일시 정지",
  veniceResume: "게임 계속",
  veniceMismatch: "보이는 낱말과 일치하는 입력이 없습니다. 고쳐서 다시 확정하세요.",
  veniceEffectLabel: (effect) => ({
    clear: "낱말 싹쓸이",
    freeze: "낙하 정지",
    repair: "탑 재건 +4",
    haste: "낙하 가속",
    slow: "낙하 감속",
    hide: "낱말 숨기기",
    swarm: "낱말 무리 출현",
    mine: "지뢰 설치",
    infection: "감염 차단",
  }[effect] ?? "특수 효과"),
  veniceInfectionActive: "감염 중: 이번 레벨에서 놓친 바이러스도 탑에 피해를 줍니다.",
  veniceResult: "베네치아 결과",
  venicePlayAgain: "같은 레벨로 다시 시작",
  veniceChooseLevel: "다른 레벨 선택",
  veniceStartLevel: "시작 레벨",
  veniceHighestLevel: "최고 레벨",
  veniceTypedWords: "완성한 낱말",
  veniceMissedWords: "놓친 낱말",
  veniceTopScores: "로컬 Top 10 하이스코어",
  veniceRank: "순위",
  veniceDate: "플레이 날짜",
  veniceNoScores: "아직 저장된 점수가 없습니다.",
  veniceSaveFailed: "결과를 저장하지 못했습니다. 이번 결과는 화면에서 확인할 수 있습니다.",
  veniceReadFailed: "저장된 베네치아 기록을 읽지 못했습니다. 기존 값은 보존했습니다.",
  passagePage: (page, total) => `${page} / ${total} 묶음`,
  charactersSuffix: "자",
  passageCurrentLine: "현재 줄",
  passageCompletedLine: "완료한 줄",
  passageNextLine: "다음 줄",
  passageBundleScore: "완료한 묶음",
  genreLabel: (genre) => ({
    literature: "문학",
    nonfiction: "비문학",
    technology: "기술",
    life: "생활",
    subculture: "서브컬쳐",
  }[genre] ?? genre),
  licenseLabel: (license) => ({
    "public-domain": "퍼블릭 도메인",
    "cc-by-sa-4.0": "CC BY-SA 4.0",
  }[license] ?? ""),
  screenCaptureError: "화면을 저장하지 못했습니다. 다시 시도하세요.",
  screenCaptureSuccess: "화면을 PNG로 저장했습니다.",
  screenCaptureUnsupported: "이 브라우저에서는 화면 저장을 지원하지 않습니다.",
  dataTransferTitle: "데이터 백업·가져오기",
  dataTransferDescription: "환경설정, 최근 연습 기록, 베네치아 기록을 로컬 JSON 파일로 옮깁니다. 입력 중인 내용은 포함하지 않습니다.",
  thirdPartyNotices: "저작권·제3자 고지",
  backupExport: "백업 내보내기",
  backupImport: "백업 가져오기",
  backupContents: "JSON 백업에는 환경설정과 저장된 기록만 포함됩니다.",
  backupChooseFile: "백업 JSON 파일",
  backupFormatError: "이 백업 파일은 손상되었거나 지원하지 않는 형식입니다. 기존 데이터는 바꾸지 않았습니다.",
  backupReadError: "백업 파일을 읽지 못했습니다. 파일을 확인하고 다시 시도하세요.",
  backupExportSuccess: "백업 파일을 저장했습니다.",
  backupExportError: "백업 파일을 만들거나 저장하지 못했습니다.",
  backupConflict: "저장된 데이터가 있습니다. 가져오는 기록을 병합하거나 전체 데이터를 교체할 수 있습니다.",
  backupMerge: "병합",
  backupReplace: "전체 교체",
  backupImportSuccess: "백업 데이터를 병합했습니다.",
  backupReplaceSuccess: "저장된 데이터를 백업으로 교체했습니다.",
  backupRestoreError: "데이터를 저장하지 못했습니다. 기존 값은 복원했습니다.",
  backupCurrentDataError: "현재 저장 데이터가 손상되어 병합할 수 없습니다. 전체 교체하거나 취소하세요.",
  activityLabel: (id, fallback) => ({
    // The practice language is already chosen, so menu labels omit it.
    "ko-line": "한 줄",
    "en-line": "한 줄",
    "short-library": "짧은 글",
    "long-library": "긴 글",
    games: "게임",
    challenge: "30초 낱말 도전",
    venice: "베네치아",
    history: "최근 연습 기록",
    settings: "환경설정",
    "data-transfer": "데이터 백업·가져오기",
  }[id] ?? fallback),
  modeLabel: (mode) => ({ word: "낱말", line: "한 줄", short: "짧은 글", long: "긴 글", position: "자리" }[mode] ?? mode),
};

const en: InterfaceText = {
  brand: "Tagak",
  typingPractice: "Typing practice",
  games: "Games",
  menu: "Menu",
  back: "← Back",
  settings: "Settings",
  backToMenu: "← Menu",
  backToSettings: "← Settings",
  start: "Start",
  quitApp: "Quit app",
  navigationHint: "Select · Start",
  helpEntry: "How to use (?)",
  helpTitle: "Keyboard help",
  closeHelp: "Close",
  helpIntro: "Check these controls when you need them, then return to practice. Tab and Shift+Tab move through buttons, inputs, and read-only scroll areas.",
  helpNavigationLabel: "Menus and lists",
  helpNavigation: "Use Up/Down and press Enter to select. Home/End move to the beginning or end of a list. Focus a reading area and use Up/Down or PageUp/PageDown to scroll.",
  helpTypingLabel: "Typing and submitting",
  helpTyping: "Type the prompt in one-line or passage practice, then submit with Enter or Space. During Korean IME composition, Enter/Space commits the text first. Release that key and press it again to submit. Space inserts a space until the prompt is complete.",
  helpBackLabel: "Going back",
  helpBack: "Escape returns to the previous screen. If you have made progress in practice, confirm before ending; cancel to keep typing. Escape on the desktop app home quits the app; it does not quit the browser version.",
  helpShortcutsLabel: "Shortcuts",
  helpShortcuts: "Press ? on the home screen for this guide. Press s outside an editable field for Settings, or r for Recent practice. These shortcuts are ignored during IME composition, while an editable field has focus, and on repeated key events.",
  helpScreenCaptureLabel: "Save the screen",
  helpScreenCapture: "Press ⌘S on macOS or Ctrl+S on Windows and in a browser, or choose Save screen in the header. The PNG includes practice text visible on the screen.",
  helpBeginnerLabel: "For a first session",
  helpBeginner: "Choose 5 sentences in Settings. When starting Venice, you can select level 1.",
  practiceExitTitle: "End this practice?",
  practiceExitMessage: "Ending now discards the unfinished line; only submitted lines remain in the session history.",
  continuePractice: "Keep practicing",
  endPractice: "End practice",
  screenCapture: "Save screen",
  saving: "Saving…",
  captureDisclosure: "Saving the screen includes the visible text in the PNG.",
  interfaceLanguage: "Interface language",
  practiceLanguage: "Practice language",
  practiceLanguageAfterMenu: "The current practice stays open. Return to the menu to change the practice language.",
  linePracticeSessionLength: "Sentences per session",
  linePracticeSessionLengthHelp: "Changes apply from the next session.",
  linePracticeSessionLengthOption: (count) => `${count} sentences`,
  koreanSpeedUnit: "Korean speed unit",
  englishSpeedUnit: "English speed unit",
  speedUnitCpm: (language) => language === "ko" ? "Keystrokes/minute (CPM)" : "Characters/minute (CPM)",
  speedUnitWpm: "Words/minute (WPM)",
  speedUnitHelp: "WPM is calculated by dividing CPM by five.",
  speedLabel: (unit, language) => unit === "wpm" ? "Words/min" : language === "ko" ? "Keystrokes/min" : "Characters/min",
  speedValue: (value, unit, language) => String(value) + " " + (unit === "wpm" ? "words/min" : language === "ko" ? "keystrokes/min" : "characters/min"),
  korean: "Korean",
  english: "English",
  practiceSize: "Practice text size",
  resetSize: "Reset text size",
  standardSize: "Standard",
  largeSize: "Large",
  largestSize: "Largest",
  colorTheme: "Color theme",
  resetTheme: "Reset color theme",
  colorThemeName: (theme) => colorThemes[theme].en,
  chooseColorTheme: "Choose a theme directly",
  colorThemePosition: (current, total) => `${current}/${total}`,
  themePickerHelp: "Use Left/Right to cycle themes, or choose one from the list. Arrow keys select in the list; Escape closes it.",
  practiceFont: "Practice font",
  resetFont: "Reset practice font",
  gothicFont: "Sans-serif",
  serifFont: "Serif",
  completionSound: "Sound effects",
  completionSoundHelp: "Plays for practice completion, a new high score, and Venice typing, hits, damage, and game over. Off by default.",
  soundOn: "On",
  soundOff: "Off",
  resetSettings: "Reset settings to defaults",
  settingsHelp: "Use Up/Down to move between settings and Left/Right or Enter/Space to change a value. You can also choose a color theme from its list. Enter/Space runs reset actions. Press Escape to return. Changes are saved in this browser.",
  saveFailed: "Settings could not be saved. Changes apply only in this tab.",
  invalidSettings: "Saved settings could not be read. Defaults are in use; the stored value was preserved.",
  chooseShortPassage: "Choose a short passage",
  chooseLongPassage: "Choose a long passage",
  randomPassage: "Random passage",
  randomPassageDetail: "Pick one from the list and start immediately",
  recentPassage: "Last practiced passage",
  recentPassageDetail: (passage) => `Last practiced: ${passage}`,
  shortPassage: "Short passages",
  longPassage: "Long passages",
  select: "Select",
  firstLast: "First/Last",
  currentPrompt: "Prompt",
  sourceLabel: "Source",
  openSource: (source) => `Open source: ${source} (opens in a new tab)`,
  originalLineSource: "Written for Tagak",
  followAlong: "Type the prompt",
  submit: "Submit",
  spaceSubmitHint: "Submit after completing the prompt",
  finishPractice: "Finish practice",
  currentScore: "Current score",
  previousSentence: "Previous line",
  previousScore: "Previous score",
  accuracy: "Accuracy",
  elapsedTime: "Elapsed time",
  result: "Result",
  practiceComplete: "Practice complete",
  thisResult: "This result",
  sameModePrevious: "Previous result in this mode",
  previousResult: "Previous result",
  practiceAgain: "Practice again",
  lineSessionProgress: (current, total) => `Sentence ${current} of ${total}`,
  lineSessionCompleted: (count) => `${count} sentences completed`,
  lineSessionResult: "One-line practice session",
  lineSessionStatistics: "Session speed statistics",
  lineSessionSampleCount: (included, total) => `Statistics use ${included} of ${total} valid speed samples`,
  mean: "Mean",
  standardDeviation: "Standard deviation",
  median: "Median",
  interquartileRange: "IQR (P25–P75)",
  highScoreFirstRecord: (median, speedUnit) => `First high score! Median: ${median} ${speedUnit}.`,
  highScoreUpdated: (current, previous, speedUnit, changePercent) => `🏆 New high score! This session ${current} ${speedUnit} · previous ${previous} ${speedUnit} · change ${changePercent}%`,
  highScoreKept: (current, previous, speedUnit, changePercent) => `This session ${current} ${speedUnit} · high score ${previous} ${speedUnit} · change ${changePercent}%`,
  highScoreBelowThreshold: (changePercent, minimumChange) => `The median changed by ${changePercent}%, below the +${minimumChange}% update threshold, so the high score stays.`,
  highScoreNotSignificant: (changePercent) => `The median is ${changePercent}% higher, but the sample comparison did not meet its update criterion, so the high score stays.`,
  highScoreBothFailed: (changePercent) => `The median change of ${changePercent}% and sample comparison did not meet the update criteria, so the high score stays.`,
  highScoreAccuracyReason: (accuracy, minimumAccuracy) => accuracy === null
    ? `No characters were entered, so session accuracy could not be calculated. High scores require at least ${minimumAccuracy}% accuracy.`
    : `Session accuracy ${accuracy}% is below the ${minimumAccuracy}% high-score requirement.`,
  highScoreSamplesReason: (count, minimum) => `${count} valid speed samples were available; high scores require at least ${minimum}.`,
  highScoreIncompleteReason: "The session was not completed, so the high score was not updated.",
  highScoreInvalidRateReason: "No valid speed value was available for a high score update.",
  highScoreExplanationTitle: "High-score rules",
  highScoreRulesExplanation: (minimumAccuracy, minimumSamples, minimumChange, significanceLevel) => `The first eligible session becomes the record. Later updates need ${minimumAccuracy}% accuracy, ${minimumSamples} valid samples, a raw median at least ${minimumChange}% higher, and a one-sided Mann–Whitney p<${significanceLevel}. It compares speed-sample ranks between sessions; this is Tagak’s record rule, not scientific proof of a skill increase. Sample size, passage difficulty, line correlation, and repeated comparisons can affect results. Displayed speed rounds to one decimal; decisions use raw values.`,
  highScoreComparisonDetails: (changePercent, pValue, minimumChange, significanceLevel) => `This comparison: median change ${changePercent}%, ${pValue.startsWith("<") ? `p${pValue}` : `p=${pValue}`}. An update requires a change of at least +${minimumChange}% and p<${significanceLevel}.`,
  returnTo: (destination) => `Return to ${destination}`,
  openPractice: "Return to practice",
  blockedPracticeInput: "Type the prompt with your keyboard.",
  remainingCharacters: (count) => `${count} characters remain in the prompt.`,
  noRecords: "There are no practice records to show.",
  practiceKind: "Practice type",
  all: "All",
  clearHistory: "Clear history",
  confirmClearHistory: "Clear practice records, session history, and high scores saved in this browser?",
  clearAllHistory: "Clear all records",
  cancel: "Cancel",
  historySaveFailed: "This result could not be saved. It remains available until you close the app.",
  historyClearFailed: "Could not clear records. Check this browser's storage settings.",
  historyCleared: "Practice records, session history, and high scores were cleared.",
  historyReadFailed: "Saved records could not be read. You can continue practicing.",
  sessionSaveFailed: "The session could not be saved. Your existing high score is unchanged.",
  highScoreDecisionFailed: "The session was saved, but its high score could not be evaluated. Your existing high score is unchanged.",
  highScoresCleared: "High scores were cleared.",
  sessionHistoryTitle: "Practice sessions",
  trendTitle: "Speed trend",
  trendScopeNote: "Completed sessions are compared only within the same mode, practice language, and one-line sentence count. The recent 100 sessions are used.",
  trendRecentAverage: (speed, sessions) => `${sessions}-session recent average: ${speed}`,
  trendChartLabel: (scope) => `Recent speed trend for ${scope}`,
  trendPointLabel: (date, speed) => `${date}: ${speed}`,
  trendRange: (earliest, latest) => `${earliest} → ${latest}`,
  trendInsufficientSessions: (count, minimum) => `At least ${minimum} completed sessions are needed to compare. ${count} available.`,
  highScoresTitle: "High scores",
  clearHighScores: "Clear high scores",
  confirmClearHighScores: "Clear only high scores? Practice history will be kept.",
  clearHighScoresAction: "Clear high scores only",
  sessionCompleted: "Completed",
  sessionEndedEarly: "Ended early",
  sessionSamples: (count) => `${count} speed samples`,
  highScoreScope: (mode, language, length) => `${mode} · ${language}${length === null ? "" : ` · ${length} lines`}`,
  accuracyValue: (value) => `Accuracy ${value}%`,
  challengeTitle: "30-second word challenge",
  challengeInstruction: "Type each Korean word and press Enter. Count how many you solve in 30 seconds.",
  challengePauseNotice: "The timer pauses while settings are open or the app window is inactive.",
  challengePaused: "The challenge is paused. It will resume when you return to the app.",
  challengeStart: "Start challenge",
  challengeResult: "Challenge result",
  timeEnded: "Time is up.",
  challengeStopped: "The challenge was stopped.",
  solvedWords: "Words solved",
  solvedWordCount: (count) => `${count} words`,
  elapsedTimeValue: (seconds) => `${seconds} sec`,
  retryChallenge: "Try again",
  remainingTime: (seconds) => `${seconds} sec remaining`,
  enterWord: "Type the word with your keyboard.",
  stopChallenge: "Stop",
  blockedWordInput: "Check that the prompt and your input match.",
  veniceTitle: "Venice",
  veniceInstruction: "Type words to defend the tower. When the top of a regular word reaches the red line, one tower block is damaged. Hitting a yellow special word triggers its effect; while infected, missed special words also damage the tower.",
  veniceCollisionLine: "Impact line · missed regular word: −1 block",
  veniceLevel: "Level",
  veniceRecommended: (level) => `Level ${level} recommended from recent runs`,
  veniceStart: "Start game",
  veniceReadyHint: "Use ↑/↓ to choose a start level · press 1–9 to jump · Enter to start · Esc for menu",
  veniceTargetCpm: "Target CPM",
  veniceScore: "Score",
  veniceTower: "Tower blocks",
  veniceStageProgress: (spawned, total) => `Regular words ${spawned} / ${total}`,
  veniceEndlessProgress: (spawned) => `Endless score run · ${spawned} regular words`,
  veniceInputLabel: "Type a visible word",
  veniceSubmit: "Submit word",
  veniceFinish: "Finish game",
  venicePaused: "Paused",
  venicePause: "Pause",
  veniceResume: "Resume game",
  veniceMismatch: "No visible word matches this input. Edit it and submit again.",
  veniceEffectLabel: (effect) => ({
    clear: "Clear falling words",
    freeze: "Freeze falling words",
    repair: "Repair tower +4",
    haste: "Speed up falling words",
    slow: "Slow falling words",
    hide: "Hide words briefly",
    swarm: "Spawn a word swarm",
    mine: "Place a mine",
    infection: "Block infection",
  }[effect] ?? "Special effect"),
  veniceInfectionActive: "Infected: missed viruses damage the tower until this level ends.",
  veniceResult: "Venice result",
  venicePlayAgain: "Play again at this level",
  veniceChooseLevel: "Choose another level",
  veniceStartLevel: "Start level",
  veniceHighestLevel: "Highest level",
  veniceTypedWords: "Words completed",
  veniceMissedWords: "Words missed",
  veniceTopScores: "Local Top 10 scores",
  veniceRank: "Rank",
  veniceDate: "Played",
  veniceNoScores: "There are no saved scores yet.",
  veniceSaveFailed: "The result could not be saved. It remains visible here.",
  veniceReadFailed: "Saved Venice records could not be read. The existing value was preserved.",
  passagePage: (page, total) => `Page ${page} / ${total}`,
  charactersSuffix: " characters",
  passageCurrentLine: "Current line",
  passageCompletedLine: "Completed line",
  passageNextLine: "Next line",
  passageBundleScore: "Completed bundle",
  genreLabel: (genre) => ({
    literature: "Literature",
    nonfiction: "Nonfiction",
    technology: "Technology",
    life: "Life",
    subculture: "Subculture",
  }[genre] ?? genre),
  licenseLabel: (license) => ({
    "public-domain": "Public domain",
    "cc-by-sa-4.0": "CC BY-SA 4.0",
  }[license] ?? ""),
  screenCaptureError: "Could not save the screen. Try again.",
  screenCaptureSuccess: "Saved the screen as a PNG.",
  screenCaptureUnsupported: "Screen capture is not supported in this browser.",
  dataTransferTitle: "Back up and restore data",
  dataTransferDescription: "Move settings, recent practice records, and Venice records in a local JSON file. Text currently being typed is never included.",
  thirdPartyNotices: "Copyright and third-party notices",
  backupExport: "Export backup",
  backupImport: "Import backup",
  backupContents: "The JSON backup includes saved settings and records only.",
  backupChooseFile: "Backup JSON file",
  backupFormatError: "This backup is damaged or uses an unsupported format. Existing data was not changed.",
  backupReadError: "Could not read the backup file. Check the file and try again.",
  backupExportSuccess: "Saved the backup file.",
  backupExportError: "Could not create or save the backup file.",
  backupConflict: "Saved data already exists. You can merge the imported records or replace all saved data.",
  backupMerge: "Merge",
  backupReplace: "Replace all",
  backupImportSuccess: "Merged the backup data.",
  backupReplaceSuccess: "Replaced saved data with the backup.",
  backupRestoreError: "Could not save the data. The previous values were restored.",
  backupCurrentDataError: "Current saved data is damaged and cannot be merged. Replace all data or cancel.",
  activityLabel: (id, fallback) => ({
    // The practice language is already chosen, so menu labels omit it.
    "ko-line": "One-line drills",
    "en-line": "One-line drills",
    "short-library": "Short passages",
    "long-library": "Long passages",
    games: "Games",
    challenge: "30-second word challenge",
    venice: "Venice",
    history: "Recent practice",
    settings: "Settings",
    "data-transfer": "Back up and restore data",
  }[id] ?? fallback),
  modeLabel: (mode) => ({ word: "Words", line: "One line", short: "Short passages", long: "Long passages", position: "Positions" }[mode] ?? mode),
};

export function interfaceText(language: Language): InterfaceText {
  return language === "en" ? en : ko;
}
